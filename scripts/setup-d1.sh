#!/bin/bash

echo "🚀 راه‌اندازی Cloudflare D1 برای کیا نت"

# 1. ایجاد دیتابیس D1
echo "📦 در حال ایجاد دیتابیس D1..."
npx wrangler d1 create kiya-net-db

echo ""
echo "✅ دیتابیس ایجاد شد!"
echo "لطفاً database_id را از خروجی بالا کپی کنید و در wrangler.toml قرار دهید."

# 2. اعمال migration
echo ""
echo "📥 در حال اعمال migration..."
npx wrangler d1 migrations apply kiya-net-db --local

echo ""
echo "✅ راه‌اندازی D1 کامل شد!"
echo "حالا می‌توانید پروژه را با 'npm run dev' اجرا کنید."