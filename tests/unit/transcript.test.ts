import { describe, expect, it } from "vitest";
import { SAMPLE_LINES, toSrt, toTxt } from "../../src/sample";

describe("transcript exports", () => {
  it("writes sequential SRT cues", () => {
    const result = toSrt(SAMPLE_LINES);
    expect(result).toContain("1\n00:00:00,000 --> 00:00:04,000");
    expect(result.match(/-->/g)).toHaveLength(SAMPLE_LINES.length);
  });

  it("writes one plain text line per caption", () => {
    expect(toTxt(SAMPLE_LINES).trim().split("\n")).toHaveLength(SAMPLE_LINES.length);
  });
});
