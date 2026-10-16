#!/usr/bin/env bash
# Run on the self-hosted GitHub Actions runner after tests pass.
# Each release holds the server (scripts/, api/, vercel.json) next to public/, the document
# root, so a rollback restores the server code together with the content.
set -euo pipefail
cd "$(dirname "$0")/.."

site_home="${SITE_HOME:-$HOME/www-site}"
port="${SITE_PORT:-4175}"
release="$(git rev-parse --short=12 HEAD)-${GITHUB_RUN_ID:-manual}-${GITHUB_RUN_ATTEMPT:-1}"
target="$site_home/releases/$release"
mkdir -p "$site_home/releases"
if [[ -e "$target" ]]; then
  echo "Release already exists: $target" >&2
  exit 1
fi
mkdir -p "$target/public" "$target/scripts" "$target/api"
trap 'rm -rf "$target"' ERR

# Copy tracked public files only. Docs, tests, migrations and server code stay out of the
# document root.
git ls-files -z | python3 -c '
import sys
public_dirs = {"assets", "css", "garden", "js"}
public_files = {"index.html", "works.html", "garden.html", "favicon.svg", "og-image.png", "robots.txt", "sitemap.xml"}
for path in sys.stdin.buffer.read().split(b"\0"):
    name = path.decode()
    if name and (name.split("/", 1)[0] in public_dirs or name in public_files):
        sys.stdout.buffer.write(path + b"\0")
' | rsync -a --from0 --files-from=- ./ "$target/public/"

cp scripts/serve.mjs "$target/scripts/"
cp api/og.js "$target/api/"
cp vercel.json "$target/"

previous="$(readlink "$site_home/current" 2>/dev/null || true)"
ln -sfn "$target" "$site_home/.current-next"
mv -Tf "$site_home/.current-next" "$site_home/current"
trap - ERR
systemctl --user restart www-site.service
healthy=false
for _ in {1..10}; do
  if curl --fail --silent "http://127.0.0.1:$port/" > /dev/null; then
    healthy=true
    break
  fi
  sleep 1
done
if [[ "$healthy" != true ]]; then
  if [[ -n "$previous" ]]; then
    ln -sfn "$previous" "$site_home/.current-next"
    mv -Tf "$site_home/.current-next" "$site_home/current"
    systemctl --user restart www-site.service
  fi
  echo "Health check failed; restored previous release" >&2
  exit 1
fi

# Keep the five newest releases.
ls -1dt "$site_home"/releases/*/ | tail -n +6 | xargs -r rm -rf
echo "Deployed $release"
