package repository

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"gorm.io/gorm"
)

type CartRepository struct {
	DB *gorm.DB
}

func NewCartRepository(db *gorm.DB) *CartRepository {
	return &CartRepository{DB: db}
}

func (r *CartRepository) Create(cart *domain.Cart) error {
	return r.DB.Create(cart).Error
}

func (r *CartRepository) FindByID(id uint) (*domain.Cart, error) {
	var cart domain.Cart
	err := r.DB.Preload("Items").First(&cart, id).Error
	return &cart, err
}
func (r *CartRepository) GetByUserID(userID uint) (*domain.Cart, error) {
	var cart domain.Cart

	err := r.DB.
		Where("user_id = ?", userID).
		First(&cart).
		Error

	return &cart, err
}

func (r *CartRepository) GetBySessionID(sessionID string) (*domain.Cart, error) {
	var cart domain.Cart

	err := r.DB.
		Where("session_id = ?", sessionID).
		First(&cart).
		Error

	return &cart, err
}