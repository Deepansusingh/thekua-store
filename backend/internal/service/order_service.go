package service

import (
	"encoding/json"
	"fmt"

	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"github.com/Deepansusingh/thekua-store/backend/internal/dto"
	"github.com/Deepansusingh/thekua-store/backend/internal/repository"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
	"github.com/Deepansusingh/thekua-store/backend/pkg/utils"
	"gorm.io/datatypes"
)

type OrderService interface {
	CreateOrder(req *dto.CreateOrderRequest, userID *uint) (*domain.Order, error)
	GetOrder(orderID uint) (*domain.Order, error)
	TrackOrder(orderNumber string, phone string) (*domain.Order, error)
	UpdateOrderStatus(orderID uint, status string) (*domain.Order, error)
	ListOrders(limit, offset int) ([]domain.Order, error)
	ListCustomerOrders(userID uint, limit, offset int) ([]domain.Order, error)
	ListCustomerOrdersByEmail(email string, limit, offset int) ([]domain.Order, error)
}

type orderService struct {
	orderRepo     *repository.OrderRepository
	orderItemRepo *repository.OrderItemRepository
	cartItemRepo  *repository.CartItemRepository
	variantRepo   *repository.ProductVariantRepository
	addressRepo   *repository.AddressRepository
	log           *logger.Logger
}

func NewOrderService(
	orderRepo *repository.OrderRepository,
	orderItemRepo *repository.OrderItemRepository,
	cartItemRepo *repository.CartItemRepository,
	variantRepo *repository.ProductVariantRepository,
	addressRepo *repository.AddressRepository,
	log *logger.Logger,
) OrderService {
	return &orderService{
		orderRepo:     orderRepo,
		orderItemRepo: orderItemRepo,
		cartItemRepo:  cartItemRepo,
		variantRepo:   variantRepo,
		addressRepo:   addressRepo,
		log:           log,
	}
}

func (s *orderService) CreateOrder(req *dto.CreateOrderRequest, userID *uint) (*domain.Order, error) {
	// Validate items
	if len(req.Items) == 0 {
		return nil, fmt.Errorf("order must contain at least one item")
	}

	// Calculate total amount
	totalAmount := 0.0
	for _, item := range req.Items {
		variant, err := s.variantRepo.GetByID(item.VariantID)
		if err != nil {
			return nil, fmt.Errorf("product variant not found")
		}

		if variant.Stock < item.Quantity {
			return nil, fmt.Errorf("insufficient stock for variant %d", item.VariantID)
		}

		totalAmount += variant.Price * float64(item.Quantity)
	}

	// Create shipping address JSON
	addressJSON, err := json.Marshal(req.ShippingAddress)
	if err != nil {
		s.log.Errorf("Failed to marshal address: %v", err)
		return nil, fmt.Errorf("invalid address")
	}

	// Create order
	order := &domain.Order{
		OrderNumber:     utils.GenerateOrderNumber(),
		UserID:          userID,
		CustomerName:    req.CustomerName,
		CustomerEmail:   req.CustomerEmail,
		CustomerPhone:   req.CustomerPhone,
		ShippingAddress: datatypes.JSON(addressJSON),
		TotalAmount:     totalAmount,
		PaymentStatus:   domain.PaymentStatusPending,
		OrderStatus:     domain.OrderStatusPending,
	}

	if err := s.orderRepo.Create(order); err != nil {
		s.log.Errorf("Failed to create order: %v", err)
		return nil, fmt.Errorf("failed to create order")
	}

	// Create order items
	for _, item := range req.Items {
		variant, _ := s.variantRepo.GetByID(item.VariantID)

		orderItem := &domain.OrderItem{
			OrderID:   order.ID,
			VariantID: item.VariantID,
			Quantity:  item.Quantity,
			Price:     variant.Price,
		}

		if err := s.orderItemRepo.Create(orderItem); err != nil {
			s.log.Errorf("Failed to create order item: %v", err)
		}

		// Update variant stock
		variant.Stock -= item.Quantity
		s.variantRepo.Update(variant)
	}

	s.log.Infof("Order created: %s, Total: %.2f", order.OrderNumber, totalAmount)
	return order, nil
}

func (s *orderService) GetOrder(orderID uint) (*domain.Order, error) {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		s.log.Warnf("Order not found: %d", orderID)
		return nil, fmt.Errorf("order not found")
	}
	return order, nil
}

func (s *orderService) TrackOrder(orderNumber string, phone string) (*domain.Order, error) {
	order, err := s.orderRepo.GetByOrderNumber(orderNumber)
	if err != nil {
		s.log.Warnf("Order not found: %s", orderNumber)
		return nil, fmt.Errorf("order not found")
	}

	// Verify phone number matches
	if order.CustomerPhone != phone {
		s.log.Warnf("Unauthorized order tracking attempt for: %s", orderNumber)
		return nil, fmt.Errorf("invalid phone number")
	}

	return order, nil
}

func (s *orderService) UpdateOrderStatus(orderID uint, status string) (*domain.Order, error) {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found")
	}

	// Validate status
	validStatuses := map[string]domain.OrderStatus{
		"pending":          domain.OrderStatusPending,
		"confirmed":        domain.OrderStatusConfirmed,
		"preparing":        domain.OrderStatusPreparing,
		"shipped":          domain.OrderStatusShipped,
		"out_for_delivery": domain.OrderStatusOutForDelivery,
		"delivered":        domain.OrderStatusDelivered,
		"cancelled":        domain.OrderStatusCancelled,
	}

	if orderStatus, ok := validStatuses[status]; ok {
		order.OrderStatus = orderStatus
	} else {
		return nil, fmt.Errorf("invalid order status")
	}

	if err := s.orderRepo.Update(order); err != nil {
		s.log.Errorf("Failed to update order status: %v", err)
		return nil, fmt.Errorf("failed to update order status")
	}

	s.log.Infof("Order %d status updated to: %s", orderID, status)
	return order, nil
}

func (s *orderService) ListOrders(limit, offset int) ([]domain.Order, error) {
	orders, err := s.orderRepo.List(limit, offset)
	if err != nil {
		s.log.Errorf("Failed to list orders: %v", err)
		return nil, fmt.Errorf("failed to list orders")
	}
	return orders, nil
}

func (s *orderService) ListCustomerOrders(userID uint, limit, offset int) ([]domain.Order, error) {
	orders, err := s.orderRepo.ListByUserID(userID, limit, offset)
	if err != nil {
		s.log.Errorf("Failed to list customer orders: %v", err)
		return nil, fmt.Errorf("failed to list orders")
	}
	return orders, nil
}

func (s *orderService) ListCustomerOrdersByEmail(email string, limit, offset int) ([]domain.Order, error) {
	orders, err := s.orderRepo.ListByEmail(email, limit, offset)
	if err != nil {
		s.log.Errorf("Failed to list customer orders by email: %v", err)
		return nil, fmt.Errorf("failed to list orders")
	}
	return orders, nil
}
