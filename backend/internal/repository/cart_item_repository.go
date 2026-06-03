package repository

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"gorm.io/gorm"
)

type CartItemRepository struct {
	DB *gorm.DB
}

func NewCartItemRepository(db *gorm.DB) *CartItemRepository {
	return &CartItemRepository{DB: db}
}

func (r *CartItemRepository) Create(item *domain.CartItem) error {
	return r.DB.Create(item).Error
}
func (r *CartItemRepository) ListByCartID(cartID uint) ([]domain.CartItem, error) {
	var items []domain.CartItem

	err := r.DB.
		Where("cart_id = ?", cartID).
		Preload("Variant").
		Find(&items).
		Error

	return items, err
}

func (r *CartItemRepository) GetByID(id uint) (*domain.CartItem, error) {
	var item domain.CartItem

	err := r.DB.First(&item, id).Error

	return &item, err
}

func (r *CartItemRepository) Update(item *domain.CartItem) error {
	return r.DB.Save(item).Error
}

func (r *CartItemRepository) Delete(id uint) error {
	return r.DB.Delete(&domain.CartItem{}, id).Error
}

func (r *CartItemRepository) DeleteByCartID(cartID uint) error {
	return r.DB.
		Where("cart_id = ?", cartID).
		Delete(&domain.CartItem{}).
		Error
}
