package dto

type AddToCartRequest struct {
	VariantID uint `json:"variant_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,gt=0"`
}

type UpdateCartItemRequest struct {
	Quantity int `json:"quantity" binding:"required,gt=0"`
}

type CartResponse struct {
	ID    uint                 `json:"id"`
	Items []CartItemResponse   `json:"items"`
	Total float64              `json:"total"`
}

type CartItemResponse struct {
	ID       uint    `json:"id"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
	Variant  VariantInfo `json:"variant"`
}

type VariantInfo struct {
	ID    uint    `json:"id"`
	Weight string `json:"weight"`
	Price  float64 `json:"price"`
}
