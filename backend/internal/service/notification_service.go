package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
)

type NotificationService interface {
	SendOrderNotification(order *domain.Order)
}

type notificationService struct {
	webhookURL string
	log        *logger.Logger
}

func NewNotificationService(webhookURL string, log *logger.Logger) NotificationService {
	return &notificationService{
		webhookURL: webhookURL,
		log:        log,
	}
}

type DiscordEmbedField struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline"`
}

type DiscordEmbed struct {
	Title       string              `json:"title"`
	Description string              `json:"description"`
	Color       int                 `json:"color"`
	Fields      []DiscordEmbedField `json:"fields"`
	Timestamp   string              `json:"timestamp"`
}

type WebhookPayload struct {
	Text     string         `json:"text,omitempty"`
	Username string         `json:"username,omitempty"`
	Embeds   []DiscordEmbed `json:"embeds,omitempty"`
}

func (s *notificationService) SendOrderNotification(order *domain.Order) {
	if s.webhookURL == "" {
		s.log.Info("Admin notification webhook URL is empty. Skipping notification.")
		return
	}

	// Deliver notification in a non-blocking background goroutine
	go func() {
		// Generic message layout (works for Slack and Discord basic text)
		plainTextMsg := fmt.Sprintf("🛒 *New Order Placed: #%s*\n• *Customer:* %s\n• *Email:* %s\n• *Phone:* %s\n• *Total:* ₹%.2f\n• *Status:* %s",
			order.OrderNumber, order.CustomerName, order.CustomerEmail, order.CustomerPhone, order.TotalAmount, order.OrderStatus)

		// Rich embeds for Discord
		fields := []DiscordEmbedField{
			{Name: "Customer Name", Value: order.CustomerName, Inline: true},
			{Name: "Customer Email", Value: order.CustomerEmail, Inline: true},
			{Name: "Customer Phone", Value: order.CustomerPhone, Inline: true},
			{Name: "Total Amount", Value: fmt.Sprintf("₹%.2f", order.TotalAmount), Inline: true},
			{Name: "Payment Status", Value: string(order.PaymentStatus), Inline: true},
			{Name: "Order Status", Value: string(order.OrderStatus), Inline: true},
		}

		embed := DiscordEmbed{
			Title:       fmt.Sprintf("🛒 New Order Placed: #%s", order.OrderNumber),
			Description: "A new order has been registered on the Thekua Store platform.",
			Color:       15844367, // Gold / Amber theme color
			Fields:      fields,
			Timestamp:   time.Now().Format(time.RFC3339),
		}

		payload := WebhookPayload{
			Text:     plainTextMsg,
			Username: "Thekua Store Dispatcher",
		}

		// If the webhook is a Discord URL, attach the rich embeds
		if strings.Contains(s.webhookURL, "discord.com") {
			payload.Embeds = []DiscordEmbed{embed}
		}

		jsonPayload, err := json.Marshal(payload)
		if err != nil {
			s.log.Errorf("Failed to marshal notification webhook payload: %v", err)
			return
		}

		req, err := http.NewRequest("POST", s.webhookURL, bytes.NewBuffer(jsonPayload))
		if err != nil {
			s.log.Errorf("Failed to create webhook HTTP request: %v", err)
			return
		}
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			s.log.Errorf("Failed to deliver order webhook notification: %v", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			s.log.Warnf("Webhook endpoint returned warning status code: %d", resp.StatusCode)
		} else {
			s.log.Infof("Successfully sent order notification webhook for order #%s", order.OrderNumber)
		}
	}()
}
