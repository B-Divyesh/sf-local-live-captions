const DEFAULT_REPOSITORY = "B-Divyesh/sf-local-live-captions";
const DEFAULT_SITE = "https://local-live-captions.sociobot.in";

const REQUIRED_ASSETS = [
  ["Linux AppImage", /\.AppImage$/i],
  ["Linux DEB", /\.deb$/i],
  ["Linux RPM", /\.rpm$/i],
  ["macOS DMG", /\.dmg$/i],
  ["macOS archive", /\.app\.tar\.gz$/i],
  ["Windows MSI", /\.msi$/i],
  ["Windows EXE", /\.exe$/i],
  ["checksums", /^SHA256SUMS$/],
  ["release manifest", /^latest\.json$/],
];

function checksumNames(text) {
  return new Set(text.split(/\r?\n/).map((line) => line.match(/^[a-f\d]{64}\s+\*?(.+)$/i)?.[1]).filter(Boolean));
}

export function publicationErrors({ identity, release, manifest, checksums }) {
  const errors = [];
  if (!identity?.tag || !identity?.commit) errors.push("The site release identity is incomplete.");
  if (release?.tag_name !== identity?.tag) errors.push(`Latest release tag ${release?.tag_name || "<missing>"} does not match site tag ${identity?.tag || "<missing>"}.`);
  if (release?.target_commitish !== identity?.commit) errors.push(`Latest release commit ${release?.target_commitish || "<missing>"} does not match site commit ${identity?.commit || "<missing>"}.`);
  if (manifest?.version !== identity?.tag) errors.push(`latest.json version ${manifest?.version || "<missing>"} does not match site tag ${identity?.tag || "<missing>"}.`);
  if (manifest?.commit !== identity?.commit) errors.push(`latest.json commit ${manifest?.commit || "<missing>"} does not match site commit ${identity?.commit || "<missing>"}.`);

  const releaseAssets = Array.isArray(release?.assets) ? release.assets : [];
  const releaseNames = new Set(releaseAssets.map((asset) => asset.name));
  for (const [label, pattern] of REQUIRED_ASSETS) {
    if (![...releaseNames].some((name) => pattern.test(name))) errors.push(`The latest release is missing ${label}.`);
  }

  const packageAssets = releaseAssets.filter((asset) => !["SHA256SUMS", "latest.json"].includes(asset.name));
  const manifestAssets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  const manifestByName = new Map(manifestAssets.map((asset) => [asset.name, asset.url]));
  const sums = checksumNames(checksums || "");
  for (const asset of packageAssets) {
    if (manifestByName.get(asset.name) !== asset.browser_download_url) errors.push(`latest.json does not contain the published URL for ${asset.name}.`);
    if (!sums.has(asset.name)) errors.push(`SHA256SUMS does not cover ${asset.name}.`);
  }
  for (const asset of manifestAssets) {
    if (!releaseNames.has(asset.name)) errors.push(`latest.json lists unpublished asset ${asset.name}.`);
  }
  return errors;
}

function options(argv) {
  const parsed = { repository: DEFAULT_REPOSITORY, site: DEFAULT_SITE, attempts: 1, delayMs: 5_000 };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index + 1];
    if (argv[index] === "--repo") parsed.repository = value;
    else if (argv[index] === "--site") parsed.site = value.replace(/\/$/, "");
    else if (argv[index] === "--expected-tag") parsed.expectedTag = value;
    else if (argv[index] === "--expected-commit") parsed.expectedCommit = value;
    else if (argv[index] === "--attempts") parsed.attempts = Number(value);
    else if (argv[index] === "--delay-ms") parsed.delayMs = Number(value);
    else continue;
    index += 1;
  }
  if ((parsed.expectedTag && !parsed.expectedCommit) || (!parsed.expectedTag && parsed.expectedCommit)) {
    throw new Error("Pass both --expected-tag and --expected-commit, or neither.");
  }
  if (!Number.isInteger(parsed.attempts) || parsed.attempts < 1) throw new Error("--attempts must be a positive integer.");
  return parsed;
}

async function getJson(url, headers = {}) {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json", ...headers }, cache: "no-store" });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`);
  return response.json();
}

async function getText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`);
  return response.text();
}

async function audit(parsed) {
  const identity = parsed.expectedTag
    ? { tag: parsed.expectedTag, commit: parsed.expectedCommit }
    : await getJson(`${parsed.site}/release-identity.json?publication-audit=${Date.now()}`);
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const auth = token ? { Authorization: `Bearer ${token}` } : {};
  const release = await getJson(`https://api.github.com/repos/${parsed.repository}/releases/latest`, auth);
  const manifestUrl = release.assets?.find((asset) => asset.name === "latest.json")?.browser_download_url;
  const checksumsUrl = release.assets?.find((asset) => asset.name === "SHA256SUMS")?.browser_download_url;
  const manifest = manifestUrl ? await getJson(manifestUrl) : null;
  const checksums = checksumsUrl ? await getText(checksumsUrl) : "";
  const errors = publicationErrors({ identity, release, manifest, checksums });
  if (errors.length) throw new Error(errors.join("\n"));
  return { identity, packageCount: release.assets.length - 2 };
}

async function run() {
  const parsed = options(process.argv.slice(2));
  let lastError;
  for (let attempt = 1; attempt <= parsed.attempts; attempt += 1) {
    try {
      const result = await audit(parsed);
      console.log(`Published release verified: ${result.identity.tag} -> ${result.identity.commit}; ${result.packageCount} packages plus SHA256SUMS and latest.json.`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < parsed.attempts) await new Promise((resolve) => setTimeout(resolve, parsed.delayMs));
    }
  }
  throw lastError;
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) run();
