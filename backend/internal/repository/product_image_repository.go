package repository

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"gorm.io/gorm"
)

type ProductImageRepository struct {
	DB *gorm.DB
}

func NewProductImageRepository(db *gorm.DB) *ProductImageRepository {
	return &ProductImageRepository{DB: db}
}

func (r *ProductImageRepository) Create(image *domain.ProductImage) error {
	return r.DB.Create(image).Error
}
func (r *ProductImageRepository) Delete(id uint) error {
	return r.DB.Delete(&domain.ProductImage{}, id).Error
}