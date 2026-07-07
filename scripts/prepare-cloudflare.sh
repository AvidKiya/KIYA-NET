#!/bin/bash
# This project now uses @neondatabase/serverless by default (Cloudflare-compatible)
# No need to swap database adapters anymore!

echo "✅ Kiya Net is ready for Cloudflare Pages deployment!"
echo ""
echo "⚠️  Remember:"
echo "   1. Set DATABASE_URL in Cloudflare Pages dashboard (Neon connection string)"
echo "   2. Set JWT_SECRET (generate a strong random string)"
echo "   3. Set ADMIN_PASSWORD (for admin panel access)"
echo "   4. Build command: npx @cloudflare/next-on-pages"
echo "   5. Output directory: .vercel/output/static"
echo ""
echo "   Optional environment variables:"
echo "   - TELEGRAM_BOT_TOKEN"
echo "   - PAYMENT_MERCHANT_ID"
