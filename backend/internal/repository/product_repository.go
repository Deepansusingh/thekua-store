package repository

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"

	"gorm.io/gorm"
)

type ProductRepository struct {
	DB *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{DB: db}
}

func (r *ProductRepository) Create(product *domain.Product) error {
	return r.DB.Create(product).Error
}

func (r *ProductRepository) FindAll() ([]domain.Product, error) {
	var products []domain.Product

	err := r.DB.
		Preload("Variants").
		Preload("Images").
		Find(&products).
		Error

	return products, err
}

func (r *ProductRepository) FindByID(id uint) (*domain.Product, error) {
	var product domain.Product

	err := r.DB.
		Preload("Variants").
		Preload("Images").
		First(&product, id).
		Error

	return &product, err
}

func (r *ProductRepository) GetByID(id uint) (*domain.Product, error) {
	var product domain.Product

	err := r.DB.
		Preload("Variants").
		Preload("Images").
		First(&product, id).
		Error

	return &product, err
}

func (r *ProductRepository) Update(product *domain.Product) error {
	return r.DB.Save(product).Error
}

func (r *ProductRepository) Delete(id uint) error {
	return r.DB.Delete(&domain.Product{}, id).Error
}

func (r *ProductRepository) List(limit, offset int) ([]domain.Product, error) {
	var products []domain.Product

	err := r.DB.
		Preload("Variants").
		Preload("Images").
		Limit(limit).
		Offset(offset).
		Find(&products).
		Error

	return products, err
}

func (r *ProductRepository) ListFeatured() ([]domain.Product, error) {
	var products []domain.Product

	err := r.DB.
		Where("is_featured = ?", true).
		Preload("Variants").
		Preload("Images").
		Find(&products).
		Error

	return products, err
}