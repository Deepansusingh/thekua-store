package repository

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"

	"gorm.io/gorm"
)

type OrderRepository struct {
	DB *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{DB: db}
}

func (r *OrderRepository) Create(order *domain.Order) error {
	return r.DB.Create(order).Error
}

func (r *OrderRepository) FindByOrderNumber(orderNumber string) (*domain.Order, error) {
	var order domain.Order

	err := r.DB.
		Where("order_number = ?", orderNumber).
		First(&order).
		Error

	return &order, err
}

func (r *OrderRepository) GetByID(id uint) (*domain.Order, error) {
	var order domain.Order

	err := r.DB.
		Preload("Items").
		First(&order, id).
		Error

	return &order, err
}

func (r *OrderRepository) GetByOrderNumber(orderNumber string) (*domain.Order, error) {
	var order domain.Order

	err := r.DB.
		Preload("Items").
		Where("order_number = ?", orderNumber).
		First(&order).
		Error

	return &order, err
}

func (r *OrderRepository) Update(order *domain.Order) error {
	return r.DB.Save(order).Error
}

func (r *OrderRepository) List(limit, offset int) ([]domain.Order, error) {
	var orders []domain.Order

	err := r.DB.
		Limit(limit).
		Offset(offset).
		Find(&orders).
		Error

	return orders, err
}

func (r *OrderRepository) ListByUserID(userID uint, limit, offset int) ([]domain.Order, error) {
	var orders []domain.Order

	err := r.DB.
		Where("user_id = ?", userID).
		Limit(limit).
		Offset(offset).
		Find(&orders).
		Error

	return orders, err
}

func (r *OrderRepository) ListByEmail(email string, limit, offset int) ([]domain.Order, error) {
	var orders []domain.Order

	err := r.DB.
		Preload("Items").
		Where("customer_email = ?", email).
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&orders).
		Error

	return orders, err
}