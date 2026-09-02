export type LinuxPackageArtifact = { name: string; bytes: number };

export function linuxPackageErrors(input: {
  appImageExtractAndRun?: string;
  ci?: string;
  version: string;
  artifacts: LinuxPackageArtifact[];
}): string[];
