package submission

import (
	"context"

	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewSubmissionRepo(Conn *mongo.Database) repositories.SubmissionRepo {
	return &submissionRepo{
		Conn: Conn,
	}
}

type submissionRepo struct {
	Conn *mongo.Database
}

func (r *submissionRepo) Fetch(ctx context.Context, filter interface{}) ([]models.Submission, error) {
	var submissions []models.Submission
	cursor, err := r.Conn.Collection("submissions").Find(ctx, filter)
	if err != nil {
		return submissions, err
	}
	err = cursor.All(ctx, &submissions)
	return submissions, err
}

func (r *submissionRepo) FetchByID(ctx context.Context, id primitive.ObjectID) (models.Submission, error) {
	var submission models.Submission
	result := r.Conn.Collection("submissions").FindOne(ctx, bson.M{"_id": id})
	err := result.Decode(&submission)
	return submission, err
}

func (r *submissionRepo) Create(ctx context.Context, submission models.Submission) (models.Submission, error) {
	result, err := r.Conn.Collection("submissions").InsertOne(ctx, submission)
	if err == nil {
		submission.ID = result.InsertedID.(primitive.ObjectID)
	}
	return submission, err
}

func (r *submissionRepo) Update(ctx context.Context, submission models.Submission) error {
	_, err := r.Conn.Collection("submissions").ReplaceOne(ctx, bson.M{"_id": submission.ID}, submission)
	return err
}

func (r *submissionRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.Conn.Collection("submissions").DeleteOne(ctx, bson.M{"_id": id})
	return err
}
