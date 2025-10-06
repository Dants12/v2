#!/usr/bin/env bash
set -euo pipefail

ROOT=/srv/game-v2
cd "$ROOT"

# Server
pushd server
npm ci
npm run build
popd

# Client
pushd client
npm ci
npm run build
rsync -a --delete dist/ /var/www/game-v2/
popd

# Nginx (first time: link the site)
[ -f /etc/nginx/sites-available/game-v2.conf ] || cp "$ROOT/nginx/game-v2.conf" /etc/nginx/sites-available/game-v2.conf
ln -sf /etc/nginx/sites-available/game-v2.conf /etc/nginx/sites-enabled/game-v2.conf
nginx -t && systemctl reload nginx

# Systemd
[ -f /etc/systemd/system/game-v2.service ] || cp "$ROOT/systemd/game-v2.service" /etc/systemd/system/game-v2.service
systemctl daemon-reload
systemctl enable --now game-v2.service
systemctl status --no-pager game-v2.service || true
