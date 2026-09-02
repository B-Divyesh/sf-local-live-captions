import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

test("German monitor acceptance opens capture before playback and repeats the timing regression", async () => {
  const [native, script] = await Promise.all([
    readFile("src-tauri/src/lib.rs", "utf8"),
    readFile("scripts/linux-audio-acceptance.sh", "utf8"),
  ]);
  const helper = native.slice(native.indexOf("fn capture_fixture_from_monitor("));
  expect(helper.indexOf("let capture = PulseSimple::new(")).toBeGreaterThanOrEqual(0);
  expect(helper.indexOf('std::process::Command::new("paplay")')).toBeGreaterThan(
    helper.indexOf("let capture = PulseSimple::new(")
  );
  expect(script).toContain("for german_run in $(seq 1 4)");
  expect(script).toContain("German monitor regression run ${german_run}/4");
  expect(script).toContain("CARGO_NET_OFFLINE=true strace -f -qq");
  expect(script).toContain("AF_INET6?");
});

test("raw-audio storage audit covers every path and each conventional writable root", async () => {
  const script = await readFile("scripts/linux-audio-acceptance.sh", "utf8");
  expect(script).toContain("-e trace=%file,%network");
  expect(script).toContain("O_(WRONLY|RDWR|CREAT|TRUNC|APPEND)");
  expect(script).toContain("LLC_CAPTURE_STORAGE_AUDIT_SCOPE=\"all-paths\"");
  for (const root of ["HOME", "TMPDIR", "XDG_CACHE_HOME", "XDG_CONFIG_HOME", "XDG_DATA_HOME", "XDG_STATE_HOME", "LLC_AUDIO_TEST_CACHE"]) {
    expect(script, root).toContain(`${root}=\"$`);
  }
  expect(script).toContain("snapshot_storage_root");
  expect(script).toContain('diff -u "$before" "$after"');
  expect(script).not.toContain("capturing must not write raw audio beside the local model");
});
