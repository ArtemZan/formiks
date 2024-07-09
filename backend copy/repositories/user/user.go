package user

import (
	"context"

	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewUserRepo(Conn *mongo.Database) repositories.UserRepo {
	return &userRepo{
		Conn: Conn,
	}
}

type userRepo struct {
	Conn *mongo.Database
}

func (u *userRepo) Fetch(ctx context.Context, filter interface{}) ([]models.User, error) {
	var users []models.User
	cursor, err := u.Conn.Collection("users").Find(ctx, filter)
	if err != nil {
		return users, err
	}
	err = cursor.All(ctx, &users)
	return users, err
}

func (u *userRepo) FetchByEmail(ctx context.Context, email string) (models.User, error) {
	var user models.User
	result := u.Conn.Collection("users").FindOne(ctx, bson.M{"email": email})
	err := result.Decode(&user)
	return user, err
}

func (u *userRepo) Create(ctx context.Context, user models.User) (models.User, error) {
	result, err := u.Conn.Collection("users").InsertOne(ctx, user)
	if err == nil {
		user.ID = result.InsertedID.(primitive.ObjectID)
	}
	return user, err
}

func (u *userRepo) Update(ctx context.Context, user models.User) error {
	_, err := u.Conn.Collection("users").UpdateByID(ctx, user.ID, user)
	return err
}

func (u *userRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := u.Conn.Collection("users").DeleteOne(ctx, bson.M{"_id": id})
	return err
}
