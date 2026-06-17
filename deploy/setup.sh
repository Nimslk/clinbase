#!/bin/bash
# Run this script on your VPS (Ubuntu 22.04 / Debian 12)
# Usage: bash setup.sh

set -e
DOMAIN="clinbase.ru"   # ← change if your domain is different
APP_DIR="/var/www/medguide"

echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== Installing PM2 ==="
sudo npm install -g pm2

echo "=== Installing Nginx ==="
sudo apt-get install -y nginx

echo "=== Installing Certbot ==="
sudo apt-get install -y certbot python3-certbot-nginx

echo "=== Creating app directory ==="
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

echo "=== Uploading Nginx config ==="
sudo cp nginx.conf /etc/nginx/sites-available/$DOMAIN
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=== Obtaining SSL certificate ==="
echo "Make sure DNS A-record already points to this server IP!"
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m saidxon404@gmail.com

echo "=== Done! Now deploy the app: ==="
echo "  1. Copy project files to $APP_DIR"
echo "  2. cd $APP_DIR && npm ci && npm run build"
echo "  3. cp deploy/ecosystem.config.js $APP_DIR/"
echo "  4. pm2 start ecosystem.config.js"
echo "  5. pm2 save && pm2 startup"
