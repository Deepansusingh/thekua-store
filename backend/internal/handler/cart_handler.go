package handler

import (
	"net/http"
	"strconv"

	"github.com/Deepansusingh/thekua-store/backend/internal/dto"
	"github.com/Deepansusingh/thekua-store/backend/internal/service"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
	"github.com/Deepansusingh/thekua-store/backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

type CartHandler struct {
	cartService service.CartService
	log         *logger.Logger
}

func NewCartHandler(cartService service.CartService, log *logger.Logger) *CartHandler {
	return &CartHandler{
		cartService: cartService,
		log:         log,
	}
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	var req dto.AddToCartRequest
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

	// Get or create session ID
	sessionID := c.GetString("session_id")
	if sessionID == "" {
		sessionID = utils.GenerateSessionID()
		c.SetCookie("session_id", sessionID, 86400*30, "/", "", false, true)
	}

	item, err := h.cartService.AddToCart(userID, sessionID, &req)
	if err != nil {
		h.log.Warnf("Failed to add to cart: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, item)
}

func (h *CartHandler) GetCartItems(c *gin.Context) {
	var userID *uint
	if uid, exists := c.Get("user_id"); exists {
		if id, ok := uid.(uint); ok {
			userID = &id
		}
	}

	sessionID, _ := c.Cookie("session_id")

	items, err := h.cartService.GetCartItems(userID, sessionID)
	if err != nil {
		h.log.Errorf("Failed to get cart items: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	total, _ := h.cartService.GetCartTotal(userID, sessionID)

	c.JSON(http.StatusOK, gin.H{
		"items": items,
		"total": total,
	})
}

func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	itemID, err := strconv.ParseUint(c.Param("itemID"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	var req dto.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := h.cartService.UpdateCartItem(uint(itemID), &req)
	if err != nil {
		h.log.Warnf("Failed to update cart item: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	itemID, err := strconv.ParseUint(c.Param("itemID"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	err = h.cartService.RemoveFromCart(uint(itemID))
	if err != nil {
		h.log.Warnf("Failed to remove from cart: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "item removed from cart"})
}

func (h *CartHandler) ClearCart(c *gin.Context) {
	var userID *uint
	if uid, exists := c.Get("user_id"); exists {
		if id, ok := uid.(uint); ok {
			userID = &id
		}
	}

	sessionID, _ := c.Cookie("session_id")

	err := h.cartService.ClearCart(userID, sessionID)
	if err != nil {
		h.log.Warnf("Failed to clear cart: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cart cleared"})
}
