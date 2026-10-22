#!/bin/bash
# LUMEN MEGA HOMES - one-shot deploy for Whogohost cPanel (Passenger + Node 22)
# Usage: cd <app root> && bash server/scripts/cpanel-deploy.sh
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$APP_ROOT"

echo "=============================================="
echo " LUMEN MEGA HOMES deploy"
echo " app root: $APP_ROOT"
echo "=============================================="

# 1. Use the cPanel node environment when present
VENV_BIN="/home/lumenmeg/nodevenv/public_html/nodeapps/22/bin"
VENV_NM="/home/lumenmeg/nodevenv/public_html/nodeapps/22/lib/node_modules"
if [ -d "$VENV_BIN" ]; then
  export PATH="$VENV_BIN:$PATH"
  echo "[1/7] node: $(node -v)  npm: $(npm -v)"
else
  echo "[1/7] node: $(node -v)  npm: $(npm -v)  (system node)"
fi

# 2. Restore the cPanel node_modules symlink
if [ ! -e node_modules ] && [ -d "$VENV_NM" ]; then
  ln -s "$VENV_NM" node_modules
  echo "[2/7] node_modules symlink -> $VENV_NM"
else
  echo "[2/7] node_modules present"
fi

# 3. Build .env from the cPanel .htaccess SetEnv values (Apache ignores SetEnv in IfModule Litespeed)
HTACCESS="/home/lumenmeg/public_html/.htaccess"
PEPPER_DEFAULT="1d7ee7148e4f4fb46e002bd34d7077ee4440afb4f6b17cb5eb1ee5e8cec545da"
DB_NAME="${DB_NAME:-lumenmeg_lmhadmin}"

if [ -n "${DB_USER:-}" ]; then
  NEW_URL="postgresql://${DB_USER}:${DB_PASS:-}@localhost:5432/${DB_NAME}?schema=public"
  {
    echo "DATABASE_URL=\"${NEW_URL}\""
    echo "DIRECT_URL=\"${NEW_URL}\""
    echo "PASSWORD_PEPPER=\"${PEPPER_DEFAULT}\""
    echo "SESSION_DAYS=\"7\""
    echo "NEXT_PUBLIC_SITE_URL=\"https://lumenmegahomes.com\""
    echo "NEXT_PUBLIC_API_URL=\"/api/v1\""
  } > .env
  export DATABASE_URL="$NEW_URL"
  export DIRECT_URL="$NEW_URL"
  if [ -f "$HTACCESS" ]; then
    sed -i -E "s#^(SetEnv (DATABASE_URL|DIRECT_URL) ).*#\1${NEW_URL}#" "$HTACCESS" || true
  fi
  echo "[3/7] .env + .htaccess set for database user ${DB_USER}"
elif [ ! -f .env ]; then
  db_url="$(grep -m1 -o 'SetEnv DATABASE_URL [^ ]*' "$HTACCESS" 2>/dev/null | awk '{print $3}' || true)"
  direct_url="$(grep -m1 -o 'SetEnv DIRECT_URL [^ ]*' "$HTACCESS" 2>/dev/null | awk '{print $3}' || true)"
  [ -n "$direct_url" ] || direct_url="$db_url"
  {
    echo "DATABASE_URL=\"${db_url}\""
    echo "DIRECT_URL=\"${direct_url}\""
    echo "PASSWORD_PEPPER=\"${PEPPER_DEFAULT}\""
    echo "SESSION_DAYS=\"7\""
    echo "NEXT_PUBLIC_SITE_URL=\"https://lumenmegahomes.com\""
    echo "NEXT_PUBLIC_API_URL=\"/api/v1\""
  } > .env
  echo "[3/7] .env created from .htaccess + defaults"
else
  echo "[3/7] .env already exists (left untouched)"
fi

# 4. Install dependencies
echo "[4/7] npm install ..."
npm install --no-audit --no-fund --loglevel=error

# 5. Build (prisma generate + next build --webpack)
echo "[5/7] npm run build ..."
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=2048"
PRISMA_CLI="node_modules/prisma/build/index.js"
[ -f "$PRISMA_CLI" ] || PRISMA_CLI="node_modules/.bin/prisma"
node "$PRISMA_CLI" generate --schema server/prisma/schema.prisma
node server/scripts/build-production.cjs

# 6. Import the database (schema + content) from database/lumen_megahomes.sql
echo "[6/7] importing database/lumen_megahomes.sql ..."
node server/scripts/cpanel-import-sql.cjs

# 7. Restart Passenger
mkdir -p tmp
touch tmp/restart.txt
echo "[7/7] Passenger restart requested"

echo
echo "=============================================="
echo " DEPLOY COMPLETE"
echo " Check: https://lumenmegahomes.com"
echo " Logs:  ~/logs/lumenmegahomes-frontend.log"
echo "=============================================="
