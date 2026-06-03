package dto

type CreateProductRequest struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description" binding:"required"`
	Category    string `json:"category" binding:"required"`
	IsFeatured  bool   `json:"is_featured"`
}

type UpdateProductRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    string `json:"category"`
	IsFeatured  bool   `json:"is_featured"`
}

type ProductVariantRequest struct {
	Weight string  `json:"weight" binding:"required"`
	Price  float64 `json:"price" binding:"required,gt=0"`
	Stock  int     `json:"stock" binding:"required,gte=0"`
}

type ProductImageRequest struct {
	ImageURL string `json:"image_url" binding:"required,url"`
	AltText  string `json:"alt_text"`
	IsMain   bool   `json:"is_main"`
}

type ProductResponse struct {
	ID          uint                     `json:"id"`
	Name        string                   `json:"name"`
	Slug        string                   `json:"slug"`
	Description string                   `json:"description"`
	Category    string                   `json:"category"`
	IsFeatured  bool                     `json:"is_featured"`
	Variants    []ProductVariantResponse `json:"variants"`
	Images      []ProductImageResponse   `json:"images"`
}

type ProductVariantResponse struct {
	ID     uint    `json:"id"`
	Weight string  `json:"weight"`
	Price  float64 `json:"price"`
	Stock  int     `json:"stock"`
}

type ProductImageResponse struct {
	ID       uint   `json:"id"`
	ImageURL string `json:"image_url"`
	AltText  string `json:"alt_text"`
	IsMain   bool   `json:"is_main"`
}
