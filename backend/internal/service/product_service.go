package service

import (
	"fmt"

	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"github.com/Deepansusingh/thekua-store/backend/internal/dto"
	"github.com/Deepansusingh/thekua-store/backend/internal/repository"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
)

type ProductService interface {
	CreateProduct(req *dto.CreateProductRequest) (*domain.Product, error)
	UpdateProduct(id uint, req *dto.UpdateProductRequest) (*domain.Product, error)
	DeleteProduct(id uint) error
	GetProduct(id uint) (*domain.Product, error)
	ListProducts(limit, offset int) ([]domain.Product, error)
	ListFeaturedProducts() ([]domain.Product, error)
	CreateVariant(productID uint, req *dto.ProductVariantRequest) (*domain.ProductVariant, error)
	UpdateVariant(variantID uint, req *dto.ProductVariantRequest) (*domain.ProductVariant, error)
	DeleteVariant(variantID uint) error
	UploadProductImage(productID uint, req *dto.ProductImageRequest) (*domain.ProductImage, error)
	DeleteProductImage(imageID uint) error
}

type productService struct {
	productRepo *repository.ProductRepository
	variantRepo *repository.ProductVariantRepository
	imageRepo   *repository.ProductImageRepository
	log         *logger.Logger
}

func NewProductService(
	productRepo *repository.ProductRepository,
	variantRepo *repository.ProductVariantRepository,
	imageRepo *repository.ProductImageRepository,
	log *logger.Logger,
) ProductService {
	return &productService{
		productRepo: productRepo,
		variantRepo: variantRepo,
		imageRepo:   imageRepo,
		log:         log,
	}
}

func (s *productService) CreateProduct(req *dto.CreateProductRequest) (*domain.Product, error) {
	product := &domain.Product{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		Category:    req.Category,
		IsFeatured:  req.IsFeatured,
	}

	if err := s.productRepo.Create(product); err != nil {
		s.log.Errorf("Failed to create product: %v", err)
		return nil, fmt.Errorf("failed to create product")
	}

	s.log.Infof("Product created: %s", req.Name)
	return product, nil
}

func (s *productService) UpdateProduct(id uint, req *dto.UpdateProductRequest) (*domain.Product, error) {
	product, err := s.productRepo.GetByID(id)
	if err != nil {
		s.log.Warnf("Product not found: %d", id)
		return nil, fmt.Errorf("product not found")
	}

	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if req.Category != "" {
		product.Category = req.Category
	}
	product.IsFeatured = req.IsFeatured

	if err := s.productRepo.Update(product); err != nil {
		s.log.Errorf("Failed to update product: %v", err)
		return nil, fmt.Errorf("failed to update product")
	}

	s.log.Infof("Product updated: %d", id)
	return product, nil
}

func (s *productService) DeleteProduct(id uint) error {
	if err := s.productRepo.Delete(id); err != nil {
		s.log.Errorf("Failed to delete product: %v", err)
		return fmt.Errorf("failed to delete product")
	}

	s.log.Infof("Product deleted: %d", id)
	return nil
}

func (s *productService) GetProduct(id uint) (*domain.Product, error) {
	product, err := s.productRepo.GetByID(id)
	if err != nil {
		s.log.Warnf("Product not found: %d", id)
		return nil, fmt.Errorf("product not found")
	}
	return product, nil
}

func (s *productService) ListProducts(limit, offset int) ([]domain.Product, error) {
	products, err := s.productRepo.List(limit, offset)
	if err != nil {
		s.log.Errorf("Failed to list products: %v", err)
		return nil, fmt.Errorf("failed to list products")
	}
	return products, nil
}

func (s *productService) ListFeaturedProducts() ([]domain.Product, error) {
	products, err := s.productRepo.ListFeatured()
	if err != nil {
		s.log.Errorf("Failed to list featured products: %v", err)
		return nil, fmt.Errorf("failed to list featured products")
	}
	return products, nil
}

func (s *productService) CreateVariant(productID uint, req *dto.ProductVariantRequest) (*domain.ProductVariant, error) {
	// Verify product exists
	_, err := s.productRepo.GetByID(productID)
	if err != nil {
		return nil, fmt.Errorf("product not found")
	}

	variant := &domain.ProductVariant{
		ProductID: productID,
		Weight:    req.Weight,
		Price:     req.Price,
		Stock:     req.Stock,
	}

	if err := s.variantRepo.Create(variant); err != nil {
		s.log.Errorf("Failed to create variant: %v", err)
		return nil, fmt.Errorf("failed to create variant")
	}

	s.log.Infof("Variant created for product: %d", productID)
	return variant, nil
}

func (s *productService) UpdateVariant(variantID uint, req *dto.ProductVariantRequest) (*domain.ProductVariant, error) {
	variant, err := s.variantRepo.GetByID(variantID)
	if err != nil {
		s.log.Warnf("Variant not found: %d", variantID)
		return nil, fmt.Errorf("variant not found")
	}

	variant.Weight = req.Weight
	variant.Price = req.Price
	variant.Stock = req.Stock

	if err := s.variantRepo.Update(variant); err != nil {
		s.log.Errorf("Failed to update variant: %v", err)
		return nil, fmt.Errorf("failed to update variant")
	}

	s.log.Infof("Variant updated: %d", variantID)
	return variant, nil
}

func (s *productService) DeleteVariant(variantID uint) error {
	if err := s.variantRepo.Delete(variantID); err != nil {
		s.log.Errorf("Failed to delete variant: %v", err)
		return fmt.Errorf("failed to delete variant")
	}

	s.log.Infof("Variant deleted: %d", variantID)
	return nil
}

func (s *productService) UploadProductImage(productID uint, req *dto.ProductImageRequest) (*domain.ProductImage, error) {
	// Verify product exists
	_, err := s.productRepo.GetByID(productID)
	if err != nil {
		return nil, fmt.Errorf("product not found")
	}

	image := &domain.ProductImage{
		ProductID: productID,
		ImageURL:  req.ImageURL,
		AltText:   req.AltText,
		IsMain:    req.IsMain,
	}

	if err := s.imageRepo.Create(image); err != nil {
		s.log.Errorf("Failed to upload image: %v", err)
		return nil, fmt.Errorf("failed to upload image")
	}

	s.log.Infof("Image uploaded for product: %d", productID)
	return image, nil
}

func (s *productService) DeleteProductImage(imageID uint) error {
	if err := s.imageRepo.Delete(imageID); err != nil {
		s.log.Errorf("Failed to delete image: %v", err)
		return fmt.Errorf("failed to delete image")
	}

	s.log.Infof("Image deleted: %d", imageID)
	return nil
}
