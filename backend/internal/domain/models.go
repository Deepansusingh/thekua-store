package domain

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// User model
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Phone     string    `json:"phone"`
	Password  string    `json:"-"`
	Role      UserRole  `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type UserRole string

const (
	RoleCustomer UserRole = "customer"
	RoleAdmin    UserRole = "admin"
)

// Address model
type Address struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	UserID   uint      `json:"user_id"`
	FullName string    `json:"full_name"`
	Phone    string    `json:"phone"`
	Street   string    `json:"street"`
	City     string    `json:"city"`
	State    string    `json:"state"`
	Pincode  string    `json:"pincode"`
	IsDefault bool     `json:"is_default"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Product model
type Product struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Slug        string    `gorm:"uniqueIndex" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Category    string    `json:"category"`
	IsFeatured  bool      `json:"is_featured"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Variants []ProductVariant `json:"variants,omitempty"`
	Images   []ProductImage   `json:"images,omitempty"`
}

// ProductImage model
type ProductImage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ProductID uint      `json:"product_id"`
	ImageURL  string    `json:"image_url"`
	AltText   string    `json:"alt_text"`
	IsMain    bool      `json:"is_main"`
	CreatedAt time.Time `json:"created_at"`
}

// ProductVariant model
type ProductVariant struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ProductID uint      `json:"product_id"`
	Weight    string    `json:"weight"` // e.g., "250g", "500g", "1kg"
	Price     float64   `json:"price"`
	Stock     int       `json:"stock"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Cart model
type Cart struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    *uint     `json:"user_id"` // NULL for guest
	SessionID string    `json:"session_id"` // For guest users
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Items []CartItem `json:"items,omitempty"`
}

// CartItem model
type CartItem struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CartID    uint      `json:"cart_id"`
	VariantID uint      `json:"variant_id"`
	Quantity  int       `json:"quantity"`
	Price     float64   `json:"price"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Variant *ProductVariant `json:"variant,omitempty" gorm:"foreignKey:VariantID"`
}

// Order model
type Order struct {
	ID              uint         `gorm:"primaryKey" json:"id"`
	OrderNumber     string       `gorm:"uniqueIndex" json:"order_number"`
	UserID          *uint        `json:"user_id"` // NULL for guest
	CustomerName    string       `json:"customer_name"`
	CustomerEmail   string       `json:"customer_email"`
	CustomerPhone   string       `json:"customer_phone"`
	ShippingAddress datatypes.JSONType `json:"shipping_address" gorm:"type:jsonb"`
	TotalAmount     float64      `json:"total_amount"`
	PaymentStatus   PaymentStatus `json:"payment_status"`
	OrderStatus     OrderStatus   `json:"order_status"`
	CreatedAt       time.Time    `json:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	Items []OrderItem `json:"items,omitempty"`
}

type OrderStatus string

const (
	OrderStatusPending       OrderStatus = "pending"
	OrderStatusConfirmed     OrderStatus = "confirmed"
	OrderStatusPreparing     OrderStatus = "preparing"
	OrderStatusShipped       OrderStatus = "shipped"
	OrderStatusOutForDelivery OrderStatus = "out_for_delivery"
	OrderStatusDelivered     OrderStatus = "delivered"
	OrderStatusCancelled     OrderStatus = "cancelled"
)

type PaymentStatus string

const (
	PaymentStatusPending  PaymentStatus = "pending"
	PaymentStatusPaid     PaymentStatus = "paid"
	PaymentStatusFailed   PaymentStatus = "failed"
	PaymentStatusRefunded PaymentStatus = "refunded"
)

// OrderItem model
type OrderItem struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	OrderID   uint      `json:"order_id"`
	VariantID uint      `json:"variant_id"`
	Quantity  int       `json:"quantity"`
	Price     float64   `json:"price"`
	CreatedAt time.Time `json:"created_at"`
}

// Payment model
type Payment struct {
	ID            uint          `gorm:"primaryKey" json:"id"`
	OrderID       uint          `json:"order_id"`
	Amount        float64       `json:"amount"`
	Status        PaymentStatus `json:"status"`
	PaymentMethod string        `json:"payment_method"` // razorpay, card, etc.
	TransactionID string        `json:"transaction_id"`
	CreatedAt     time.Time     `json:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at"`
}
