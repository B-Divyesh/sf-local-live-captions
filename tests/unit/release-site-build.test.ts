import { describe, expect, it } from "vitest";
import { siteIdentityErrors } from "../../scripts/build-release-site.mjs";

describe("immutable static release builds", () => {
  it("accepts a site built from its exact release tag source", () => {
    const identity = { tag: "v0.1.17", commit: "released-source" };
    expect(siteIdentityErrors({
      releaseTag: identity.tag,
      releaseCommit: identity.commit,
      checkedOutCommit: identity.commit,
      siteIdentity: identity,
    })).toEqual([]);
  });

  it("regresses verification 14: refuses the exact candidate/release mismatch before deployment", () => {
    const candidate = "003f7a396d6cf279326a9d5481ce4f1b82af43a1";
    const publishedRelease = "2db4639d4c28af7f964313d45cc69dfc264b7eb1";
    expect(siteIdentityErrors({
      releaseTag: "v0.1.12",
      releaseCommit: publishedRelease,
      checkedOutCommit: candidate,
      siteIdentity: { tag: "v0.1.12", commit: candidate },
    })).toEqual([
      `Static release must be built from ${publishedRelease}, but the checkout is ${candidate}.`,
      `Built site commit ${candidate} does not match ${publishedRelease}.`,
    ]);
  });

  it("regresses verification 16: refuses to deploy the candidate site under v0.1.16 from 0ecd456", () => {
    const candidate = "80ecfa4539967d063d22cf00abce8946ac0505fd";
    const publishedRelease = "0ecd456533c7eaac81923580e7875c381e1b50ba";
    expect(siteIdentityErrors({
      releaseTag: "v0.1.16",
      releaseCommit: publishedRelease,
      checkedOutCommit: candidate,
      siteIdentity: { tag: "v0.1.16", commit: candidate },
    })).toEqual([
      `Static release must be built from ${publishedRelease}, but the checkout is ${candidate}.`,
      `Built site commit ${candidate} does not match ${publishedRelease}.`,
    ]);
  });
});
