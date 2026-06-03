package repository

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"

	"gorm.io/gorm"
)

type UserRepository struct {
	DB *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) Create(user *domain.User) error {
	return r.DB.Create(user).Error
}

func (r *UserRepository) FindByEmail(email string) (*domain.User, error) {
	var user domain.User

	err := r.DB.
		Where("email = ?", email).
		First(&user).
		Error

	return &user, err
}

func (r *UserRepository) FindByID(id uint) (*domain.User, error) {
	var user domain.User

	err := r.DB.
		First(&user, id).
		Error

	return &user, err
}

func (r *UserRepository) GetByEmail(email string) (*domain.User, error) {
	var user domain.User

	err := r.DB.
		Where("email = ?", email).
		First(&user).
		Error

	return &user, err
}
