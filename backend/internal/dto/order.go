package dto

type CreateOrderRequest struct {
	Items            []OrderItemRequest `json:"items" binding:"required"`
	CustomerName     string              `json:"customer_name" binding:"required"`
	CustomerEmail    string              `json:"customer_email" binding:"required,email"`
	CustomerPhone    string              `json:"customer_phone" binding:"required"`
	ShippingAddress  AddressRequest      `json:"shipping_address" binding:"required"`
}

type OrderItemRequest struct {
	VariantID uint `json:"variant_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,gt=0"`
}

type AddressRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	Street   string `json:"street" binding:"required"`
	City     string `json:"city" binding:"required"`
	State    string `json:"state" binding:"required"`
	Pincode  string `json:"pincode" binding:"required"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

type OrderResponse struct {
	ID              uint                  `json:"id"`
	OrderNumber     string                `json:"order_number"`
	CustomerName    string                `json:"customer_name"`
	CustomerEmail   string                `json:"customer_email"`
	CustomerPhone   string                `json:"customer_phone"`
	ShippingAddress AddressRequest        `json:"shipping_address"`
	TotalAmount     float64               `json:"total_amount"`
	PaymentStatus   string                `json:"payment_status"`
	OrderStatus     string                `json:"order_status"`
	Items           []OrderItemResponse   `json:"items"`
}

type OrderItemResponse struct {
	ID       uint    `json:"id"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}
