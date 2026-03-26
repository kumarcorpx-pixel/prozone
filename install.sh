#!/usr/bin/env bash
set -euo pipefail

# ─── Prozone Installer ───────────────────────────────────────────────
# Usage: curl -fsSL <raw-url>/install.sh | bash
#        or: bash install.sh [--dir <path>]
# ─────────────────────────────────────────────────────────────────────

REPO="https://github.com/kumarcorpx-pixel/prozone.git"
DEFAULT_DIR="prozone"
INSTALL_DIR=""
MIN_NODE_VERSION=18

# ─── Helpers ──────────────────────────────────────────────────────────

info()  { printf '\033[1;34m▸\033[0m %s\n' "$*"; }
ok()    { printf '\033[1;32m✓\033[0m %s\n' "$*"; }
err()   { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; }
die()   { err "$@"; exit 1; }

check_command() {
  command -v "$1" >/dev/null 2>&1 || die "'$1' is required but not installed. Please install it and try again."
}

version_gte() {
  # Returns 0 if $1 >= $2 (major version comparison)
  local have="$1" need="$2"
  [ "$(printf '%s\n%s' "$need" "$have" | sort -V | head -n1)" = "$need" ]
}

# ─── Parse arguments ─────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir)  INSTALL_DIR="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: install.sh [--dir <path>]"
      echo "  --dir   Directory to clone into (default: ./prozone)"
      exit 0
      ;;
    *)  die "Unknown option: $1" ;;
  esac
done

INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_DIR}"

# ─── Preflight checks ────────────────────────────────────────────────

info "Checking prerequisites..."

check_command git
check_command node
check_command npm

NODE_VERSION="$(node -v | sed 's/^v//')"
if ! version_gte "$NODE_VERSION" "$MIN_NODE_VERSION"; then
  die "Node.js >= $MIN_NODE_VERSION is required (found $NODE_VERSION)."
fi
ok "Node.js $NODE_VERSION"

# ─── Clone ────────────────────────────────────────────────────────────

if [ -d "$INSTALL_DIR/.git" ]; then
  info "Directory '$INSTALL_DIR' already exists — pulling latest changes..."
  git -C "$INSTALL_DIR" pull --ff-only || die "Failed to update repository."
else
  info "Cloning repository into '$INSTALL_DIR'..."
  git clone "$REPO" "$INSTALL_DIR" || die "Failed to clone repository."
fi

cd "$INSTALL_DIR"
ok "Repository ready"

# ─── Install dependencies ────────────────────────────────────────────

info "Installing dependencies..."
npm install || die "npm install failed."
ok "Dependencies installed"

# ─── Environment setup ───────────────────────────────────────────────

if [ ! -f .env.local ]; then
  info "Creating .env.local from template..."
  cat > .env.local <<'ENV'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ENV
  ok "Created .env.local — update it with your Supabase credentials"
else
  ok ".env.local already exists, skipping"
fi

# ─── Done ─────────────────────────────────────────────────────────────

echo ""
ok "Prozone installed successfully!"
echo ""
echo "  Next steps:"
echo "    cd $INSTALL_DIR"
echo "    # Edit .env.local with your Supabase credentials"
echo "    npm run dev"
echo ""
