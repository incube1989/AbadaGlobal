#!/usr/bin/env bash
# Deploy AbadaGlobal to the Yandex Cloud VM (run from Deploy/).
# Requires: bash (Git Bash/WSL on Windows), ssh/scp, tar.
# Secrets are read from ./connections.env (gitignored).
#
#   bash deploy.sh
#
set -euo pipefail
cd "$(dirname "$0")"

# shellcheck disable=SC1091
source ./connections.env

VM="${VM_USER}@${VM_IP}"
REMOTE_DIR=/srv/abadaglobal
SSH_OPTS="-i ${SSH_KEY} -o StrictHostKeyChecking=accept-new"

echo "==> 1/5 bundle source (excluding node_modules, dist, .git)"
tar -czf src.tar.gz --exclude='node_modules' --exclude='dist' --exclude='.git' -C .. Backend Frontend

echo "==> 2/5 ensure remote dir and upload artifacts"
ssh ${SSH_OPTS} "${VM}" "sudo mkdir -p ${REMOTE_DIR} && sudo chown \$(whoami) ${REMOTE_DIR}"
scp ${SSH_OPTS} src.tar.gz docker-compose.yml Dockerfile Caddyfile remote/setup.sh "${VM}:${REMOTE_DIR}/"

echo "==> 3/5 write .env on the VM (from connections.env)"
ssh ${SSH_OPTS} "${VM}" "cat > ${REMOTE_DIR}/.env" <<EOF
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
AUTH_SECRET=${AUTH_SECRET}
APP_PORT=${APP_PORT}
EOF

echo "==> 4/5 provisioning, build, migrations, start (remote/setup.sh)"
ssh ${SSH_OPTS} "${VM}" "cd ${REMOTE_DIR} && bash setup.sh"

echo "==> 5/5 done"
echo "    Site:    http://${VM_IP}"
echo "    Health:  http://${VM_IP}/api/health"