import { describe, expect, it } from "vitest";
import { SAMPLE_LINES, toSrt, toTxt } from "../../src/sample";

describe("transcript exports", () => {
  it("writes sequential SRT cues", () => {
    const result = toSrt(SAMPLE_LINES);
    expect(result).toContain("1\n00:00:00,000 --> 00:00:04,000");
    expect(result.match(/-->/g)).toHaveLength(SAMPLE_LINES.length);
  });

  it("@claim:srt-export formats minute, hour, and millisecond boundaries", () => {
    expect(toSrt([{ at: 65.125, end: 3661.999, text: "Boundary caption" }])).toBe(
      "1\n00:01:05,125 --> 01:01:01,999\nBoundary caption\n"
    );
  });

  it("writes one plain text line per caption", () => {
    expect(toTxt(SAMPLE_LINES).trim().split("\n")).toHaveLength(SAMPLE_LINES.length);
  });
});
