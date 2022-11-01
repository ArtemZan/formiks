package project

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
)

func NewProjectRepo(Conn *mongo.Database) repositories.ProjectRepo {
	return &projectRepo{
		Conn: Conn,
	}
}

type projectRepo struct {
	Conn *mongo.Database
}

func (r *projectRepo) Fetch(ctx context.Context, filter interface{}) ([]models.Project, error) {
	var projects []models.Project
	cursor, err := r.Conn.Collection("projects").Find(ctx, filter, options.Find().SetSort(bson.D{{"created", -1}}))
	if err != nil {
		return projects, err
	}
	err = cursor.All(ctx, &projects)
	return projects, err
}

func (r *projectRepo) FetchByID(ctx context.Context, id primitive.ObjectID) (models.Project, error) {
	var project models.Project
	result := r.Conn.Collection("projects").FindOne(ctx, bson.M{"_id": id})
	err := result.Decode(&project)
	return project, err
}

func (r *projectRepo) Create(ctx context.Context, project models.Project) (models.Project, error) {
	result, err := r.Conn.Collection("projects").InsertOne(ctx, project)
	if err == nil {
		project.ID = result.InsertedID.(primitive.ObjectID)
	}
	return project, err
}

func (r *projectRepo) Update(ctx context.Context, project models.Project) error {
	_, err := r.Conn.Collection("projects").ReplaceOne(ctx, bson.M{"_id": project.ID}, project)
	return err
}

func (r *projectRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.Conn.Collection("projects").DeleteOne(ctx, bson.M{"_id": id})
	return err
}
