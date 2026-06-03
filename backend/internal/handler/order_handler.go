package handler

import (
	"net/http"
	"strconv"

	"github.com/Deepansusingh/thekua-store/backend/internal/dto"
	"github.com/Deepansusingh/thekua-store/backend/internal/service"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	orderService service.OrderService
	log          *logger.Logger
}

func NewOrderHandler(orderService service.OrderService, log *logger.Logger) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
		log:          log,
	}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var req dto.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context if authenticated
	var userID *uint
	if uid, exists := c.Get("user_id"); exists {
		if id, ok := uid.(uint); ok {
			userID = &id
		}
	}

	order, err := h.orderService.CreateOrder(&req, userID)
	if err != nil {
		h.log.Warnf("Failed to create order: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
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

func (h *OrderHandler) TrackOrder(c *gin.Context) {
	orderNumber := c.Param("orderNumber")
	phone := c.Query("phone")

	if phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "phone number is required"})
		return
	}

	order, err := h.orderService.TrackOrder(orderNumber, phone)
	if err != nil {
		h.log.Warnf("Failed to track order: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}

func (h *OrderHandler) ListCustomerOrders(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email query parameter is required"})
		return
	}

	orders, err := h.orderService.ListCustomerOrdersByEmail(email, 100, 0)
	if err != nil {
		h.log.Warnf("Failed to list customer orders: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, orders)
}
