#!/usr/bin/env bash
# Reproducible Linux entry point for every native claim. It prefers the pinned
# repository container and otherwise installs the same packages in a disposable
# Linux worker before it builds or captures audio.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
claim="${1:-}"

usage() {
  cat >&2 <<'EOF'
Usage: npm run test:native-claim -- <claim-id>

Supported claim ids:
  all
  native-local-processing  no-audio-storage  linux-monitor-end-to-end
  german-caption-end-to-end  language-models  linux-system-audio
  session-transcript  consent-before-capture  local-model-storage
  source-start-validation
EOF
  exit 2
}

case "$claim" in
  all|native-local-processing|no-audio-storage|linux-monitor-end-to-end|german-caption-end-to-end|language-models|linux-system-audio|session-transcript|consent-before-capture|local-model-storage|source-start-validation) ;;
  *) usage ;;
esac

if [ "${LLC_NATIVE_ENV_READY:-}" != "1" ] && command -v docker >/dev/null 2>&1; then
  image="local-live-captions-native-claims:0.1.16"
  docker build --pull --tag "$image" --file "$repo_root/tests/native/Dockerfile" "$repo_root"
  exec docker run --rm \
    --env LLC_NATIVE_ENV_READY=1 \
    --env CARGO_HOME=/tmp/cargo-home \
    --volume "$repo_root:/workspace" \
    --workdir /workspace \
    "$image" bash scripts/run-native-claim.sh "$claim"
fi

ensure_native_packages() {
  local packages=(
    build-essential cmake curl file libclang-dev libglib2.0-dev libwebkit2gtk-4.1-dev
    libappindicator3-dev librsvg2-dev patchelf libasound2-dev libpulse-dev
    pkg-config pulseaudio pulseaudio-utils strace
  )
  local missing=()
  local package
  for package in "${packages[@]}"; do
    dpkg-query -W -f='${db:Status-Status}' "$package" 2>/dev/null | grep -qx installed || missing+=("$package")
  done
  if [ "${#missing[@]}" -eq 0 ]; then return; fi

  if ! command -v apt-get >/dev/null 2>&1; then
    echo "Native claims need the repository test image or apt-get. Install Docker, or run this command on Debian/Ubuntu." >&2
    exit 1
  fi
  if [ "$(id -u)" -ne 0 ] && ! command -v sudo >/dev/null 2>&1; then
    echo "Native claims need permission to install their declared Linux test packages." >&2
    exit 1
  fi
  local elevate=()
  [ "$(id -u)" -eq 0 ] || elevate=(sudo)
  echo "Provisioning native claim packages: ${missing[*]}"
  "${elevate[@]}" apt-get update
  DEBIAN_FRONTEND=noninteractive "${elevate[@]}" apt-get install --yes --no-install-recommends "${missing[@]}"
}

if [ "${LLC_NATIVE_ENV_READY:-}" != "1" ]; then
  ensure_native_packages
fi

cd "$repo_root"

case "$claim" in
  all)
    exec bash scripts/linux-audio-acceptance.sh all
    ;;
  native-local-processing|no-audio-storage|linux-monitor-end-to-end)
    exec bash scripts/linux-audio-acceptance.sh english
    ;;
  german-caption-end-to-end)
    exec bash scripts/linux-audio-acceptance.sh german
    ;;
  language-models)
    exec cargo test --manifest-path src-tauri/Cargo.toml claim_language_models
    ;;
  linux-system-audio)
    exec cargo test --manifest-path src-tauri/Cargo.toml claim_linux_system_audio
    ;;
  session-transcript)
    exec cargo test --manifest-path src-tauri/Cargo.toml claim_session_transcript
    ;;
  consent-before-capture)
    exec cargo test --manifest-path src-tauri/Cargo.toml claim_consent_is_required
    ;;
  local-model-storage)
    exec cargo test --manifest-path src-tauri/Cargo.toml claim_models_are_downloaded
    ;;
  source-start-validation)
    exec cargo test --manifest-path src-tauri/Cargo.toml claim_linux_monitor_must_still_be_exposed
    ;;
esac
