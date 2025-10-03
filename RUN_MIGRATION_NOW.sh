#!/bin/bash

# Quick script to run database migrations on DigitalOcean

echo "🗄️  Running Database Migrations..."
echo ""

# Get database connection details from DigitalOcean
echo "📋 Step 1: Get your database connection string"
echo "Go to: https://cloud.digitalocean.com/apps/7c0342ca-990f-4a09-b599-a3a3b313f465/settings"
echo "Scroll to 'ticketing-db' and click 'Connection Details'"
echo ""

# Prompt for connection details
read -p "Enter DB Host (e.g., app-xxxxx-do-user-xxxxx.b.db.ondigitalocean.com): " DB_HOST
read -p "Enter DB Port (usually 25060): " DB_PORT
read -p "Enter DB Name (usually 'ticketing-db'): " DB_NAME
read -p "Enter DB User (usually 'doadmin'): " DB_USER
read -sp "Enter DB Password: " DB_PASSWORD
echo ""
echo ""

# Set environment variables
export NODE_ENV=production
export DB_HOST=$DB_HOST
export DB_PORT=$DB_PORT
export DB_NAME=$DB_NAME
export DB_USER=$DB_USER
export DB_PASSWORD=$DB_PASSWORD

# Navigate to backend and run migrations
echo "🚀 Running migrations..."
cd backend
node src/config/init-db.js

echo ""
echo "✅ Done! Try logging in again with:"
echo "   Email: admin@company.com"
echo "   Password: admin123"

