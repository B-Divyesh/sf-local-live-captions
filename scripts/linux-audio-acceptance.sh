#!/usr/bin/env bash
# Runs the real Linux monitor path against an isolated PulseAudio null sink.
# The shipped JFK excerpt is public-domain speech (US inaugural address, 1961).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mode="${1:-all}"
fixture="$repo_root/tests/fixtures/jfk.wav"
german_fixture="$repo_root/tests/fixtures/german.wav"
cache_root="${LLC_AUDIO_TEST_CACHE:-$repo_root/.cache/linux-audio-acceptance}"
runtime_dir="$(mktemp -d)"
sink_module=""
pulse_pid=""
trace_dir="$(mktemp -d)"
storage_audit_root="$(mktemp -d)"

cleanup() {
  if [ -n "$sink_module" ]; then pactl unload-module "$sink_module" >/dev/null 2>&1 || true; fi
  if [ -n "$pulse_pid" ]; then kill "$pulse_pid" >/dev/null 2>&1 || true; wait "$pulse_pid" 2>/dev/null || true; fi
  rm -rf "$runtime_dir"
  rm -rf "$trace_dir"
  rm -rf "$storage_audit_root"
}
trap cleanup EXIT

command -v pulseaudio >/dev/null || { echo "Install pulseaudio before running this test." >&2; exit 1; }
command -v pactl >/dev/null || { echo "Install pulseaudio-utils before running this test." >&2; exit 1; }
command -v paplay >/dev/null || { echo "Install pulseaudio-utils before running this test." >&2; exit 1; }
command -v curl >/dev/null || { echo "Install curl before running this test." >&2; exit 1; }
command -v strace >/dev/null || { echo "Install strace before running this test." >&2; exit 1; }
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

# Compile before the network-isolated capture assertion. Model files are
# prepared explicitly, then every capture test runs with Cargo offline and a
# complete connect() trace. Unix-socket traffic to this private PulseAudio
# server is expected; IPv4/IPv6 traffic would prove captions need the network.
cargo test --manifest-path src-tauri/Cargo.toml --no-run

prepare_model() {
  local model="$1"
  local name="$2"
  local url="https://huggingface.co/ggerganov/whisper.cpp/resolve/main/$name"
  local destination="$cache_root/models/$name"
  mkdir -p "$cache_root/models"
  if [ ! -s "$destination" ] || [ "$(wc -c < "$destination")" -lt 10000000 ]; then
    echo "Fetching $model model into the isolated acceptance cache."
    curl --fail --location --retry 3 --output "$destination.download" "$url"
    test "$(wc -c < "$destination.download")" -ge 10000000
    mv "$destination.download" "$destination"
  fi
}

run_capture_test() {
  local label="$1"
  shift
  local trace="$trace_dir/$label.connect.log"
  echo "Tracing $label with network disabled for Cargo."
  CARGO_NET_OFFLINE=true strace -f -qq -o "$trace" -e trace=connect "$@"
  if grep -Eq 'AF_INET6?|sin_family=AF_INET6?' "$trace"; then
    echo "Capture test opened an internet socket; local processing claim failed." >&2
    sed -n '1,160p' "$trace" >&2
    exit 1
  fi
}

snapshot_storage_root() {
  local root="$1"
  local output="$2"
  find "$root" -xdev -type f -print0 \
    | sort -z \
    | xargs -0 -r sha256sum > "$output"
}

run_storage_audited_english() {
  local source_model="$cache_root/models/ggml-tiny.en.bin"
  local audit_cache="$storage_audit_root/app-data"
  local audit_trace="$trace_dir/english.storage.log"
  local before="$trace_dir/english.storage.before"
  local after="$trace_dir/english.storage.after"
  local write_attempts="$trace_dir/english.storage.writes"
  local test_binary

  mkdir -p \
    "$storage_audit_root/home" \
    "$storage_audit_root/tmp" \
    "$storage_audit_root/cache" \
    "$storage_audit_root/config" \
    "$storage_audit_root/data" \
    "$storage_audit_root/state" \
    "$storage_audit_root/work" \
    "$storage_audit_root/config/pulse" \
    "$audit_cache/models"
  head -c 256 /dev/urandom > "$storage_audit_root/config/pulse/cookie"
  chmod 600 "$storage_audit_root/config/pulse/cookie"
  cp --reflink=auto "$source_model" "$audit_cache/models/ggml-tiny.en.bin"

  test_binary="$(find "$repo_root/src-tauri/target/debug/deps" -maxdepth 1 -type f -perm /111 -name 'local_live_captions_lib-*' -printf '%T@ %p\n' \
    | sort -rn \
    | sed -n '1s/^[^ ]* //p')"
  test -n "$test_binary" || { echo "The compiled native claim test binary was not found." >&2; exit 1; }

  snapshot_storage_root "$storage_audit_root" "$before"
  echo "Tracing real monitor capture across every filesystem path visible to the process."
  (
    cd "$storage_audit_root/work"
    HOME="$storage_audit_root/home" \
    TMPDIR="$storage_audit_root/tmp" \
    XDG_CACHE_HOME="$storage_audit_root/cache" \
    XDG_CONFIG_HOME="$storage_audit_root/config" \
    XDG_DATA_HOME="$storage_audit_root/data" \
    XDG_STATE_HOME="$storage_audit_root/state" \
    LLC_AUDIO_TEST_CACHE="$audit_cache" \
    LLC_CAPTURE_STORAGE_AUDIT_SCOPE="all-paths" \
    CARGO_NET_OFFLINE=true \
      strace -f -qq -s 4096 -o "$audit_trace" -e trace=%file,%network \
      "$test_binary" tests::claim_linux_monitor_end_to_end_captions_speech_and_restarts --exact --ignored --nocapture
  )

  if grep -Eq 'AF_INET6?|sin_family=AF_INET6?' "$audit_trace"; then
    echo "Capture opened an internet socket; local processing claim failed." >&2
    grep -E 'AF_INET6?|sin_family=AF_INET6?' "$audit_trace" >&2
    exit 1
  fi

  {
    grep -E '(open|openat|openat2)\(.*O_(WRONLY|RDWR|CREAT|TRUNC|APPEND)' "$audit_trace" || true
    grep -E '^[[:digit:]]+[[:space:]]+(creat|mkdir|mkdirat|unlink|unlinkat|rename|renameat|renameat2|link|linkat|symlink|symlinkat|truncate|ftruncate|chmod|fchmod|fchmodat|chown|fchown|fchownat|utime|utimes|futimesat|utimensat|mknod|mknodat)\(' "$audit_trace" || true
  } | grep -v ' = -1 ' > "$write_attempts" || true
  if [ -s "$write_attempts" ]; then
    echo "Capture changed or opened a filesystem path for writing; no-audio-storage claim failed." >&2
    sed -n '1,160p' "$write_attempts" >&2
    exit 1
  fi

  snapshot_storage_root "$storage_audit_root" "$after"
  if ! diff -u "$before" "$after"; then
    echo "Capture changed the isolated HOME, app-data, XDG, temporary, or working directory." >&2
    exit 1
  fi
  echo "Storage audit passed: zero successful path-based write opens or filesystem mutations by capture or its child process; isolated HOME, app-data, XDG, temporary, and working directories are unchanged."
}

run_english() {
  prepare_model "tiny.en" "ggml-tiny.en.bin"
  run_storage_audited_english
}

run_german() {
  prepare_model "base" "ggml-base.bin"
  for german_run in $(seq 1 4); do
    echo "German monitor regression run ${german_run}/4"
    run_capture_test "german-${german_run}" cargo test --manifest-path src-tauri/Cargo.toml claim_german_caption_end_to_end -- --ignored
  done
}

case "$mode" in
  english) run_english ;;
  german) run_german ;;
  all)
    run_english
    run_german
    ;;
  *)
    echo "Usage: $0 [english|german|all]" >&2
    exit 2
    ;;
esac
