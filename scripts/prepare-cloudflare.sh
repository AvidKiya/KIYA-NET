#!/bin/bash
# Switches the database adapter for Cloudflare Pages deployment
# Replaces pg (TCP-based) with @neondatabase/serverless (HTTP-based)

echo "🔧 Preparing for Cloudflare Pages deployment..."
echo "   Switching database adapter from pg → @neondatabase/serverless"

# Backup original
cp src/db/index.ts src/db/index.local.ts

# Use Cloudflare adapter
cp src/db/cloudflare.ts src/db/index.ts

echo "✅ Done! Push to GitHub and deploy on Cloudflare Pages."
echo ""
echo "⚠️  Remember:"
echo "   1. Set DATABASE_URL in Cloudflare Pages dashboard (Neon connection string)"
echo "   2. Build command: npx @cloudflare/next-on-pages"
echo "   3. Output directory: .vercel/output/static"
echo ""
echo "   To restore local dev setup: mv src/db/index.local.ts src/db/index.ts"
