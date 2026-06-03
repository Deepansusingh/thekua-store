package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
	"strings"
	"time"

	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
)

type SMTPConfig struct {
	Host       string
	Port       string
	User       string
	Password   string
	AdminEmail string
}

type NotificationService interface {
	SendOrderNotification(order *domain.Order)
}

type notificationService struct {
	webhookURL string
	smtpConfig SMTPConfig
	log        *logger.Logger
}

func NewNotificationService(webhookURL string, smtpConfig SMTPConfig, log *logger.Logger) NotificationService {
	return &notificationService{
		webhookURL: webhookURL,
		smtpConfig: smtpConfig,
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
	// Deliver notifications asynchronously in a non-blocking background goroutine
	go func() {
		// 1. Process Webhook notification (Slack/Discord) if webhook URL exists
		if s.webhookURL != "" {
			s.sendWebhook(order)
		}

		// 2. Process Email notification (SMTP) if SMTP settings are present
		if s.smtpConfig.Host != "" && s.smtpConfig.Port != "" && s.smtpConfig.User != "" && s.smtpConfig.Password != "" {
			s.sendEmail(order)
		}
	}()
}

func (s *notificationService) sendWebhook(order *domain.Order) {
	plainTextMsg := fmt.Sprintf("🛒 *New Order Placed: #%s*\n• *Customer:* %s\n• *Email:* %s\n• *Phone:* %s\n• *Total:* ₹%.2f\n• *Status:* %s",
		order.OrderNumber, order.CustomerName, order.CustomerEmail, order.CustomerPhone, order.TotalAmount, order.OrderStatus)

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
}

func (s *notificationService) sendEmail(order *domain.Order) {
	plainTextMsg := fmt.Sprintf("New Order Placed: #%s\nCustomer: %s\nEmail: %s\nPhone: %s\nTotal: ₹%.2f\nStatus: %s",
		order.OrderNumber, order.CustomerName, order.CustomerEmail, order.CustomerPhone, order.TotalAmount, order.OrderStatus)

	htmlBody := fmt.Sprintf(`
		<html>
		<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
			<div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
				<h2 style="color: #d97706; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">🛒 New Order Placed</h2>
				<p>Hello Admin,</p>
				<p>A new order has been successfully placed on <strong>Thekua Store</strong>:</p>
				<table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
					<tr style="background-color: #f9fafb;">
						<td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 35%%;">Order Number</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb;">%s</td>
					</tr>
					<tr>
						<td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Customer Name</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb;">%s</td>
					</tr>
					<tr style="background-color: #f9fafb;">
						<td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb;">%s</td>
					</tr>
					<tr>
						<td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Phone</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb;">%s</td>
					</tr>
					<tr style="background-color: #f9fafb;">
						<td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; color: #b45309;">Total Amount</td>
						<td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; color: #b45309;">₹%.2f</td>
					</tr>
				</table>
				<p>Please log in to the <a href="https://thekua-frontend.onrender.com/login" style="color: #d97706; text-decoration: none; font-weight: bold;">Admin Dashboard</a> to review and process this order.</p>
				<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
				<p style="font-size: 11px; color: #9ca3af; text-align: center;">This is an automated notification from your Thekua Store server application.</p>
			</div>
		</body>
		</html>
	`, order.OrderNumber, order.CustomerName, order.CustomerEmail, order.CustomerPhone, order.TotalAmount)

	subject := fmt.Sprintf("🛒 New Order #%s Placed - Thekua Store", order.OrderNumber)
	boundary := "my-mime-boundary"
	
	header := make(map[string]string)
	header["From"] = s.smtpConfig.User
	header["To"] = s.smtpConfig.AdminEmail
	header["Subject"] = subject
	header["MIME-Version"] = "1.0"
	header["Content-Type"] = fmt.Sprintf("multipart/alternative; boundary=%s", boundary)

	var message strings.Builder
	for k, v := range header {
		message.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	message.WriteString("\r\n")

	// Plain Text version
	message.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	message.WriteString("Content-Type: text/plain; charset=UTF-8\r\n")
	message.WriteString("Content-Transfer-Encoding: 7bit\r\n\r\n")
	message.WriteString(plainTextMsg)
	message.WriteString("\r\n\r\n")

	// HTML version
	message.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	message.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	message.WriteString("Content-Transfer-Encoding: 7bit\r\n\r\n")
	message.WriteString(htmlBody)
	message.WriteString("\r\n\r\n")

	message.WriteString(fmt.Sprintf("--%s--\r\n", boundary))

	auth := smtp.PlainAuth("", s.smtpConfig.User, s.smtpConfig.Password, s.smtpConfig.Host)
	addr := fmt.Sprintf("%s:%s", s.smtpConfig.Host, s.smtpConfig.Port)

	err := smtp.SendMail(addr, auth, s.smtpConfig.User, []string{s.smtpConfig.AdminEmail}, []byte(message.String()))
	if err != nil {
		s.log.Errorf("Failed to send admin order email notification: %v", err)
	} else {
		s.log.Infof("Successfully sent admin email notification for order #%s to %s", order.OrderNumber, s.smtpConfig.AdminEmail)
	}
}
