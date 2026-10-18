#!/usr/bin/env bash
# Provisioning script run ON the VM (uploaded by deploy.sh).
# Installs Docker + compose plugin, builds the app image from src.tar.gz,
# starts PostgreSQL, applies migrations, boots the full stack.
set -euo pipefail

cd /srv/abadaglobal

# make compose interpolations from .env available to this script too
set -a
# shellcheck disable=SC1091
source ./.env
set +a

export DEBIAN_FRONTEND=noninteractive

echo '==> install base packages'
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git

if ! command -v docker >/dev/null 2>&1; then
  echo '==> installing docker (get.docker.com)'
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi
sudo systemctl enable --now docker

if ! docker compose version >/dev/null 2>&1; then
  echo '==> installing docker compose plugin'
  sudo mkdir -p /usr/local/lib/docker/cli-plugins
  sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

echo '==> extract source (ignores errors on rerun)'
tar -xzf src.tar.gz || true
sudo chown -R "$USER":"$USER" /srv/abadaglobal

# docker group membership only applies to NEW sessions — use sudo for determinism
DC() { sudo docker compose "$@"; }

echo '==> build app image'
DC build app

echo '==> start database and wait for readiness'
DC up -d db
for i in $(seq 1 30); do
  if DC exec -T db pg_isready -U "${DB_USER}" -d "${DB_NAME}" >/dev/null 2>&1; then
    echo '    postgres is ready'
    break
  fi
  sleep 2
done

echo '==> run migrations'
DC run --rm app node dist/db/migrate.js

echo '==> start full stack'
DC up -d

echo '==> status'
DC ps