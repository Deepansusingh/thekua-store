package config

import (
	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func AutoSeed(db *gorm.DB, log *logger.Logger) error {
	log.Infof("Auto-seeding database...")

	// 1. Create Admin User
	adminEmail := "shristi@gmail.com"
	var existingAdmin domain.User
	if err := db.Where("email = ?", adminEmail).First(&existingAdmin).Error; err != nil {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("shristi"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		admin := domain.User{
			Name:     "shristi",
			Email:    adminEmail,
			Phone:    "9999999999",
			Password: string(hashedPassword),
			Role:     domain.RoleAdmin,
		}

		if err := db.Create(&admin).Error; err != nil {
			return err
		}
		log.Infof("- Admin user created (Email: %s, Password: shristi)", adminEmail)
	} else {
		log.Infof("- Admin user already exists")
	}

	// 2. Create Products, Variants, and Images
	products := []domain.Product{
		{
			Name:        "Classic Wheat Thekua",
			Slug:        "classic-wheat-thekua",
			Description: "Traditional homemade wheat thekua made with pure ghee, whole wheat flour, and organic jaggery.",
			Category:    "Classic",
			IsFeatured:  true,
			Variants: []domain.ProductVariant{
				{Weight: "500g", Price: 250.00, Stock: 100},
				{Weight: "1kg", Price: 480.00, Stock: 50},
			},
			Images: []domain.ProductImage{
				{ImageURL: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500", AltText: "Classic Wheat Thekua", IsMain: true},
			},
		},
		{
			Name:        "Dry Fruit Thekua",
			Slug:        "dry-fruit-thekua",
			Description: "Premium thekua enriched with almonds, cashews, raisins, and a hint of cardamom.",
			Category:    "Premium",
			IsFeatured:  true,
			Variants: []domain.ProductVariant{
				{Weight: "250g", Price: 180.00, Stock: 150},
				{Weight: "500g", Price: 340.00, Stock: 80},
				{Weight: "1kg", Price: 650.00, Stock: 40},
			},
			Images: []domain.ProductImage{
				{ImageURL: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500", AltText: "Dry Fruit Thekua", IsMain: true},
			},
		},
		{
			Name:        "Sugar-Free Thekua",
			Slug:        "sugar-free-thekua",
			Description: "Healthy alternative made with organic stevia and mixed dry fruits, perfect for diabetic-friendly cravings.",
			Category:    "Healthy",
			IsFeatured:  false,
			Variants: []domain.ProductVariant{
				{Weight: "500g", Price: 290.00, Stock: 60},
			},
			Images: []domain.ProductImage{
				{ImageURL: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500", AltText: "Sugar-Free Thekua", IsMain: true},
			},
		},
		{
			Name:        "Premium Kesariya Thekua",
			Slug:        "premium-kesariya-thekua",
			Description: "Exquisite handmade thekua infused with rich saffron (Kesar) strands, premium pistachios, and pure country ghee.",
			Category:    "Premium",
			IsFeatured:  true,
			Variants: []domain.ProductVariant{
				{Weight: "250g", Price: 220.00, Stock: 80},
				{Weight: "500g", Price: 420.00, Stock: 50},
			},
			Images: []domain.ProductImage{
				{ImageURL: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500", AltText: "Premium Kesariya Thekua", IsMain: true},
			},
		},
	}

	for _, p := range products {
		var existingProduct domain.Product
		if err := db.Where("slug = ?", p.Slug).Preload("Images").First(&existingProduct).Error; err != nil {
			if err := db.Create(&p).Error; err != nil {
				log.Errorf("Failed to seed product %s: %v", p.Name, err)
			} else {
				log.Infof("- Seeded product: %s", p.Name)
			}
		} else {
			log.Infof("- Product already exists: %s. Syncing main image URL...", p.Name)
			if len(p.Images) > 0 && len(existingProduct.Images) > 0 {
				db.Model(&existingProduct.Images[0]).Update("image_url", p.Images[0].ImageURL)
			}
		}
	}

	log.Infof("Database seeded successfully!")
	return nil
}
