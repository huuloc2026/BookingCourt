#!/bin/bash

# Test script for the NestJS API
BASE_URL="http://localhost:8888/api"

echo "🧪 Testing NestJS Boilerplate API..."
echo "================================="

# Test 1: Health check
echo "1. Testing health check..."
curl -s "${BASE_URL}/health" | jq '.'
echo ""

# Test 2: Register a new user
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Extract access token from registration response
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken // empty')

if [ -n "$ACCESS_TOKEN" ]; then
  echo "✅ Registration successful! Access token: ${ACCESS_TOKEN:0:20}..."
  
  # Test 3: Get user profile
  echo "3. Testing user profile..."
  curl -s "${BASE_URL}/auth/profile" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
  echo ""

  # Test 4: Login with registered user
  echo "4. Testing user login..."
  LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123"
    }')
  
  echo "$LOGIN_RESPONSE" | jq '.'
  echo ""

else
  echo "❌ Registration failed or user already exists"
fi

echo "🎉 API testing completed!"
echo "📚 Visit http://localhost:8888/api/docs for Swagger documentation"
