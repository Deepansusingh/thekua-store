package handler

import (
	"net/http"
	"strconv"

	"github.com/Deepansusingh/thekua-store/backend/internal/service"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productService service.ProductService
	log            *logger.Logger
}

func NewProductHandler(productService service.ProductService, log *logger.Logger) *ProductHandler {
	return &ProductHandler{
		productService: productService,
		log:            log,
	}
}

func (h *ProductHandler) ListProducts(c *gin.Context) {
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

	products, err := h.productService.ListProducts(limit, offset)
	if err != nil {
		h.log.Errorf("Failed to list products: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"products": products,
		"count":    len(products),
	})
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	product, err := h.productService.GetProduct(uint(id))
	if err != nil {
		h.log.Warnf("Product not found: %d", id)
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}
