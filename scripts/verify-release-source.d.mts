export type ReleaseSource = {
  releaseTag: string;
  expectedSha: string;
  tagCommit: string;
  packageVersion: string;
  tauriVersion: string;
  cargoVersion: string;
};

export function releaseSourceErrors(source: ReleaseSource): string[];
