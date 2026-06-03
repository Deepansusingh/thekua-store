package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Config struct {
	App      AppConfig
	Database DatabaseConfig
	JWT      JWTConfig
	CORS     CORSConfig
}

type AppConfig struct {
	Env  string
	Name string
	Port int
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	Secret string
	Expiry time.Duration
}

type CORSConfig struct {
	AllowedOrigins []string
}

func LoadConfig(log *logger.Logger) *Config {
	dbPort, _ := strconv.Atoi(getEnv("DB_PORT", "5432"))
	appPort, _ := strconv.Atoi(getEnv("APP_PORT", "8080"))
	jwtExpiry, _ := time.ParseDuration(getEnv("JWT_EXPIRY", "24h"))

	return &Config{
		App: AppConfig{
			Env:  getEnv("APP_ENV", "development"),
			Name: getEnv("APP_NAME", "Thekua Store"),
			Port: appPort,
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     dbPort,
			User:     getEnv("DB_USER", "thekua_user"),
			Password: getEnv("DB_PASSWORD", "thekua_password_123"),
			DBName:   getEnv("DB_NAME", "thekua_store"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
			Expiry: jwtExpiry,
		},
		CORS: CORSConfig{
			AllowedOrigins: []string{getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")},
		},
	}
}

func InitDB(cfg *Config, log *logger.Logger) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Infof("Database connected successfully")
	return db, nil
}

func RunMigrations(db *gorm.DB, log *logger.Logger) error {
	// AutoMigrate will create tables if they don't exist
	err := db.AutoMigrate(
		&domain.User{},
		&domain.Address{},
		&domain.Product{},
		&domain.ProductImage{},
		&domain.ProductVariant{},
		&domain.Cart{},
		&domain.CartItem{},
		&domain.Order{},
		&domain.OrderItem{},
		&domain.Payment{},
	)
	if err != nil {
		return fmt.Errorf("failed to run auto migration: %w", err)
	}
	log.Infof("Migrations completed")
	return nil
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}
