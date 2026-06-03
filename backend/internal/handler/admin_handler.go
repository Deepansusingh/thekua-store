package handler

import (
	"net/http"
	"strconv"

	"github.com/Deepansusingh/thekua-store/backend/internal/dto"
	"github.com/Deepansusingh/thekua-store/backend/internal/service"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	productService service.ProductService
	orderService   service.OrderService
	log            *logger.Logger
}

func NewAdminHandler(
	productService service.ProductService,
	orderService service.OrderService,
	log *logger.Logger,
) *AdminHandler {
	return &AdminHandler{
		productService: productService,
		orderService:   orderService,
		log:            log,
	}
}

// Product Management
func (h *AdminHandler) CreateProduct(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := h.productService.CreateProduct(&req)
	if err != nil {
		h.log.Errorf("Failed to create product: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, product)
}

func (h *AdminHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req dto.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := h.productService.UpdateProduct(uint(id), &req)
	if err != nil {
		h.log.Warnf("Failed to update product: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}

func (h *AdminHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	err = h.productService.DeleteProduct(uint(id))
	if err != nil {
		h.log.Errorf("Failed to delete product: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product deleted successfully"})
}

func (h *AdminHandler) CreateProductVariant(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req dto.ProductVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	variant, err := h.productService.CreateVariant(uint(productID), &req)
	if err != nil {
		h.log.Warnf("Failed to create variant: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, variant)
}

func (h *AdminHandler) UpdateProductVariant(c *gin.Context) {
	variantID, err := strconv.ParseUint(c.Param("variantID"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid variant id"})
		return
	}

	var req dto.ProductVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	variant, err := h.productService.UpdateVariant(uint(variantID), &req)
	if err != nil {
		h.log.Warnf("Failed to update variant: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, variant)
}

func (h *AdminHandler) DeleteProductVariant(c *gin.Context) {
	variantID, err := strconv.ParseUint(c.Param("variantID"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid variant id"})
		return
	}

	err = h.productService.DeleteVariant(uint(variantID))
	if err != nil {
		h.log.Errorf("Failed to delete variant: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "variant deleted successfully"})
}

func (h *AdminHandler) UploadProductImage(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req dto.ProductImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	image, err := h.productService.UploadProductImage(uint(productID), &req)
	if err != nil {
		h.log.Warnf("Failed to upload image: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, image)
}

// Order Management
func (h *AdminHandler) ListOrders(c *gin.Context) {
	limit := 20
	offset := 0

	if l := c.Query("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil {
			limit = val
		}
	}

	if o := c.Query("offset"); o != "" {
		if val, err := strconv.Atoi(o); err == nil {
			offset = val
		}
	}

	orders, err := h.orderService.ListOrders(limit, offset)
	if err != nil {
		h.log.Errorf("Failed to list orders: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"count":  len(orders),
	})
}

func (h *AdminHandler) GetOrder(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	order, err := h.orderService.GetOrder(uint(orderID))
	if err != nil {
		h.log.Warnf("Order not found: %d", orderID)
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}

func (h *AdminHandler) UpdateOrderStatus(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	var req dto.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.orderService.UpdateOrderStatus(uint(orderID), req.Status)
	if err != nil {
		h.log.Warnf("Failed to update order status: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}

// Customer Management (placeholder methods)
func (h *AdminHandler) ListCustomers(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "coming soon"})
}

func (h *AdminHandler) GetCustomer(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "coming soon"})
}

func (h *AdminHandler) GetCustomerOrders(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "coming soon"})
}
