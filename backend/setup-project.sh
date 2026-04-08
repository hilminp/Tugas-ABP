#!/bin/bash

echo "🚀 Setup Project Laravel"
echo "========================"

# 1. Install dependencies
echo "📦 Installing PHP dependencies..."
composer install

echo "📦 Installing Node dependencies..."
npm install

# 2. Setup environment
echo "⚙️ Setting up environment..."
cp .env.example .env
php artisan key:generate

# 3. Setup database
echo "🗄️ Setting up database..."
touch database/database.sqlite
php artisan migrate --force

# 4. Build assets
echo "🎨 Building assets..."
npm run build

echo "✅ Setup complete!"
echo "🚀 Run 'php artisan serve' to start the server"