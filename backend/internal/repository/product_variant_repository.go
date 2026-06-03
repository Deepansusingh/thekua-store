package repository

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"gorm.io/gorm"
)

type ProductVariantRepository struct {
	DB *gorm.DB
}

func NewProductVariantRepository(db *gorm.DB) *ProductVariantRepository {
	return &ProductVariantRepository{DB: db}
}

func (r *ProductVariantRepository) Create(variant *domain.ProductVariant) error {
	return r.DB.Create(variant).Error
}

func (r *ProductVariantRepository) FindByID(id uint) (*domain.ProductVariant, error) {
	var variant domain.ProductVariant
	err := r.DB.First(&variant, id).Error
	return &variant, err
}

func (r *ProductVariantRepository) GetByID(id uint) (*domain.ProductVariant, error) {
	var variant domain.ProductVariant

	err := r.DB.First(&variant, id).Error

	return &variant, err
}

func (r *ProductVariantRepository) Update(variant *domain.ProductVariant) error {
	return r.DB.Save(variant).Error
}

func (r *ProductVariantRepository) Delete(id uint) error {
	return r.DB.Delete(&domain.ProductVariant{}, id).Error
}