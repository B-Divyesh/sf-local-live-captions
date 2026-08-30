export type ReleaseIdentity = { tag: string; commit: string };
export type ReleaseAsset = { name: string; browser_download_url: string };
export type Release = { tag_name: string; target_commitish: string; assets: ReleaseAsset[] };
export type ReleaseManifest = { version: string; commit: string; assets: { name: string; url: string }[] };

export function publicationErrors(input: {
  identity: ReleaseIdentity;
  release: Release;
  manifest: ReleaseManifest;
  checksums: string;
}): string[];
