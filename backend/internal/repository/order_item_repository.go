package repository

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"gorm.io/gorm"
)

type OrderItemRepository struct {
	DB *gorm.DB
}

func NewOrderItemRepository(db *gorm.DB) *OrderItemRepository {
	return &OrderItemRepository{DB: db}
}

func (r *OrderItemRepository) Create(item *domain.OrderItem) error {
	return r.DB.Create(item).Error
}