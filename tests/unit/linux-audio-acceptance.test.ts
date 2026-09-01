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
