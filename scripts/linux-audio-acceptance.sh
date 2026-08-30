#!/usr/bin/env bash
# Runs the real Linux monitor path against an isolated PulseAudio null sink.
# The shipped JFK excerpt is public-domain speech (US inaugural address, 1961).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$repo_root/tests/fixtures/jfk.wav"
german_fixture="$repo_root/tests/fixtures/german.wav"
cache_root="${LLC_AUDIO_TEST_CACHE:-$repo_root/.cache/linux-audio-acceptance}"
runtime_dir="$(mktemp -d)"
sink_module=""
pulse_pid=""

cleanup() {
  if [ -n "$sink_module" ]; then pactl unload-module "$sink_module" >/dev/null 2>&1 || true; fi
  if [ -n "$pulse_pid" ]; then kill "$pulse_pid" >/dev/null 2>&1 || true; wait "$pulse_pid" 2>/dev/null || true; fi
  rm -rf "$runtime_dir"
}
trap cleanup EXIT

command -v pulseaudio >/dev/null || { echo "Install pulseaudio before running this test." >&2; exit 1; }
command -v pactl >/dev/null || { echo "Install pulseaudio-utils before running this test." >&2; exit 1; }
command -v paplay >/dev/null || { echo "Install pulseaudio-utils before running this test." >&2; exit 1; }
test -f "$fixture" || { echo "Missing speech fixture: $fixture" >&2; exit 1; }
test -f "$german_fixture" || { echo "Missing German speech fixture: $german_fixture" >&2; exit 1; }
mkdir -p "$cache_root"

if [ "$(id -u)" = "0" ]; then
  # Disposable containers commonly run as root; PulseAudio's system mode gives
  # the test process one private server without touching a host sound service.
  export LLC_PULSE_SYSTEM=1
  export PULSE_SERVER="unix:$runtime_dir/native"
  chmod 777 "$runtime_dir"
  pulseaudio --system --daemonize=no --disallow-exit --exit-idle-time=-1 --log-target=stderr --log-level=warning --load="module-native-protocol-unix auth-anonymous=1 socket=$runtime_dir/native" &
  pulse_pid="$!"
else
  export XDG_RUNTIME_DIR="$runtime_dir"
  pulseaudio --daemonize=no --exit-idle-time=-1 --log-target=stderr --log-level=warning &
  pulse_pid="$!"
fi

for attempt in $(seq 1 30); do
  pactl info >/dev/null 2>&1 && break
  sleep 0.2
  [ "$attempt" = 30 ] && { echo "PulseAudio did not start." >&2; exit 1; }
done

sink_module="$(pactl load-module module-null-sink sink_name=llc_test rate=16000 channels=1)"
pactl set-default-sink llc_test
export LLC_TEST_PULSE_SOURCE="llc_test.monitor"
export LLC_TEST_SPEECH_FIXTURE="$fixture"
export LLC_TEST_GERMAN_FIXTURE="$german_fixture"
export LLC_AUDIO_TEST_CACHE="$cache_root"

cd "$repo_root"
cargo test --manifest-path src-tauri/Cargo.toml claim_linux_monitor_end_to_end_captions_speech_and_restarts -- --ignored
for german_run in $(seq 1 4); do
  echo "German monitor regression run ${german_run}/4"
  cargo test --manifest-path src-tauri/Cargo.toml claim_german_caption_end_to_end -- --ignored
done
