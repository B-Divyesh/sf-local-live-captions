export type SiteReleaseIdentity = { tag: string; commit: string };

export function deploymentIdentityErrors(input: {
  releaseTag: string;
  releaseCommit: string;
  siteIdentity?: SiteReleaseIdentity;
}): string[];
