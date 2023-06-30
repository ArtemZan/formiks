package repositories

import (
	"context"

	"github.com/doublegrey/formiks/backend/models"
	"go.mongodb.org/mongo-driver/bson"
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
	FetchVendorTablePresets(ctx context.Context) ([]models.VendorTablePreset, error)
	UpsertVendorTablePreset(ctx context.Context, preset models.VendorTablePreset) error
	Fetch(ctx context.Context, filter interface{}) ([]models.Submission, error)
	FetchByID(ctx context.Context, id primitive.ObjectID) (models.Submission, error)
	FetchByIDWithChildren(ctx context.Context, id primitive.ObjectID) (models.SubmissionWithChildren, error)
	Create(ctx context.Context, submission models.Submission) (models.Submission, error)
	CreateViews(ctx context.Context, submission models.SubmissionWithChildren) (models.SubmissionWithChildren, error)
	DeleteViews(ctx context.Context, id string) error
	Update(ctx context.Context, submission models.Submission) error
	PartialUpdate(ctx context.Context, filter, update interface{}) error
	Delete(ctx context.Context, id primitive.ObjectID, children bool) error
	Exists(ctx context.Context, filter bson.M) bool
	ExistsAny(ctx context.Context, projectNumbers []string) bool
}

type ReprotRepo interface {
	FetchPAreport(ctx context.Context) ([]models.PAreport2, error)
}

type UserRepo interface {
	Fetch(ctx context.Context, filter interface{}) ([]models.User, error)
	FetchByEmail(ctx context.Context, email string) (models.User, error)
	Create(ctx context.Context, user models.User) (models.User, error)
	Update(ctx context.Context, user models.User) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}
