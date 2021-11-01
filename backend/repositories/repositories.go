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
