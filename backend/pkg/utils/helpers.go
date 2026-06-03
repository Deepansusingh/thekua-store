package utils

import (
	"fmt"
	"math/rand"
	"time"
)

func GenerateOrderNumber() string {
	rand.Seed(time.Now().UnixNano())
	const charset = "0123456789"
	order := "ORD-"
	for i := 0; i < 10; i++ {
		order += string(charset[rand.Intn(len(charset))])
	}
	return order
}

func GenerateSessionID() string {
	rand.Seed(time.Now().UnixNano())
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	session := ""
	for i := 0; i < 32; i++ {
		session += string(charset[rand.Intn(len(charset))])
	}
	return session
}

func FormatCurrency(amount float64) string {
	return fmt.Sprintf("₹%.2f", amount)
}
