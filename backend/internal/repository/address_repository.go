package repository

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"gorm.io/gorm"
)

type AddressRepository struct {
	DB *gorm.DB
}

func NewAddressRepository(db *gorm.DB) *AddressRepository {
	return &AddressRepository{DB: db}
}

func (r *AddressRepository) Create(address *domain.Address) error {
	return r.DB.Create(address).Error
}

func (r *AddressRepository) FindByUserID(userID uint) ([]domain.Address, error) {
	var addresses []domain.Address

	err := r.DB.
		Where("user_id = ?", userID).
		Find(&addresses).
		Error

	return addresses, err
}