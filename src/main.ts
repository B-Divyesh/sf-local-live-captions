import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource-variable/fraunces/wght.css";
import "./styles.css";
import { SAMPLE_LINES, toSrt, toTxt, type CaptionLine } from "./sample";

const app = document.querySelector<HTMLDivElement>("#app")!;
const isDesktop = __DESKTOP__ || Boolean(window.__TAURI_INTERNALS__);
const SITE = "https://local-live-captions.sociobot.in";
const API = "https://api.sociobot.in/api/v1/products/local-live-captions";
const LICENSE_KEY = "sb_license:local-live-captions";

type Route = "/" | "/demo" | "/privacy" | "/terms" | "/404";

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]!));
}

function routeFromPath(): Route {
  const path = location.pathname.replace(/\/$/, "") || "/";
  if (path === "/" && new URLSearchParams(location.search).get("demo") === "1") return "/demo";
  return (["/", "/demo", "/privacy", "/terms", "/404"] as Route[]).includes(path as Route) ? path as Route : "/404";
}

function header(): string {
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="wordmark nav-link" href="/" aria-label="Local Live Captions home"><svg aria-hidden="true" viewBox="0 0 40 40"><path d="M3 15c7-9 11 9 18 0s12 0 16 0"/><path d="M9 26h22M15 33h16"/></svg><span>Local Live<br>Captions</span></a>
    <nav aria-label="Main navigation"><a class="nav-link" href="/demo">Demo</a><a href="/#how">How it works</a><a href="/#price">Price</a><a class="nav-link" href="/privacy">Privacy</a></nav>
  </header>`;
}

function footer(): string {
  return `<footer><div><strong>Local Live Captions</strong><p>Caption Linux calls and recordings on your device.</p></div><div class="footer-links"><a class="nav-link" href="/privacy">Privacy</a><a class="nav-link" href="/terms">Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external)</span></a></div><p class="build">v0.1.7 · build 2026.08.29<br>Generated artwork disclosed in the <a href="https://github.com/B-Divyesh/sf-local-live-captions/blob/main/.factory/design.md" rel="external">design notes <span class="sr-only">(external)</span></a>.</p></footer>`;
}

function shell(content: string): string {
  return `${header()}<div id="route-status" class="sr-only" aria-live="polite"></div>${content}${footer()}`;
}

function preview(kind: "landing" | "demo" = "landing"): string {
  const demo = kind === "demo";
  return `<section class="caption-stage ${demo ? "demo-stage" : ""}" aria-label="Caption overlay preview">
    <div class="stage-top"><span class="capture-state"><i></i>${demo ? "Capturing sample" : "Capturing"}</span><span>English · local model</span></div>
    <div class="caption-stack" aria-live="polite">
      <p>Gravity pulls the cloud inward while pressure pushes back.</p>
      <p class="older">Today we will trace how a star changes over its lifetime.</p>
    </div>
    <div class="stage-controls">
      <button type="button" data-action="toggle-captions">${demo ? "Pause captions" : "Stop captions"}</button>
      <label>Caption size <input data-caption-size type="range" min="20" max="42" value="28"><output>28 px</output></label>
      <button type="button" class="quiet" data-action="export-srt">Export SRT</button>
    </div>
  </section>`;
}

function landing(): string {
  return shell(`<main id="main" tabindex="-1">
    <section class="hero">
      <div class="hero-copy"><h1 tabindex="-1">Caption Linux calls and recordings locally</h1><p class="dek">For deaf and hard-of-hearing students when lectures, calls, or recordings have no captions.</p>
        <div class="hero-action"><a class="button primary nav-link" href="/?demo=1">Try it with sample data <span aria-hidden="true">→</span></a><span>Opens a private sample. Nothing is saved.</span></div>
        <ul class="facts"><li><strong>Private</strong><span>Audio stays on your device.</span></li><li><strong>Offline</strong><span>The sample works without internet.</span></li><li><strong>Free</strong><span>English and German speech models are free.</span></li></ul>
      </div>
      <figure class="hero-art"><picture><source media="(max-width: 720px)" srcset="/assets/listening-room-720.webp"><img src="/assets/listening-room-1120.webp" width="1120" height="747" alt="Paper sound waves fold into caption ribbons above a laptop in an empty lecture room." fetchpriority="high" decoding="async"></picture><figcaption>The app turns audio into captions on your computer.</figcaption></figure>
    </section>
    <section class="product-preview" aria-labelledby="preview-title"><div class="section-mark" aria-hidden="true"></div><div><h2 id="preview-title">Resizable caption overlay</h2><p>Keep the resizable overlay above your lecture or call. Adjust the words without stopping captions.</p></div>${preview()}</section>
    <section id="how" class="steps" aria-labelledby="how-title"><div class="section-mark" aria-hidden="true"></div><h2 id="how-title">How it works</h2>
      <ol><li><span>1</span><div><h3>Choose the audio source</h3><p>Choose an audio source. A monitor source carries system audio through PipeWire or PulseAudio.</p><p>The app checks a monitor source before capture.</p></div></li><li><span>2</span><div><h3>Download a speech model</h3><p>Choose English or German. The model stays on this computer.</p></div></li><li><span>3</span><div><h3>Ask, then start</h3><p>Confirm that everyone agreed to captions. Stop at any time.</p></div></li></ol>
      <div class="walkthrough" aria-label="Desktop app walkthrough"><article><b>1 · Pick</b><div class="mini-ui"><span>Audio source</span><strong>Monitor of Built-in Audio</strong></div></article><article><b>2 · Confirm</b><div class="mini-ui"><span>Consent</span><strong>Everyone has agreed</strong></div></article><article><b>3 · Read</b><div class="mini-ui dark"><span>Capturing</span><strong>That balance can last for billions of years.</strong></div></article></div>
    </section>
    <section class="limits" aria-labelledby="limits-title"><div class="section-mark" aria-hidden="true"></div><div><h2 id="limits-title">Privacy and limits</h2><p>The app does not join calls, name speakers, or save audio. It keeps transcript text only while the session is open.</p></div><ul><li>No cloud recording</li><li>Consent before capture</li><li>Resizable overlay</li><li>No perfect accuracy promise</li></ul></section>
    <section id="price" class="price" aria-labelledby="price-title"><div class="section-mark" aria-hidden="true"></div><div class="price-copy"><p class="kicker">Local Live Captions supporter license</p><h2 id="price-title">Optional $24 supporter license</h2><p>English and German speech models, size controls, and transcript export stay free. A supporter license helps fund updates; it does not unlock caption features.</p><p class="price-number"><strong>$24</strong> once</p><a class="button primary" href="${API}/checkout" rel="external">Buy supporter license <span class="sr-only">(external checkout)</span><span aria-hidden="true">→</span></a><p class="fine">Checkout opens Dodo through Sociobot. Review the checkout terms before paying.</p></div>
      <form id="license-form" class="license-form"><h3>Restore a supporter license</h3><label for="license">License token</label><input id="license" name="license" autocomplete="off" spellcheck="false"><button class="button secondary" type="submit">Verify license</button><p id="license-result" role="status"></p></form>
    </section>
    <section class="download" aria-labelledby="download-title"><div><h2 id="download-title">Download for Linux</h2><p>Choose the package that matches your computer from the current release.</p><p class="sign-note">Current builds are unsigned. Your system may ask you to confirm the download.</p></div><div id="download-slot" class="download-slot" aria-live="polite"><span class="loading-line">Checking the latest release…</span></div></section>
  </main>`);
}

function demoPage(): string {
  return shell(`<div class="demo-banner" role="status"><strong>Demo — sample data, nothing is saved</strong><span><button type="button" data-action="reset-demo">Reset demo</button><a class="nav-link" data-action="exit-demo" href="/">Start for real</a></span></div><main id="main" class="demo-main" tabindex="-1"><div class="demo-heading"><p class="eyebrow">Sample astronomy lecture</p><h1 tabindex="-1">See live captions before installing</h1><p>This sample uses a bundled transcript. It sends no data to other sites.</p></div>${preview("demo")}<aside class="demo-notes"><h2>Session transcript</h2><ol id="transcript-list">${SAMPLE_LINES.map((line) => `<li><time>00:${String(line.at).padStart(2, "0")}</time> ${escapeHtml(line.text)}</li>`).join("")}</ol><div class="export-row"><button class="button secondary" type="button" data-action="export-txt">Export TXT</button><button class="button secondary" type="button" data-action="export-srt">Export SRT</button></div></aside></main>`);
}

const legal = {
  "/privacy": { title: "Privacy — Local Live Captions", h1: "Your audio stays on your computer", intro: "Local Live Captions processes speech on your computer.", body: `<h2>What the app handles</h2><p>The desktop app reads the audio source you choose. It processes that audio in memory with a downloaded speech model. It does not save raw audio.</p><h2>What is stored</h2><p>Settings, downloaded model files, and an optional license token stay on your computer. Transcript text stays in memory until you export it or close the session.</p><h2>Network access</h2><p>The app uses the network when you download a model or verify a supporter license. Model downloads come from Hugging Face. License checks go to Sociobot. Audio and transcript text are never sent with either request.</p><h2>Website data</h2><p>This site has no advertising trackers. The demo uses a separate <code>demo:</code> browser storage namespace and clears it when you leave.</p><h2>Your choices</h2><p>In desktop setup, choose Delete downloaded model or Remove supporter license. Contact <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with privacy questions.</p><p><em>Effective 29 August 2026.</em></p>` },
  "/terms": { title: "Terms — Local Live Captions", h1: "Use captions with consent", intro: "These terms cover the Local Live Captions app and website.", body: `<h2>Permission to caption</h2><p>Tell people when capture starts. Get any consent required by your school, workplace, or local law.</p><h2>Accuracy</h2><p>Automatic captions can miss or change words. Do not use them as the only record for medical, legal, safety, or assessment decisions.</p><h2>Supporter license</h2><p>All caption features remain available without payment. A $24 one-time supporter license helps fund updates. Checkout opens Dodo through Sociobot. Review the checkout terms before paying.</p><h2>Software</h2><p>The app is provided under the MIT License, without warranty. You are responsible for choosing and following each downloaded model license.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for support or terms questions.</p><p><em>Effective 29 August 2026.</em></p>` }
} as const;

function legalPage(route: "/privacy" | "/terms"): string {
  const page = legal[route];
  return shell(`<main id="main" class="legal" tabindex="-1"><p class="eyebrow">Local Live Captions</p><h1 tabindex="-1">${page.h1}</h1><p class="legal-intro">${page.intro}</p>${page.body}</main>`);
}

function notFound(): string {
  return shell(`<main id="main" class="not-found" tabindex="-1"><div class="lost-ribbon" aria-hidden="true"></div><h1 tabindex="-1">Page not found</h1><p>The address does not point to a page here.</p><a class="button primary nav-link" href="/">Return home</a></main>`);
}

function downloadFile(name: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

function wireShared(): void {
  document.querySelector<HTMLAnchorElement>(".skip-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    const main = document.querySelector<HTMLElement>("#main");
    main?.focus();
    main?.scrollIntoView();
  });
  document.querySelectorAll<HTMLAnchorElement>("a.nav-link").forEach((link) => link.addEventListener("click", (event) => {
    if (link.origin !== location.origin || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    if (link.dataset.action === "exit-demo") discardDemo();
    history.pushState({}, "", link.pathname + link.search); render(true);
  }));
  document.querySelectorAll<HTMLInputElement>("[data-caption-size]").forEach((input) => input.addEventListener("input", () => {
    const stage = input.closest<HTMLElement>(".caption-stage")!;
    stage.style.setProperty("--caption-size", `${input.value}px`);
    input.nextElementSibling!.textContent = `${input.value} px`;
    if (routeFromPath() === "/demo") sessionStorage.setItem("demo:caption-size", input.value);
  }));
  document.querySelectorAll<HTMLElement>("[data-action='toggle-captions']").forEach((button) => button.addEventListener("click", () => {
    const isPaused = button.dataset.paused === "true";
    button.dataset.paused = String(!isPaused);
    button.textContent = isPaused ? (routeFromPath() === "/demo" ? "Pause captions" : "Stop captions") : "Resume captions";
    const state = button.closest(".caption-stage")!.querySelector<HTMLElement>(".capture-state")!;
    state.innerHTML = isPaused ? `<i></i>${routeFromPath() === "/demo" ? "Capturing sample" : "Capturing"}` : "Stopped";
  }));
  document.querySelectorAll<HTMLElement>("[data-action='export-srt']").forEach((button) => button.addEventListener("click", () => downloadFile("sample-captions.srt", toSrt(SAMPLE_LINES), "application/x-subrip")));
  document.querySelectorAll<HTMLElement>("[data-action='export-txt']").forEach((button) => button.addEventListener("click", () => downloadFile("sample-transcript.txt", toTxt(SAMPLE_LINES), "text/plain")));
}

function discardDemo(): void {
  Object.keys(sessionStorage).filter((key) => key.startsWith("demo:")).forEach((key) => sessionStorage.removeItem(key));
}

function wireDemo(): void {
  const stored = sessionStorage.getItem("demo:caption-size");
  if (stored) document.querySelectorAll<HTMLInputElement>("[data-caption-size]").forEach((input) => { input.value = stored; input.dispatchEvent(new Event("input")); });
  document.querySelector<HTMLElement>("[data-action='reset-demo']")?.addEventListener("click", () => { discardDemo(); render(); });
}

async function setupDownloads(): Promise<void> {
  const slot = document.querySelector<HTMLElement>("#download-slot");
  if (!slot) return;
  const releasePage = "https://github.com/B-Divyesh/sf-local-live-captions/releases";
  const platform = /Windows/i.test(navigator.userAgent) ? "windows" : /Mac/i.test(navigator.userAgent) ? "macos" : "linux";
  try {
    const cached = localStorage.getItem("llc:release");
    const parsed = cached ? JSON.parse(cached) as { at: number; data: Release } : null;
    let data: Release;
    if (parsed && Date.now() - parsed.at < 3_600_000) data = parsed.data;
    else {
      const response = await fetch("https://api.github.com/repos/B-Divyesh/sf-local-live-captions/releases/latest", { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("release unavailable");
      data = await response.json() as Release; localStorage.setItem("llc:release", JSON.stringify({ at: Date.now(), data }));
    }
    const patterns = platform === "windows" ? [/\.msi$/i, /\.exe$/i] : platform === "macos" ? [/\.dmg$/i] : [/\.AppImage$/i, /\.deb$/i];
    const asset = data.assets.find((item) => patterns.some((pattern) => pattern.test(item.name)));
    if (!asset) throw new Error("platform asset unavailable");
    slot.innerHTML = `<a class="button primary" href="${escapeHtml(asset.browser_download_url)}">Download for ${platform === "macos" ? "macOS" : platform === "windows" ? "Windows" : "Linux"}</a><a href="${releasePage}">See every download <span class="sr-only">(external)</span></a>`;
  } catch {
    slot.innerHTML = `<p>Downloads are being published.</p><a class="button secondary" href="${releasePage}">Check the release page <span class="sr-only">(external)</span></a>`;
  }
}

type Release = { assets: { name: string; browser_download_url: string }[] };

function setupLicense(): void {
  const params = new URLSearchParams(location.search);
  const returned = params.get("license");
  if (returned) { localStorage.setItem(LICENSE_KEY, returned); params.delete("license"); history.replaceState({}, "", `${location.pathname}${params.size ? `?${params}` : ""}`); }
  const form = document.querySelector<HTMLFormElement>("#license-form");
  const result = document.querySelector<HTMLElement>("#license-result");
  const input = document.querySelector<HTMLInputElement>("#license");
  const existing = returned || localStorage.getItem(LICENSE_KEY);
  if (input && existing) input.value = existing;
  if (returned) void verifyStoredLicense(returned, result!);
  form?.addEventListener("submit", async (event) => {
    event.preventDefault(); const token = input!.value.trim();
    if (!token) { result!.textContent = "Enter the license token from your receipt."; return; }
    result!.textContent = "Checking your license…";
    try {
      const response = await fetch(`${API}/verify?license=${encodeURIComponent(token)}`);
      const verdict = await response.json() as { valid: boolean };
      if (verdict.valid) { localStorage.setItem(LICENSE_KEY, token); localStorage.setItem(`${LICENSE_KEY}:verified`, String(Date.now())); result!.textContent = "Supporter license is active on this browser."; }
      else { localStorage.removeItem(LICENSE_KEY); result!.textContent = "This license is not active. Check the token or buy a supporter license."; }
    } catch { result!.textContent = "The license service could not be reached. Try again when online."; }
  });
}

async function verifyStoredLicense(token: string, result: HTMLElement): Promise<void> {
  result.textContent = "Checking your returned license…";
  try {
    const response = await fetch(`${API}/verify?license=${encodeURIComponent(token)}`);
    const verdict = await response.json() as { valid: boolean };
    if (verdict.valid) {
      localStorage.setItem(`${LICENSE_KEY}:verified`, String(Date.now()));
      result.textContent = "Supporter license is active on this browser.";
    } else {
      localStorage.removeItem(LICENSE_KEY);
      localStorage.removeItem(`${LICENSE_KEY}:verified`);
      result.textContent = "This license is not active. Check the token or buy a supporter license.";
    }
  } catch {
    result.textContent = "The license service could not be reached. The supporter license will be checked when you try again online.";
  }
}

function setRouteMetadata(route: Route, title: string): void {
  const descriptions: Record<Route, string> = {
    "/": "Caption Linux calls, lectures, and recordings on your device. Try a private sample before downloading the desktop app.",
    "/demo": "Try a bundled Local Live Captions sample. Sample data stays separate and sends no data to other sites.",
    "/privacy": "Learn what Local Live Captions stores, when it uses the network, and how to remove local data.",
    "/terms": "Read the consent, accuracy, software, and supporter-license terms for Local Live Captions.",
    "/404": "The page you requested is not available in Local Live Captions.",
  };
  const url = `${SITE}${route === "/" ? "/" : route}`;
  const description = descriptions[route];
  document.title = title;
  document.querySelector<HTMLLinkElement>("link[rel='canonical']")?.setAttribute("href", url);
  document.querySelector<HTMLMetaElement>("meta[name='description']")?.setAttribute("content", description);
  document.querySelector<HTMLMetaElement>("meta[property='og:title']")?.setAttribute("content", title);
  document.querySelector<HTMLMetaElement>("meta[property='og:description']")?.setAttribute("content", description);
  document.querySelector<HTMLMetaElement>("meta[property='og:url']")?.setAttribute("content", url);
  document.querySelector<HTMLMetaElement>("meta[name='twitter:title']")?.setAttribute("content", title);
  document.querySelector<HTMLMetaElement>("meta[name='twitter:description']")?.setAttribute("content", description);
}

function render(focusHeading = false): void {
  if (isDesktop) { void renderDesktop(); return; }
  const route = routeFromPath();
  app.innerHTML = route === "/" ? landing() : route === "/demo" ? demoPage() : route === "/privacy" || route === "/terms" ? legalPage(route) : notFound();
  const titles: Record<Route, string> = { "/": "Local Live Captions — Caption calls locally", "/demo": "Demo — Local Live Captions", "/privacy": "Privacy — Local Live Captions", "/terms": "Terms — Local Live Captions", "/404": "Page not found — Local Live Captions" };
  setRouteMetadata(route, titles[route]);
  wireShared(); if (route === "/demo") wireDemo(); if (route === "/") { void setupDownloads(); setupLicense(); }
  requestAnimationFrame(() => {
    if (focusHeading) {
      document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
      document.querySelector<HTMLElement>("#route-status")!.textContent = document.querySelector("h1")?.textContent || "Page loaded";
    }
    window.scrollTo(0, 0);
  });
}

window.addEventListener("popstate", () => render(true));

async function renderDesktop(): Promise<void> {
  const { invoke } = await import("@tauri-apps/api/core");
  let demo = false;
  let consent = false;
  let lines: CaptionLine[] = [];
  let captureTimer = 0;
  let desktopError = "";
  let storageStatus = "";
  const cachedAt = Number(localStorage.getItem(`${LICENSE_KEY}:verified`) || 0);
  let plusActive = Boolean(localStorage.getItem(LICENSE_KEY)) && Date.now() - cachedAt < 86_400_000;
  const draw = (screen: "setup" | "caption" = "setup") => {
    if (screen === "setup") app.innerHTML = `<main id="main" class="desktop-setup"><header class="app-brand"><span class="capture-orb"></span><strong>Local Live Captions</strong><span>Audio never leaves this computer</span></header><section><p class="eyebrow">Ready when the room is</p><h1>Caption audio on this computer</h1><p>Choose an audio source and speech model. Ask everyone before you start.</p><div id="desktop-error" role="alert">${escapeHtml(desktopError)}</div><label>Audio source<select id="audio-device"><option>Loading audio sources…</option></select></label><label>Speech model<select id="model"><option value="tiny.en">English · Tiny · free</option><option value="base.en">English · Base · free</option><option value="base">English + German · Base · free</option></select></label><label class="consent"><input id="consent" type="checkbox"> Everyone has agreed to captions</label><div class="app-actions"><button class="button primary" id="start" disabled>Start captions</button><button class="button secondary" id="sample">Load sample project</button></div><p class="model-note"><button class="text-button" id="download-model">Download the selected model</button>. The small English model is free. Whisper models use the MIT License.</p><div class="storage-actions"><button class="text-button" id="delete-model">Delete downloaded model</button><button class="text-button" id="remove-license" type="button">Remove supporter license</button></div><p id="storage-result" role="status">${escapeHtml(storageStatus)}</p><details class="app-license"><summary>${plusActive ? "Supporter license is active" : "Add or restore a supporter license"}</summary><p>A supporter license costs $24 once and helps fund updates. It does not change caption features. <a href="${API}/checkout" target="_blank" rel="external">Buy supporter license <span class="sr-only">(external checkout)</span></a></p><form id="app-license-form"><label for="app-license">License token</label><input id="app-license" value="${escapeHtml(localStorage.getItem(LICENSE_KEY) || "")}" autocomplete="off"><button class="button secondary" type="submit">Verify license</button><p id="app-license-result" role="status"></p></form></details></section></main>`;
    else app.innerHTML = `<main id="main" class="desktop-caption"><h1 class="sr-only">Live captions</h1><header class="overlay-bar"><span class="capture-state"><i></i>${demo ? "Sample captions" : "Capturing"}</span><span>${demo ? "Bundled sample" : "Audio stays local"}</span><button id="pin" aria-pressed="true">Keep on top</button></header><section class="live-words" aria-live="polite" style="--caption-size:28px">${lines.length ? lines.slice(-3).reverse().map((line, i) => `<p class="${i ? "older" : ""}">${escapeHtml(line.text)}</p>`).join("") : `<p>Listening… Speech will appear here.</p>`}</section><footer class="overlay-controls"><button id="stop" class="stop-button">Stop captions</button><label>Size <input id="app-size" type="range" min="20" max="48" value="28"><output>28 px</output></label><button id="app-export">Export transcript</button></footer></main>`;
  };
  draw();
  const wireSetup = async () => {
    const select = document.querySelector<HTMLSelectElement>("#audio-device")!;
    try { const devices = await invoke<string[]>("list_audio_devices"); select.innerHTML = devices.length ? devices.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name.startsWith("pulse:") ? `System audio monitor · ${name.slice(6)}` : name)}</option>`).join("") : `<option value="">No audio source found</option>`; }
    catch { select.innerHTML = `<option value="">Audio sources could not be read</option>`; }
    document.querySelector<HTMLInputElement>("#consent")!.addEventListener("change", (event) => { consent = (event.target as HTMLInputElement).checked; document.querySelector<HTMLButtonElement>("#start")!.disabled = !consent || !select.value; });
    document.querySelector("#sample")!.addEventListener("click", () => { demo = true; lines = SAMPLE_LINES; draw("caption"); wireCaption(); });
    document.querySelector("#download-model")!.addEventListener("click", async () => { const note = document.querySelector<HTMLElement>(".model-note")!; const model = document.querySelector<HTMLSelectElement>("#model")!.value; note.textContent = "Downloading the selected model…"; try { const path = await invoke<string>("download_model", { model, license: localStorage.getItem(LICENSE_KEY) }); note.textContent = `The selected model is ready at ${path}.`; } catch (error) { note.textContent = `The model could not be downloaded. Check your connection, then try again. ${String(error)}`; } });
    document.querySelector("#delete-model")!.addEventListener("click", async () => { const button = document.querySelector<HTMLButtonElement>("#delete-model")!; const model = document.querySelector<HTMLSelectElement>("#model")!.value; button.textContent = "Deleting downloaded model…"; try { storageStatus = await invoke<string>("delete_model", { model }); } catch (error) { storageStatus = `The model could not be deleted. ${String(error)}`; } draw(); void wireSetup(); });
    document.querySelector<HTMLFormElement>("#app-license-form")!.addEventListener("submit", async (event) => { event.preventDefault(); const token = document.querySelector<HTMLInputElement>("#app-license")!.value.trim(); const result = document.querySelector<HTMLElement>("#app-license-result")!; if (!token) { result.textContent = "Enter the token from your receipt."; return; } result.textContent = "Checking your license…"; try { plusActive = await invoke<boolean>("verify_license", { license: token }); if (plusActive) { localStorage.setItem(LICENSE_KEY, token); localStorage.setItem(`${LICENSE_KEY}:verified`, String(Date.now())); draw(); void wireSetup(); } else result.textContent = "This license is not active. Check the token or buy a supporter license."; } catch { result.textContent = "The license service could not be reached. Try again when online."; } });
    document.querySelector("#remove-license")!.addEventListener("click", () => { localStorage.removeItem(LICENSE_KEY); localStorage.removeItem(`${LICENSE_KEY}:verified`); plusActive = false; storageStatus = "The supporter license was removed from this computer."; draw(); void wireSetup(); });
    document.querySelector("#start")!.addEventListener("click", async () => { const error = document.querySelector<HTMLElement>("#desktop-error")!; error.textContent = "Starting local captions…"; try { await invoke("start_capture", { deviceName: select.value, model: document.querySelector<HTMLSelectElement>("#model")!.value, consent }); desktopError = ""; draw("caption"); wireCaption(); } catch (reason) { error.textContent = `Captions did not start. ${String(reason)} Choose another audio source or download the model.`; } });
  };
  const wireCaption = () => {
    document.querySelector<HTMLInputElement>("#app-size")!.addEventListener("input", (event) => { const value = (event.target as HTMLInputElement).value; document.querySelector<HTMLElement>(".live-words")!.style.setProperty("--caption-size", `${value}px`); document.querySelector("output")!.textContent = `${value} px`; });
    document.querySelector("#app-export")!.addEventListener("click", () => downloadFile("live-captions.srt", toSrt(lines), "application/x-subrip"));
    document.querySelector("#pin")!.addEventListener("click", async (event) => { const button = event.currentTarget as HTMLButtonElement; const pressed = button.getAttribute("aria-pressed") === "true"; await invoke("set_always_on_top", { enabled: !pressed }); button.setAttribute("aria-pressed", String(!pressed)); button.textContent = pressed ? "Allow behind" : "Keep on top"; });
    document.querySelector("#stop")!.addEventListener("click", async () => { window.clearInterval(captureTimer); captureTimer = 0; if (!demo) { try { lines = await invoke<CaptionLine[]>("stop_capture"); } catch {} } demo = false; draw(); void wireSetup(); });
    if (!demo && !captureTimer) captureTimer = window.setInterval(async () => {
      try {
        const status = await invoke<{ active: boolean; error: string | null }>("capture_status");
        if (!status.active) {
          window.clearInterval(captureTimer); captureTimer = 0;
          desktopError = `Captions stopped. ${status.error || "The audio source is no longer available."} Choose another source and try again.`;
          draw(); void wireSetup();
          return;
        }
        lines = await invoke<CaptionLine[]>("get_transcript");
        const words = document.querySelector<HTMLElement>(".live-words");
        if (words) words.innerHTML = lines.length ? lines.slice(-3).reverse().map((line, i) => `<p class="${i ? "older" : ""}">${escapeHtml(line.text)}</p>`).join("") : `<p>Listening… Speech will appear here.</p>`;
      } catch (reason) {
        window.clearInterval(captureTimer); captureTimer = 0;
        desktopError = `Captions stopped. ${String(reason)} Choose another source and try again.`;
        draw(); void wireSetup();
      }
    }, 1500);
  };
  await wireSetup();
}

render();
if (!isDesktop && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "127.0.0.1" || location.hostname === "localhost")) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
