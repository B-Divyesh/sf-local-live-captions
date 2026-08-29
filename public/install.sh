#!/bin/sh
set -eu

repository="B-Divyesh/sf-local-live-captions"
api="https://api.github.com/repos/$repository/releases/latest"
site="https://local-live-captions.sociobot.in"
identity_json="$(curl -fsSL "$site/release-identity.json")"
release_json="$(curl -fsSL -H 'Accept: application/vnd.github+json' "$api")"
expected_tag="$(printf '%s' "$identity_json" | sed -n 's/.*"tag":"\([^"]*\)".*/\1/p')"
expected_commit="$(printf '%s' "$identity_json" | sed -n 's/.*"commit":"\([^"]*\)".*/\1/p')"
release_tag="$(printf '%s' "$release_json" | sed -n 's/.*"tag_name": "\([^"]*\)".*/\1/p')"
release_commit="$(printf '%s' "$release_json" | sed -n 's/.*"target_commitish": "\([^"]*\)".*/\1/p')"

if [ -z "$expected_tag" ] || [ -z "$expected_commit" ] || [ "$release_tag" != "$expected_tag" ] || [ "$release_commit" != "$expected_commit" ]; then
  echo "Downloads for this site build are still being published. Visit https://github.com/$repository/releases" >&2
  exit 1
fi

asset_url="$(printf '%s' "$release_json" | sed -n 's/.*"browser_download_url": "\([^"]*\.AppImage\)".*/\1/p' | head -n 1)"
checksums_url="$(printf '%s' "$release_json" | sed -n 's/.*"browser_download_url": "\([^"]*SHA256SUMS\)".*/\1/p' | head -n 1)"

if [ -z "$asset_url" ] || [ -z "$checksums_url" ]; then
  echo "The Linux download is not published yet. Visit https://github.com/$repository/releases" >&2
  exit 1
fi

install_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
temporary_dir="$(mktemp -d)"
trap 'rm -rf "$temporary_dir"' EXIT INT TERM
asset_name="${asset_url##*/}"
curl -fsSL "$asset_url" -o "$temporary_dir/$asset_name"
curl -fsSL "$checksums_url" -o "$temporary_dir/SHA256SUMS"
expected="$(sed -n "s/  $asset_name$//p" "$temporary_dir/SHA256SUMS")"
actual="$(sha256sum "$temporary_dir/$asset_name" | cut -d ' ' -f 1)"
[ -n "$expected" ] && [ "$expected" = "$actual" ] || { echo "Checksum did not match. Nothing was installed." >&2; exit 1; }
mkdir -p "$install_dir"
cp "$temporary_dir/$asset_name" "$install_dir/local-live-captions"
chmod 755 "$install_dir/local-live-captions"
echo "Installed Local Live Captions to $install_dir/local-live-captions"
