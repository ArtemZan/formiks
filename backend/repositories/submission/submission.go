package submission

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
	"github.com/patrickmn/go-cache"
)

func NewSubmissionRepo(Conn *mongo.Database) repositories.SubmissionRepo {
	return &submissionRepo{
		Conn:  Conn,
		Cache: cache.New(5*time.Minute, 10*time.Minute),
	}
}

type submissionRepo struct {
	Conn  *mongo.Database
	Cache *cache.Cache
}

func (r *submissionRepo) FetchVendorTablePresets(ctx context.Context) ([]models.VendorTablePreset, error) {
	presets := make([]models.VendorTablePreset, 0)
	cursor, err := r.Conn.Collection("presets").Find(ctx, bson.M{})
	if err != nil {
		return presets, err
	}
	err = cursor.All(ctx, &presets)
	return presets, err
}

func (r *submissionRepo) UpsertVendorTablePreset(ctx context.Context, data models.VendorTablePreset) error {
	upsert := true
	data.Name = "vendorTable"
	_, err := r.Conn.Collection("presets").ReplaceOne(ctx, bson.M{"name": "vendorTable"}, data, &options.ReplaceOptions{Upsert: &upsert})
	return err
}

func (r *submissionRepo) Fetch(ctx context.Context, filter interface{}) ([]models.Submission, error) {
	cacheID := "fetch"
	if f, ok := filter.(bson.M)["project"]; ok {
		cacheID = fmt.Sprintf("%s.%v", cacheID, f)
	}

	if v, hit := r.Cache.Get(cacheID); hit {
		if submissions, ok := v.([]models.Submission); ok {
			return submissions, nil
		}
	}

	submissions := make([]models.Submission, 0)
	cursor, err := r.Conn.Collection("submissions").Find(ctx, filter, options.Find().SetSort(bson.D{{"created", -1}}))
	if err != nil {
		return submissions, err
	}
	err = cursor.All(ctx, &submissions)
	r.Cache.Set(cacheID, submissions, cache.DefaultExpiration)
	return submissions, err
}

func (r *submissionRepo) FetchByID(ctx context.Context, id primitive.ObjectID) (models.Submission, error) {
	cacheID := fmt.Sprintf("fetchByID.%s", id.Hex())

	if v, hit := r.Cache.Get(cacheID); hit {
		if submission, ok := v.(models.Submission); ok {
			return submission, nil
		}
	}

	var submission models.Submission
	result := r.Conn.Collection("submissions").FindOne(ctx, bson.M{"_id": id})
	err := result.Decode(&submission)
	r.Cache.Set(cacheID, submission, cache.DefaultExpiration)
	return submission, err
}

func (r *submissionRepo) FetchByIDWithChildren(ctx context.Context, id primitive.ObjectID) (models.SubmissionWithChildren, error) {
	cacheID := fmt.Sprintf("fetchByIDWithChildren.%s", id.Hex())

	if v, hit := r.Cache.Get(cacheID); hit {
		if submission, ok := v.(models.SubmissionWithChildren); ok {
			return submission, nil
		}
	}

	var response models.SubmissionWithChildren
	subs := make([]models.Submission, 0)
	cursor, err := r.Conn.Collection("submissions").Find(ctx, bson.M{"$or": []bson.M{{"_id": id}, {"parentId": id.Hex()}}})
	if err != nil {
		return response, err
	}
	err = cursor.All(ctx, &subs)
	if err != nil {
		return response, err
	}

	for _, s := range subs {
		if s.ParentID == nil {
			response.Submission = s
		} else {
			response.Children = append(response.Children, s)
		}
	}
	r.Cache.Set(cacheID, response, cache.DefaultExpiration)
	return response, nil
}

func (r *submissionRepo) Create(ctx context.Context, submission models.Submission) (models.Submission, error) {
	r.Cache.Flush()

	result, err := r.Conn.Collection("submissions").InsertOne(ctx, submission)
	if err == nil {
		submission.ID = result.InsertedID.(primitive.ObjectID)
	}
	return submission, err
}

func (r *submissionRepo) Update(ctx context.Context, submission models.Submission) error {
	r.Cache.Flush()

	_, err := r.Conn.Collection("submissions").ReplaceOne(ctx, bson.M{"_id": submission.ID}, submission)
	return err
}

func (r *submissionRepo) PartialUpdate(ctx context.Context, filter, update interface{}) error {
	r.Cache.Flush()

	_, err := r.Conn.Collection("submissions").UpdateOne(ctx, filter, update)
	return err
}

func (r *submissionRepo) Delete(ctx context.Context, id primitive.ObjectID, children bool) error {
	r.Cache.Flush()

	_, err := r.Conn.Collection("submissions").DeleteOne(ctx, bson.M{"_id": id})
	if children && err == nil {
		_, err = r.Conn.Collection("submissions").DeleteMany(ctx, bson.M{"parentId": id})
	}
	return err
}

func (r *submissionRepo) Exists(ctx context.Context, filter bson.M) bool {
	result, _ := r.Conn.Collection("submissions").CountDocuments(ctx, filter, options.Count().SetLimit(1))
	return result > 0
}

func (r *submissionRepo) ExistsAny(ctx context.Context, projectNumbers []string) bool {
	result, _ := r.Conn.Collection("submissions").CountDocuments(ctx, bson.M{"data.projectNumber": bson.M{"$in": projectNumbers}}, options.Count().SetLimit(1))
	return result > 0
}
