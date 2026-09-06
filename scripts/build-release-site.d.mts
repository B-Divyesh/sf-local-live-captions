export type SiteReleaseIdentity = { tag: string; commit: string };

export function siteIdentityErrors(input: {
  releaseTag: string;
  releaseCommit: string;
  implementationCommit: string;
  siteIdentity?: SiteReleaseIdentity;
}): string[];
