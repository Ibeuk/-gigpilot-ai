# 🚀 GigPilot AI — 1-Click Deployment Guide

Deploying **GigPilot AI** on any Linux or Cloud VPS (Ubuntu, Debian, AlmaLinux, CentOS) takes **less than 60 seconds** with the unified installer script.

---

## ⚡ Option 1: 1-Click Linux VPS Deployment (Recommended)

Simply SSH into your Linux VPS and run the single setup command:

```bash
cd gigpilot-ai
bash setup-vps.sh
```

### Or with a Custom Domain:

```bash
bash setup-vps.sh --domain=yourdomain.com
```

### What `setup-vps.sh` Does Automatically:
1. 🐳 **Auto-installs Docker & Docker Compose** if not present.
2. 🔑 **Generates cryptographically secure production secrets** (`.env.production`) for PostgreSQL, Redis, JWTs, and encryption.
3. 🔒 **Configures Nginx reverse proxy** with SSL certificate handling.
4. 🗄️ **Runs Prisma database migrations** automatically once PostgreSQL is ready.
5. 🛡️ **Configures UFW firewall** rules (ports 80, 443, 22).
6. 🔄 **Enables `systemd` auto-restart service** so GigPilot AI automatically launches upon VPS server reboot.

---

## 🖥️ Option 2: 1-Click Windows / Local Deployment

If you are running on a **Windows VPS** or **Local Windows machine**:

- **With Docker**: Double-click `deploy-windows-docker.bat`
- **Without Docker (Native Node.js)**: Double-click `start-vps.bat`
- **Instant Public HTTPS (Cloudflare Tunnel)**: Double-click `start-team-cloudflare-tunnel.bat`

---

## 🌐 Public HTTPS Access via Cloudflare Tunnel (Zero DNS Config)

If you don't have a static public IP or don't want to open router/firewall ports, Cloudflare Tunnel provides instant, safe HTTPS:

```bash
# Download cloudflared (installed automatically by setup script if selected)
cloudflared tunnel --url http://localhost:80
```

---

## 🔍 Service Health & Monitoring

After deployment, check container health with:

```bash
docker compose ps
docker logs -f gigpilot-backend
```

- **Web Dashboard**: `http://<YOUR_VPS_IP>`
- **RSS 2.0 Feed**: `http://<YOUR_VPS_IP>/rss/gigs.xml`
- **Health Check API**: `http://<YOUR_VPS_IP>/api/v1/health`
