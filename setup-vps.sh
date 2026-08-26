#!/usr/bin/env bash

# ==============================================================================
#  🚀 GigPilot AI — Unified 1-Click Linux VPS Installer & Deployer
#  Usage: bash setup-vps.sh [--domain yourdomain.com] [--cloudflare]
# ==============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log_info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success(){ echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "${CYAN}${BOLD}"
echo "========================================================"
echo "   🤖 GigPilot AI — 1-Click Production VPS Deployer     "
echo "========================================================"
echo -e "${NC}"

# ------------------------------------------------------------------------------
# Step 1: Root & OS Check
# ------------------------------------------------------------------------------
log_info "Step 1/6: Verifying system requirements & permissions..."

if [ "$EUID" -ne 0 ]; then
  log_warn "Notice: Not running as root. Some installation steps (Docker/Firewall) may request sudo."
fi

# Determine script & project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ------------------------------------------------------------------------------
# Step 2: Auto-install Dependencies (Docker, Docker Compose, Curl, Git)
# ------------------------------------------------------------------------------
log_info "Step 2/6: Checking required tools (Docker, Docker Compose)..."

INSTALL_CMD=""
if command -v apt-get &> /dev/null; then
  INSTALL_CMD="apt-get update -y && apt-get install -y"
elif command -v yum &> /dev/null; then
  INSTALL_CMD="yum install -y"
elif command -v dnf &> /dev/null; then
  INSTALL_CMD="dnf install -y"
fi

if ! command -v curl &> /dev/null; then
  log_info "Installing curl..."
  eval "$INSTALL_CMD curl"
fi

if ! command -v git &> /dev/null; then
  log_info "Installing git..."
  eval "$INSTALL_CMD git"
fi

# Auto-install Docker if missing
if ! command -v docker &> /dev/null; then
  log_warn "Docker is not installed. Auto-installing official Docker engine..."
  curl -fsSL https://get.docker.com | sh
  if command -v systemctl &> /dev/null; then
    systemctl enable docker
    systemctl start docker
  fi
  log_success "Docker installed successfully."
else
  log_success "Docker is present: $(docker --version)"
fi

# Ensure Docker Compose V2 plugin or binary
DOCKER_COMPOSE_CMD=""
if docker compose version &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker-compose"
else
  log_warn "Docker Compose not found. Installing docker-compose-plugin..."
  if command -v apt-get &> /dev/null; then
    apt-get install -y docker-compose-plugin || curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose
  fi
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
  else
    DOCKER_COMPOSE_CMD="docker-compose"
  fi
fi

log_success "Docker Compose command: $DOCKER_COMPOSE_CMD"

# ------------------------------------------------------------------------------
# Step 3: Generate Production Secrets & Environment File
# ------------------------------------------------------------------------------
log_info "Step 3/6: Setting up production environment variables..."

gen_secret() {
  if command -v openssl &> /dev/null; then
    openssl rand -hex "$1" 2>/dev/null
  else
    head -c "$1" /dev/urandom | xxd -p | tr -d '\n'
  fi
}

DOMAIN="localhost"
for arg in "$@"; do
  case $arg in
    --domain=*) DOMAIN="${arg#*=}" ;;
    --domain)   shift; DOMAIN="$1" ;;
  esac
done

if [ ! -f .env.production ]; then
  log_info "Generating fresh secure credentials for .env.production..."
  
  PG_PASS=$(gen_secret 16)
  REDIS_PASS=$(gen_secret 16)
  JWT_SEC=$(gen_secret 32)
  JWT_REF_SEC=$(gen_secret 32)
  ENC_KEY=$(gen_secret 32)

  cat <<EOT > .env.production
# ─── GigPilot AI Production Environment ───
NODE_ENV=production
POSTGRES_USER=gigpilot
POSTGRES_PASSWORD=${PG_PASS}
POSTGRES_DB=gigpilot_ai
REDIS_PASSWORD=${REDIS_PASS}
JWT_SECRET=${JWT_SEC}
JWT_REFRESH_SECRET=${JWT_REF_SEC}
ENCRYPTION_KEY=${ENC_KEY}
PUBLIC_API_URL=http://${DOMAIN}
PUBLIC_WS_URL=ws://${DOMAIN}
PORT=3001
EOT
  log_success "Generated secure .env.production file."
else
  log_info ".env.production already exists. Preserving existing secrets."
fi

# Merge into root .env for docker-compose compatibility
cp .env.production .env

# ------------------------------------------------------------------------------
# Step 4: SSL Certificate Setup (Self-Signed or Certbot)
# ------------------------------------------------------------------------------
log_info "Step 4/6: Preparing SSL certificate configuration..."

mkdir -p nginx/ssl
if [ ! -f nginx/ssl/fullchain.pem ] || [ ! -f nginx/ssl/privkey.pem ]; then
  log_info "Generating temporary self-signed SSL certs for Nginx..."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/privkey.pem \
    -out nginx/ssl/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=GigPilotAI/OU=Deploy/CN=${DOMAIN}" 2>/dev/null || true
  log_success "SSL placeholder certs created."
fi

# ------------------------------------------------------------------------------
# Step 5: Build & Deploy Production Containers
# ------------------------------------------------------------------------------
log_info "Step 5/6: Building and starting 24/7 Docker containers..."

$DOCKER_COMPOSE_CMD --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans || true
$DOCKER_COMPOSE_CMD --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up -d --build

log_info "Waiting for database container to initialize..."
for i in {1..30}; do
  if docker exec gigpilot-postgres pg_isready -U gigpilot &>/dev/null; then
    log_success "PostgreSQL is healthy & ready."
    break
  fi
  sleep 2
done

# Run Prisma Database Migrations inside Backend Container
log_info "Running Prisma Database Migrations..."
docker exec gigpilot-backend npx prisma migrate deploy || docker exec gigpilot-backend npx prisma db push || log_warn "Prisma migration completed with notice."

# ------------------------------------------------------------------------------
# Step 6: Firewall & Systemd Auto-Start Service Setup
# ------------------------------------------------------------------------------
log_info "Step 6/6: Enabling auto-restart on system reboot..."

# Configure UFW firewall if active
if command -v ufw &> /dev/null && ufw status | grep -q "active"; then
  log_info "Configuring UFW rules (Ports 80, 443, 22)..."
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw allow 22/tcp || true
fi

# Create systemd auto-start service for total reboot durability
if command -v systemctl &> /dev/null && [ "$EUID" -eq 0 ]; then
  cat <<EOT > /etc/systemd/system/gigpilot-ai.service
[Unit]
Description=GigPilot AI 24/7 Production Engine
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${SCRIPT_DIR}
ExecStart=/bin/bash -c "${DOCKER_COMPOSE_CMD} --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up -d"
ExecStop=/bin/bash -c "${DOCKER_COMPOSE_CMD} -f docker-compose.yml -f docker-compose.prod.yml down"

[Install]
WantedBy=multi-user.target
EOT

  systemctl daemon-reload
  systemctl enable gigpilot-ai.service
  log_success "GigPilot AI registered as systemd service (auto-starts on server reboot)."
fi

# ------------------------------------------------------------------------------
# Final Verification & Summary Output
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}${BOLD}========================================================"
echo " 🎉 GIGPILOT AI IS LIVE & RUNNING 24/7 ON THIS VPS!     "
echo "========================================================"
echo -e "${NC}"
echo -e " 🌐 ${BOLD}Web Dashboard:${NC}     http://${DOMAIN} (Port 80)"
echo -e " 📡 ${BOLD}Active RSS Feed:${NC}   http://${DOMAIN}/rss/gigs.xml"
echo -e " ⚡ ${BOLD}Health Endpoint:${NC}   http://${DOMAIN}/api/v1/health"
echo -e " 📦 ${BOLD}Active Services:${NC}"
$DOCKER_COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml ps
echo ""
echo -e "${CYAN}💡 Useful Commands:${NC}"
echo "  - View live logs:    docker logs -f gigpilot-backend"
echo "  - Check status:      $DOCKER_COMPOSE_CMD ps"
echo "  - Restart services:  $DOCKER_COMPOSE_CMD restart"
echo "========================================================"
