package service

import (
	"fmt"
	"time"

	"github.com/Deepansusingh/thekua-store/backend/internal/domain"
	"github.com/Deepansusingh/thekua-store/backend/internal/dto"
	"github.com/Deepansusingh/thekua-store/backend/internal/repository"
	"github.com/Deepansusingh/thekua-store/backend/pkg/logger"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(req *dto.RegisterRequest) (*dto.AuthResponse, error)
	Login(req *dto.LoginRequest) (*dto.AuthResponse, error)
	AdminLogin(req *dto.AdminLoginRequest) (*dto.AuthResponse, error)
	ValidateToken(token string) (*jwt.Claims, error)
}

type authService struct {
	userRepo  *repository.UserRepository
	jwtSecret string
	jwtExpiry time.Duration
	log       *logger.Logger
}

func NewAuthService(
	userRepo *repository.UserRepository,
	jwtSecret string,
	jwtExpiry time.Duration,
	log *logger.Logger,
) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
		log:       log,
	}
}

func (s *authService) Register(req *dto.RegisterRequest) (*dto.AuthResponse, error) {
	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(req.Email)
	if err == nil && existingUser != nil {
		return nil, fmt.Errorf("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		s.log.Errorf("Failed to hash password: %v", err)
		return nil, fmt.Errorf("failed to create user")
	}

	// Create user
	user := &domain.User{
		Name:     req.Name,
		Email:    req.Email,
		Phone:    req.Phone,
		Password: string(hashedPassword),
		Role:     domain.RoleCustomer,
	}

	if err := s.userRepo.Create(user); err != nil {
		s.log.Errorf("Failed to create user: %v", err)
		return nil, fmt.Errorf("failed to create user")
	}

	// Generate token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  string(user.Role),
		Token: token,
	}, nil
}

func (s *authService) Login(req *dto.LoginRequest) (*dto.AuthResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		s.log.Warnf("User not found: %s", req.Email)
		return nil, fmt.Errorf("invalid email or password")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		s.log.Warnf("Invalid password for user: %s", req.Email)
		return nil, fmt.Errorf("invalid email or password")
	}

	// Check if customer
	if user.Role != domain.RoleCustomer {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Generate token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  string(user.Role),
		Token: token,
	}, nil
}

func (s *authService) AdminLogin(req *dto.AdminLoginRequest) (*dto.AuthResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		s.log.Warnf("Admin user not found: %s", req.Email)
		return nil, fmt.Errorf("invalid email or password")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		s.log.Warnf("Invalid password for admin: %s", req.Email)
		return nil, fmt.Errorf("invalid email or password")
	}

	// Check if admin
	if user.Role != domain.RoleAdmin {
		return nil, fmt.Errorf("unauthorized")
	}

	// Generate token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  string(user.Role),
		Token: token,
	}, nil
}

func (s *authService) ValidateToken(token string) (*jwt.Claims, error) {
	// TODO: Implement token validation
	return nil, nil
}

func (s *authService) generateToken(user *domain.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(s.jwtExpiry).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		s.log.Errorf("Failed to generate token: %v", err)
		return "", fmt.Errorf("failed to generate token")
	}

	return tokenString, nil
}
