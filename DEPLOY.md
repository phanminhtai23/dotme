# Deploy dotme

The GitHub Actions workflow tests and builds every pull request. Pushes to
`main` deploy to `/home/opc/projects/dotme` over SSH after CI passes.

## One-time server setup

The server should have Node.js 22, Git, PM2, Nginx, and a clone of this
repository at `/home/opc/projects/dotme`, owned by the SSH deployment user
`opc`. The server clone must be able to fetch
`origin/main` without an interactive prompt.

Create `/home/opc/projects/dotme/.env` and set at least:

```dotenv
PORT=3002
ADMIN_DEFAULT_PASS=<strong-unique-password>
RESEND_API_KEY=<resend-api-key>
RESEND_FROM=<verified-sender>
RESEND_TO=<notification-recipient>
SUPABASE_URL=<current-supabase-project-url>
SUPABASE_SERVICE_ROLE_KEY=<current-supabase-service-role-key>
```

The Supabase credentials are only needed for the initial server-side import.
The deployment script imports the Supabase collections, visit history, and
`uploads` bucket into SQLite before starting the API. It records a migration
marker, skips the import on subsequent deploys, and does not delete Supabase
data. Remove the Supabase credentials from the server `.env` after confirming
the initial deployment if they are no longer needed.

The SQLite database and uploaded files are stored in
`server/data/dotme.sqlite`; this path is git-ignored and is preserved by deploys.
Keep regular backups of this file.

Install PM2 and configure Nginx once:

```bash
npm install --global pm2
cd /home/opc/projects/dotme
sudo cp nginx.nginx /etc/nginx/conf.d/dotme.conf
sudo nginx -t
sudo systemctl reload nginx
```

The config uses ports 80/443 with the distinct `kevinphan.me` host name and
proxies only `/api/` and `/uploads/` to the app's private port `3002`.
It does not bind a separate app port or replace other Nginx virtual hosts.
The server must have a valid certificate for `kevinphan.me` and
`www.kevinphan.me`. With Cloudflare, use **Full (strict)** and install a
Cloudflare Origin Certificate (or another trusted certificate) at the paths
in `nginx.nginx` before enabling the config.

In Cloudflare DNS, point `kevinphan.me` (and `www` if used) to the server's
public IP with proxy enabled. Cloudflare proxying does not replace the origin
certificate: install the certificate and private key on the server, or use
Certbot, and make the Nginx certificate paths match. Ports 80/443 belong to
the shared Nginx service; this site is selected by its domain and does not
need another public application port.

On Oracle Linux, Nginx usually runs as `nginx` and may not be able to traverse
`/home/opc`. Grant it read/traverse access to the built frontend without
making the home directory public:

```bash
sudo setfacl -m u:nginx:--x /home/opc /home/opc/projects
sudo setfacl -m u:nginx:--x /home/opc/projects/dotme
sudo setfacl -R -m u:nginx:r-X /home/opc/projects/dotme/dist
```

## GitHub Actions secrets

Add these repository secrets under **Settings → Secrets and variables →
Actions**:

| Secret | Value |
| --- | --- |
| `DEPLOY_SSH_HOST` | Server IP or SSH hostname |
| `DEPLOY_SSH_USER` | `opc`, with access to the project and its PM2 process |
| `DEPLOY_SSH_PORT` | SSH port; optional, defaults to `22` |
| `DEPLOY_SSH_PRIVATE_KEY` | Private key used by GitHub Actions to SSH to the server |
| `DEPLOY_SSH_KNOWN_HOSTS` | Verified host-key line for the server |

After server setup and secret configuration, push to `main`. CI runs `npm test`
and `npm run build`, then SSH runs `deploy.sh` on the server. The API listens
only on port `3002`; Nginx serves the frontend and proxies `/api/` and
`/uploads/` to it. This does not conflict with the CTU chatbot's ports.

Check deployment health on the server with:

```bash
curl --fail http://127.0.0.1:3002/api/health
sudo -u opc pm2 status
```

The API binds only to `127.0.0.1:3002`; Nginx is its public entry point.
