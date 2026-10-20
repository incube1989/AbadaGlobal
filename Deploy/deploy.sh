#!/usr/bin/env bash
# Deploy AbadaGlobal to the Yandex Cloud VM (run from Deploy/).
# Requires: bash (Git Bash/WSL on Windows), ssh/scp, tar.
# Secrets are read from ./connections.env (gitignored).
#
#   bash deploy.sh
#
# NOTE: the VM's public IP is EPHEMERAL — it changes after every restart.
# The preflight below checks reachability; if it fails, ask the Yandex Cloud
# bot for the CURRENT public IP of the VM, set VM_IP in connections.env and
# re-run (interactive mode can update connections.env for you).
set -euo pipefail
cd "$(dirname "$0")"

# shellcheck disable=SC1091
source ./connections.env

VM="${VM_USER}@${VM_IP}"
REMOTE_DIR=/srv/abadaglobal
SSH_OPTS="-i ${SSH_KEY} -o StrictHostKeyChecking=accept-new"

echo "==> 0/5 check VM reachability (${VM})"
if ! ssh ${SSH_OPTS} -o ConnectTimeout=10 -o BatchMode=yes "${VM}" "true" >/dev/null 2>&1; then
  echo "!! Cannot reach ${VM}."
  echo "!! The VM was likely restarted and got a NEW public IP (this is expected)."
  echo "!! Ask the Yandex Cloud bot for the current public IP of the 'webapp-vm' VM."
  if [ -t 0 ]; then
    read -r -p ">> Enter the new VM public IP now (Enter = abort): " NEW_VM_IP
    if [ -n "${NEW_VM_IP}" ]; then
      sed -i "s/^VM_IP=.*/VM_IP=${NEW_VM_IP}/" ./connections.env
      echo "==> updated VM_IP=${NEW_VM_IP} in connections.env, re-running…"
      exec bash "$0"
    fi
  fi
  echo "!! Fix VM_IP in ./connections.env and re-run:  bash deploy.sh"
  exit 1
fi

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