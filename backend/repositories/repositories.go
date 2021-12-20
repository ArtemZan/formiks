package repositories

import (
	"context"

	"github.com/doublegrey/formiks/backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProjectRepo interface {
	Fetch(ctx context.Context, filter interface{}) ([]models.Project, error)
	FetchByID(ctx context.Context, id primitive.ObjectID) (models.Project, error)
	Create(ctx context.Context, project models.Project) (models.Project, error)
	Update(ctx context.Context, project models.Project) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}

type SubmissionRepo interface {
	FetchVendorTable(ctx context.Context) (models.VendorTable, error)
	UpdateVendorTable(ctx context.Context, data models.VendorTable) error
	Fetch(ctx context.Context, filter interface{}) ([]models.Submission, error)
	FetchByID(ctx context.Context, id primitive.ObjectID) (models.Submission, error)
	Create(ctx context.Context, submission models.Submission) (models.Submission, error)
	Update(ctx context.Context, submission models.Submission) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}

type UserRepo interface {
	Fetch(ctx context.Context, filter interface{}) ([]models.User, error)
	FetchByEmail(ctx context.Context, email string) (models.User, error)
	Create(ctx context.Context, user models.User) (models.User, error)
	Update(ctx context.Context, user models.User) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}
