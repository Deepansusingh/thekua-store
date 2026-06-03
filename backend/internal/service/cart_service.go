package service

import (
	"fmt"

	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"github.com/Deepansusingh/thekua-store/backend/internal/dto"
	"github.com/Deepansusingh/thekua-store/backend/internal/repository"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
)

type CartService interface {
	AddToCart(userID *uint, sessionID string, req *dto.AddToCartRequest) (*domain.CartItem, error)
	GetCartItems(userID *uint, sessionID string) ([]domain.CartItem, error)
	UpdateCartItem(itemID uint, req *dto.UpdateCartItemRequest) (*domain.CartItem, error)
	RemoveFromCart(itemID uint) error
	ClearCart(userID *uint, sessionID string) error
	GetCartTotal(userID *uint, sessionID string) (float64, error)
}

type cartService struct {
	cartRepo     *repository.CartRepository
	cartItemRepo *repository.CartItemRepository
	variantRepo  *repository.ProductVariantRepository
	log          *logger.Logger
}

func NewCartService(
	cartRepo *repository.CartRepository,
	cartItemRepo *repository.CartItemRepository,
	variantRepo *repository.ProductVariantRepository,
	log *logger.Logger,
) CartService {
	return &cartService{
		cartRepo:     cartRepo,
		cartItemRepo: cartItemRepo,
		variantRepo:  variantRepo,
		log:          log,
	}
}

func (s *cartService) AddToCart(userID *uint, sessionID string, req *dto.AddToCartRequest) (*domain.CartItem, error) {
	// Get or create cart
	var cart *domain.Cart
	var err error

	if userID != nil {
		cart, err = s.cartRepo.GetByUserID(*userID)
		if err != nil {
			// Create new cart for user
			cart = &domain.Cart{UserID: userID}
			if err := s.cartRepo.Create(cart); err != nil {
				s.log.Errorf("Failed to create cart: %v", err)
				return nil, fmt.Errorf("failed to add to cart")
			}
		}
	} else {
		cart, err = s.cartRepo.GetBySessionID(sessionID)
		if err != nil {
			// Create new cart for guest
			cart = &domain.Cart{SessionID: sessionID}
			if err := s.cartRepo.Create(cart); err != nil {
				s.log.Errorf("Failed to create cart: %v", err)
				return nil, fmt.Errorf("failed to add to cart")
			}
		}
	}

	// Verify variant exists and has stock
	variant, err := s.variantRepo.GetByID(req.VariantID)
	if err != nil || variant.Stock < req.Quantity {
		return nil, fmt.Errorf("insufficient stock")
	}

	// Create cart item
	cartItem := &domain.CartItem{
		CartID:    cart.ID,
		VariantID: req.VariantID,
		Quantity:  req.Quantity,
		Price:     variant.Price,
	}

	if err := s.cartItemRepo.Create(cartItem); err != nil {
		s.log.Errorf("Failed to add item to cart: %v", err)
		return nil, fmt.Errorf("failed to add to cart")
	}

	s.log.Infof("Item added to cart: variant %d, quantity %d", req.VariantID, req.Quantity)
	return cartItem, nil
}

func (s *cartService) GetCartItems(userID *uint, sessionID string) ([]domain.CartItem, error) {
	var cart *domain.Cart
	var err error

	if userID != nil {
		cart, err = s.cartRepo.GetByUserID(*userID)
	} else {
		cart, err = s.cartRepo.GetBySessionID(sessionID)
	}

	if err != nil {
		return []domain.CartItem{}, nil
	}

	return s.cartItemRepo.ListByCartID(cart.ID)
}

func (s *cartService) UpdateCartItem(itemID uint, req *dto.UpdateCartItemRequest) (*domain.CartItem, error) {
	cartItem, err := s.cartItemRepo.GetByID(itemID)
	if err != nil {
		return nil, fmt.Errorf("cart item not found")
	}

	cartItem.Quantity = req.Quantity

	if err := s.cartItemRepo.Update(cartItem); err != nil {
		s.log.Errorf("Failed to update cart item: %v", err)
		return nil, fmt.Errorf("failed to update cart item")
	}

	return cartItem, nil
}

func (s *cartService) RemoveFromCart(itemID uint) error {
	if err := s.cartItemRepo.Delete(itemID); err != nil {
		s.log.Errorf("Failed to remove from cart: %v", err)
		return fmt.Errorf("failed to remove from cart")
	}
	return nil
}

func (s *cartService) ClearCart(userID *uint, sessionID string) error {
	var cart *domain.Cart
	var err error

	if userID != nil {
		cart, err = s.cartRepo.GetByUserID(*userID)
	} else {
		cart, err = s.cartRepo.GetBySessionID(sessionID)
	}

	if err != nil {
		return fmt.Errorf("cart not found")
	}

	if err := s.cartItemRepo.DeleteByCartID(cart.ID); err != nil {
		s.log.Errorf("Failed to clear cart: %v", err)
		return fmt.Errorf("failed to clear cart")
	}

	return nil
}

func (s *cartService) GetCartTotal(userID *uint, sessionID string) (float64, error) {
	items, err := s.GetCartItems(userID, sessionID)
	if err != nil {
		return 0, err
	}

	total := 0.0
	for _, item := range items {
		total += item.Price * float64(item.Quantity)
	}

	return total, nil
}
