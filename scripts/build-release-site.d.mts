export type SiteReleaseIdentity = { tag: string; commit: string };

export function siteIdentityErrors(input: {
  releaseTag: string;
  releaseCommit: string;
  checkedOutCommit: string;
  siteIdentity?: SiteReleaseIdentity;
}): string[];
