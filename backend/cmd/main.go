package main

import (
	"fmt"
	"log"
	"os"

	"github.com/Deepansusingh/thekua-store/backend/internal/config"
	"github.com/Deepansusingh/thekua-store/backend/internal/handler"
	"github.com/Deepansusingh/thekua-store/backend/internal/middleware"
	"github.com/Deepansusingh/thekua-store/backend/internal/repository"
	"github.com/Deepansusingh/thekua-store/backend/internal/service"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize logger
	log := logger.NewLogger(os.Getenv("LOG_LEVEL"))
	defer log.Sync()

	// Load configuration
	cfg := config.LoadConfig(log)

	// Initialize database
	db, err := config.InitDB(cfg, log)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Run migrations
	if err := config.RunMigrations(db, log); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Auto-seed database if empty
	var userCount int64
	if err := db.Table("users").Count(&userCount).Error; err == nil && userCount == 0 {
		if err := config.AutoSeed(db, log); err != nil {
			log.Errorf("Auto-seeding database failed: %v", err)
		}
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	productRepo := repository.NewProductRepository(db)
	productVariantRepo := repository.NewProductVariantRepository(db)
	productImageRepo := repository.NewProductImageRepository(db)
	cartRepo := repository.NewCartRepository(db)
	cartItemRepo := repository.NewCartItemRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	orderItemRepo := repository.NewOrderItemRepository(db)
	addressRepo := repository.NewAddressRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, cfg.JWT.Secret, cfg.JWT.Expiry, log)
	productService := service.NewProductService(productRepo, productVariantRepo, productImageRepo, log)
	cartService := service.NewCartService(cartRepo, cartItemRepo, productVariantRepo, log)
	orderService := service.NewOrderService(orderRepo, orderItemRepo, cartItemRepo, productVariantRepo, addressRepo, log)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService, log)
	productHandler := handler.NewProductHandler(productService, log)
	cartHandler := handler.NewCartHandler(cartService, log)
	orderHandler := handler.NewOrderHandler(orderService, log)
	adminHandler := handler.NewAdminHandler(productService, orderService, log)

	// Setup Gin router
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	router := gin.Default()
	router.Use(middleware.CORSMiddleware())

	// Setup routes
	setupRoutes(router, authHandler, productHandler, cartHandler, orderHandler, adminHandler, cfg)

	// Start server
	addr := fmt.Sprintf(":%d", cfg.App.Port)
	log.Infof("Starting Thekua Store API on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRoutes(
	router *gin.Engine,
	authHandler *handler.AuthHandler,
	productHandler *handler.ProductHandler,
	cartHandler *handler.CartHandler,
	orderHandler *handler.OrderHandler,
	adminHandler *handler.AdminHandler,
	cfg *config.Config,
) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})

	// API routes
	api := router.Group("/api")

	// Auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/admin-login", authHandler.AdminLogin)
	}

	// Product routes
	products := api.Group("/products")
	{
		products.GET("", productHandler.ListProducts)
		products.GET("/:id", productHandler.GetProduct)
	}

	// Cart routes
	cart := api.Group("/cart")
	{
		cart.POST("/add", cartHandler.AddToCart)
		cart.GET("/items", cartHandler.GetCartItems)
		cart.PUT("/items/:itemID", cartHandler.UpdateCartItem)
		cart.DELETE("/items/:itemID", cartHandler.RemoveFromCart)
		cart.DELETE("/clear", cartHandler.ClearCart)
	}

	// Order routes
	orders := api.Group("/orders")
	{
		orders.POST("", orderHandler.CreateOrder)
		orders.GET("/customer", orderHandler.ListCustomerOrders)
		orders.GET("/:id", orderHandler.GetOrder)
		orders.GET("/track/:orderNumber", orderHandler.TrackOrder)
	}

	// Admin routes
	admin := api.Group("/admin")
	{
		// Product management
		products := admin.Group("/products")
		{
			products.POST("", adminHandler.CreateProduct)
			products.PUT("/:id", adminHandler.UpdateProduct)
			products.DELETE("/:id", adminHandler.DeleteProduct)
			products.POST("/:id/images", adminHandler.UploadProductImage)
			products.POST("/:id/variants", adminHandler.CreateProductVariant)
			products.PUT("/variants/:variantID", adminHandler.UpdateProductVariant)
			products.DELETE("/variants/:variantID", adminHandler.DeleteProductVariant)
		}

		// Order management
		orders := admin.Group("/orders")
		{
			orders.GET("", adminHandler.ListOrders)
			orders.GET("/:id", adminHandler.GetOrder)
			orders.PUT("/:id/status", adminHandler.UpdateOrderStatus)
		}

		// Customer management
		customers := admin.Group("/customers")
		{
			customers.GET("", adminHandler.ListCustomers)
			customers.GET("/:id", adminHandler.GetCustomer)
			customers.GET("/:id/orders", adminHandler.GetCustomerOrders)
		}
	}
}
