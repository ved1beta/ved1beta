// Final IDE portfolio — with headshot, ⌘K palette, landscape blog imagery.

function CmdK({ open, onClose, onNav }) {
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 20); else setQ(""); }, [open]);

  const items = [
    { id: "readme.md",     label: "readme — intro",        kind: "page" },
    { id: "now.md",        label: "now — this week",       kind: "page" },
    { id: "work.yaml",     label: "work — experience",     kind: "page" },
    { id: "projects/",     label: "projects",              kind: "page" },
    { id: "prs/",          label: "prs — open source merged work", kind: "page" },
    { id: "blog/",          label: "blog — index",          kind: "page" },
    { id: "blog/mxfp4.md",  label: "mxfp4, end-to-end",     kind: "post" },
    { id: "blog/engram.md", label: "engram — conditional memory via scalable lookup", kind: "post" },
    { id: "contact",       label: "contact",               kind: "page" },
    { id: "ext:github",    label: "github.com/ved1beta",   kind: "link", href: "https://github.com/ved1beta" },
    { id: "ext:x",         label: "x / @ant_vedaya",       kind: "link", href: "https://x.com/ant_vedaya" },
    { id: "ext:email",     label: "ved@axolotl.ai",        kind: "link", href: "mailto:ved@axolotl.ai" },
  ];
  const filtered = items.filter(x => x.label.toLowerCase().includes(q.toLowerCase()));
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => { setIdx(0); }, [q]);

  function runItem(it) {
    if (it.kind === "link") window.open(it.href, "_blank");
    else onNav(it.id);
    onClose();
  }

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, background: "#0d0d0d", border: "1px solid var(--border)", borderRadius: 6, boxShadow: "0 24px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 13 }}>›</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(filtered.length - 1, i + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
              else if (e.key === "Enter" && filtered[idx]) runItem(filtered[idx]);
            }}
            placeholder="jump to…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--fg)", fontFamily: "var(--sans)", fontSize: 15 }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: 0.6, border: "1px solid var(--border)", padding: "3px 6px", borderRadius: 3 }}>esc</span>
        </div>
        <div style={{ maxHeight: 380, overflow: "auto", padding: "6px 0" }}>
          {filtered.length === 0 && <div style={{ padding: "16px 18px", color: "var(--muted)", fontSize: 13 }}>No matches.</div>}
          {filtered.map((it, i) => (
            <div key={it.id} onMouseEnter={() => setIdx(i)} onClick={() => runItem(it)} style={{
              padding: "10px 18px", display: "flex", justifyContent: "space-between",
              background: i === idx ? "color-mix(in oklab, var(--accent) 10%, transparent)" : "transparent",
              borderLeft: i === idx ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer", fontSize: 14,
            }}>
              <span style={{ color: i === idx ? "var(--fg)" : "var(--fg-dim)" }}>{it.label}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: 0.6, textTransform: "uppercase" }}>{it.kind}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--border)", padding: "9px 18px", display: "flex", gap: 18, fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: 0.5 }}>
          <span><span style={{ color: "var(--accent)" }}>↑↓</span> navigate</span>
          <span><span style={{ color: "var(--accent)" }}>↵</span> open</span>
          <span><span style={{ color: "var(--accent)" }}>esc</span> close</span>
        </div>
      </div>
    </div>
  );
}

function VariationIDE() {
  const [active, setActive] = React.useState("readme.md");
  const [palette, setPalette] = React.useState(false);

  React.useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(p => !p); }
      else if (e.key === "Escape") setPalette(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const files = [
    { id: "readme.md",     label: "readme.md",     group: "" },
    { id: "now.md",        label: "now.md",        group: "" },
    { id: "work.yaml",     label: "work.yaml",     group: "" },
    { id: "projects/",      label: "projects/",     group: "dir" },
    { id: "prs/",           label: "prs/",          group: "dir" },
    { id: "blog/",          label: "blog/",         group: "dir" },
    { id: "blog/mxfp4.md",  label: "  mxfp4-end-to-end.md", group: "nested" },
    { id: "blog/engram.md", label: "  engram.md",   group: "nested" },
    { id: "contact",       label: "contact",       group: "" },
  ];

  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--sans)", minHeight: "100%", display: "grid", gridTemplateColumns: "260px 1fr", gridTemplateRows: "40px 1fr 28px", height: "100%" }}>
      <CmdK open={palette} onClose={() => setPalette(false)} onNav={setActive} />

      <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 16px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: 0.5, justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#2a2a2a" }}></span>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#2a2a2a" }}></span>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#2a2a2a" }}></span>
          </div>
          <span>~/ved1beta</span>
          <span style={{ color: "var(--accent)" }}>· main</span>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <button onClick={() => setPalette(true)} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--fg-dim)", fontFamily: "var(--mono)", fontSize: 10, padding: "4px 10px", borderRadius: 3, letterSpacing: 0.5, cursor: "pointer" }}>
            ⌘K palette
          </button>
          <span>·</span>
          <span style={{ color: "var(--accent)" }}><Dot /> online</span>
        </div>
      </div>

      <div style={{ borderRight: "1px solid var(--border)", padding: "18px 0", overflow: "auto" }}>
        <div style={{ padding: "0 16px 10px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: 0.8, textTransform: "uppercase" }}>Explorer</div>
        {files.map(f => (
          <div key={f.id} onClick={() => setActive(f.id)} style={{
            padding: f.group === "nested" ? "5px 16px 5px 32px" : "5px 16px",
            fontFamily: "var(--mono)", fontSize: 12.5,
            color: active === f.id ? "var(--accent)" : "var(--fg-dim)",
            background: active === f.id ? "color-mix(in oklab, var(--accent) 7%, transparent)" : "transparent",
            borderLeft: active === f.id ? "2px solid var(--accent)" : "2px solid transparent",
            cursor: "pointer",
          }}>
            {f.group === "dir" ? "▸ " : ""}
            {f.label}
          </div>
        ))}
        <div style={{ padding: "24px 16px 10px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: 0.8, textTransform: "uppercase" }}>Links</div>
        <a href="https://github.com/ved1beta" target="_blank" rel="noreferrer" style={{ display: "block", padding: "5px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--fg-dim)", textDecoration: "none" }}>github/{SITE.github}</a>
        <a href="https://x.com/ant_vedaya" target="_blank" rel="noreferrer" style={{ display: "block", padding: "5px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--fg-dim)", textDecoration: "none" }}>x/{SITE.x.slice(1)}</a>
        <a href="mailto:ved@axolotl.ai" style={{ display: "block", padding: "5px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--fg-dim)", textDecoration: "none" }}>{SITE.email}</a>
      </div>

      <div style={{ overflow: "auto", padding: "40px 56px 80px" }}>
        <IDEContent active={active} onNav={setActive} />
      </div>

      <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border)", padding: "0 16px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "space-between", letterSpacing: 0.5 }}>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ color: "var(--accent)" }}>● ready</span>
          <span>utf-8</span>
          <span>LF</span>
          <span>{active}</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <span>press ⌘K to jump</span>
          <span>spaces: 2</span>
        </div>
      </div>
    </div>
  );
}

function IDEContent({ active, onNav }) {
  if (active === "now.md") return <NowDoc />;
  if (active === "work.yaml") return <WorkDoc />;
  if (active === "projects/") return <ProjectsDoc />;
  if (active === "prs/") return <PRsDoc />;
  if (active === "blog/") return <BlogIndexDoc />;
  if (active === "blog/mxfp4.md") return <BlogPostDoc post={POSTS[0]} />;
  if (active === "blog/engram.md") return <BlogPostDoc post={POSTS[1]} />;
  if (active === "contact") return <ContactDoc />;
  return <ReadmeDoc onNav={onNav} />;
}

function docHeader(name) {
  return <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: 0.8, marginBottom: 28, textTransform: "uppercase" }}>{name}</div>;
}

function prUrl(repo, num) {
  const r = repo === "bitsandbytes-foundation/bnb" ? "bitsandbytes-foundation/bitsandbytes" : repo;
  return `https://github.com/${r}/pull/${num}`;
}

function relativeTime(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 14) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 8) return `${w}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function useLatestPR(fallback) {
  const [pr, setPr] = React.useState(fallback);
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const CACHE_KEY = "ved1beta:latest-pr";
    const TTL_MS = 5 * 60 * 1000;

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && Date.now() - cached.t < TTL_MS && cached.pr) {
          setPr(cached.pr);
          setLive(true);
          return;
        }
      }
    } catch {}

    fetch(`https://api.github.com/search/issues?q=author:${SITE.github}+type:pr&sort=created&order=desc&per_page=10`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data || !Array.isArray(data.items)) return;
        // Drop closed-without-merge PRs — only "opened" or "merged" appear on the site.
        const it = data.items.find(x => {
          const merged = !!(x.pull_request && x.pull_request.merged_at);
          return merged || x.state === "open";
        });
        if (!it) return;
        const repo = (it.repository_url || "").replace("https://api.github.com/repos/", "");
        const merged = !!(it.pull_request && it.pull_request.merged_at);
        const next = {
          repo,
          num: it.number,
          title: it.title,
          url: it.html_url,
          state: merged ? "merged" : "opened",
          created: merged ? it.pull_request.merged_at : it.created_at,
          date: (merged ? it.pull_request.merged_at : it.created_at).slice(0, 10),
        };
        setPr(next);
        setLive(true);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), pr: next })); } catch {}
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  return [pr, live];
}

function useMergedPRs(fallback) {
  const [prs, setPrs] = React.useState(fallback);
  const [status, setStatus] = React.useState("static"); // "static" | "live" | "error"

  React.useEffect(() => {
    let cancelled = false;
    const CACHE_KEY = "ved1beta:merged-prs";
    const TTL_MS = 10 * 60 * 1000;

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && Date.now() - cached.t < TTL_MS && Array.isArray(cached.prs)) {
          setPrs(cached.prs);
          setStatus("live");
          return;
        }
      }
    } catch {}

    const url = `https://api.github.com/search/issues?q=author:${SITE.github}+type:pr+is:merged+archived:false&sort=updated&order=desc&per_page=100`;
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        if (cancelled || !data || !Array.isArray(data.items)) return;
        const items = data.items.map(it => {
          const repo = (it.repository_url || "").replace("https://api.github.com/repos/", "");
          const mergedAt = it.pull_request && it.pull_request.merged_at;
          const date = (mergedAt || it.updated_at || it.created_at || "").slice(0, 10);
          return {
            repo,
            num: it.number,
            title: it.title,
            url: it.html_url,
            state: "merged",
            date,
            mergedAt,
          };
        });
        setPrs(items);
        setStatus("live");
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), prs: items })); } catch {}
      })
      .catch(() => { if (!cancelled) setStatus("error"); });

    return () => { cancelled = true; };
  }, []);

  return [prs, status];
}

function ReadmeDoc({ onNav }) {
  const fallbackPR = [...PRS]
    .filter(p => p.state === "merged")
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const fallbackShape = {
    repo: fallbackPR.repo,
    num: fallbackPR.num,
    title: fallbackPR.title,
    url: prUrl(fallbackPR.repo, fallbackPR.num),
    state: "merged",
    created: null,
    date: fallbackPR.date,
  };
  const [lastShipped, isLive] = useLatestPR(fallbackShape);

  const stateLabel = lastShipped.state === "merged" ? "shipped"
                   : lastShipped.state === "opened" ? "opened"
                   : "closed";
  const stateColor = lastShipped.state === "closed" ? "var(--muted)" : "var(--accent)";
  const whenLabel  = relativeTime(lastShipped.created) || lastShipped.date;

  const latestPost = POSTS[0];
  const currentFocus = NOW[0];
  const latestPostHref = POST_URL[latestPost.slug] || "#";

  const wireRow = {
    display: "grid",
    gridTemplateColumns: "84px 1fr auto",
    gap: 16,
    padding: "12px 16px",
    fontFamily: "var(--mono)",
    fontSize: 12.5,
    alignItems: "center",
    color: "var(--fg-dim)",
    textDecoration: "none",
    cursor: "pointer",
  };
  const wireKind = { color: "var(--accent)", letterSpacing: 0.5, textTransform: "uppercase", fontSize: 10 };
  const wireMeta = { color: "var(--muted)", fontSize: 11 };

  return (
    <div style={{ maxWidth: 760 }}>
      {docHeader("# readme.md")}

      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 30 }}>
        <img src="assets/headshot.jpeg" alt="Ved" style={{ width: 56, height: 56, borderRadius: 999, objectFit: "cover", border: "1px solid var(--border)", filter: "grayscale(0.15) contrast(1.02)" }} />
        <div>
          <div style={{ fontSize: 16, color: "var(--fg)" }}>{SITE.name}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted)" }}>systems @ axolotl · ved1beta</div>
          <div style={{ marginTop: 6, fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--muted)", letterSpacing: 0.3 }}>
            <Dot color={stateColor} /> last {stateLabel}:{" "}
            <a href={lastShipped.url} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
              {lastShipped.repo}#{lastShipped.num}
            </a>
            <span style={{ color: "#444" }}> · </span>
            <span>{whenLabel}</span>
            {isLive && <span style={{ color: "#444" }}> · </span>}
            {isLive && <span style={{ color: "var(--accent)", opacity: 0.7 }}>live</span>}
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: 56, fontWeight: 400, letterSpacing: -1.2, margin: 0, lineHeight: 1.05 }}>
        Training, inference,<br />and the seams between.
      </h1>
      <div style={{ marginTop: 18, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, color: "var(--muted)", lineHeight: 1.5 }}>
        — &ldquo;end of the day, it&rsquo;s who you are when no one is watching.&rdquo;
      </div>

      <p style={{ marginTop: 28, fontSize: 17, lineHeight: 1.65, color: "var(--fg-dim)" }}>
        Contributor to <span style={{ color: "var(--accent)" }}>pytorch/ao</span>,{" "}
        <span style={{ color: "var(--accent)" }}>bitsandbytes</span>,{" "}
        <span style={{ color: "var(--accent)" }}>Axolotl</span>, <span style={{ color: "var(--accent)" }}>PEFT</span>, and{" "}
        <span style={{ color: "var(--accent)" }}>tt-mlir</span>. I work the full pipeline — distributed training (FSDP, Context Parallel, pipeline parallel), quantization (MX, NF, INT), and the inference compilers downstream.
      </p>

      <pre style={{
        marginTop: 36, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4,
        padding: 20, fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--fg-dim)", overflow: "auto", lineHeight: 1.6,
      }}>
{`# train  →  ckpt  →  serve.

train:  `}<span style={{ color: "var(--accent)" }}>axolotl</span>{` · `}<span style={{ color: "var(--accent)" }}>fsdp</span>{` · `}<span style={{ color: "var(--accent)" }}>cp</span>{` · `}<span style={{ color: "var(--accent)" }}>qat</span>{` · `}<span style={{ color: "var(--accent)" }}>lora</span>{` · `}<span style={{ color: "var(--accent)" }}>dpo</span>{`
serve:  `}<span style={{ color: "var(--accent)" }}>vllm</span>{` · `}<span style={{ color: "var(--accent)" }}>sglang</span>{` · `}<span style={{ color: "var(--accent)" }}>tt-mlir</span>{` · `}<span style={{ color: "var(--accent)" }}>mxfp4</span>{` · `}<span style={{ color: "var(--accent)" }}>int8</span>{`

# I work on the seam between them — where the
# interesting bugs always seem to live.`}
      </pre>

      <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { k: "stack",     v: "pytorch/ao · bnb · axolotl · vllm · tt-mlir" },
          { k: "across",    v: "training infra · qat · serving" },
          { k: "at",        v: "Axolotl AI · remote" },
          { k: "reachable", v: SITE.email },
        ].map(row => (
          <div key={row.k} style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 4, display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 12 }}>
            <span style={{ color: "var(--muted)" }}>{row.k}</span>
            <span>{row.v}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 14 }}>
          ↳ on the wire
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
          <a href={lastShipped.url} target="_blank" rel="noreferrer" className="readme-card" style={wireRow}>
            <span style={{ ...wireKind, color: stateColor }}><Dot color={stateColor} /> {stateLabel}</span>
            <span style={{ color: "var(--fg)" }}>{lastShipped.repo} <span style={{ color: "var(--muted)" }}>—</span> {lastShipped.title}</span>
            <span style={wireMeta}>#{lastShipped.num} · {whenLabel}</span>
          </a>
          <div style={{ borderTop: "1px solid var(--border)" }} />
          <a href={latestPostHref} className="readme-card" style={wireRow}>
            <span style={wireKind}><Dot /> essay</span>
            <span style={{ color: "var(--fg)" }}>{latestPost.title} <span style={{ color: "var(--muted)" }}>— {latestPost.sub.toLowerCase()}</span></span>
            <span style={wireMeta}>{latestPost.read}</span>
          </a>
          <div style={{ borderTop: "1px solid var(--border)" }} />
          <div onClick={() => onNav && onNav("now.md")} className="readme-card" style={wireRow}>
            <span style={wireKind}><Dot /> now</span>
            <span style={{ color: "var(--fg)" }}>{currentFocus}</span>
            <span style={wireMeta}>now.md →</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: 0.8, textTransform: "uppercase" }}>
            ↳ best work
          </div>
          <div onClick={() => onNav && onNav("prs/")} style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--muted)", cursor: "pointer", letterSpacing: 0.4 }}>
            full list — prs/ →
          </div>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {PRS.filter(p => p.featured && p.state === "merged").map(p => (
            <a
              key={`${p.repo}-${p.num}`}
              href={prUrl(p.repo, p.num)}
              target="_blank"
              rel="noreferrer"
              className="readme-card"
              style={{
                textDecoration: "none", color: "inherit", display: "block",
                padding: "16px 18px", border: "1px solid var(--border)", borderRadius: 4,
                transition: "background 140ms, border-color 140ms",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, fontFamily: "var(--mono)", fontSize: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ color: p.state === "merged" ? "var(--accent)" : "var(--muted)", letterSpacing: 0.5, textTransform: "uppercase", fontSize: 10 }}>
                    <Dot color={p.state === "merged" ? "var(--accent)" : "#666"} /> {p.state}
                  </span>
                  <span style={{ color: "var(--fg-dim)" }}>{p.repo}#{p.num}</span>
                  {p.area && (
                    <span style={{ color: "var(--muted)", border: "1px solid var(--border)", padding: "1px 6px", borderRadius: 3, fontSize: 9.5, letterSpacing: 0.5, textTransform: "uppercase" }}>
                      {p.area}
                    </span>
                  )}
                </div>
                <span style={{ color: "var(--muted)" }}>{p.date}</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 15, color: "var(--fg)", lineHeight: 1.4 }}>
                {p.title}
              </div>
              {p.summary && (
                <div style={{ marginTop: 6, fontSize: 13.5, color: "var(--fg-dim)", lineHeight: 1.6 }}>
                  {p.summary}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 36, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
        press <span style={{ color: "var(--accent)" }}>⌘K</span> to jump anywhere
      </div>
    </div>
  );
}

function NowDoc() {
  return (
    <div style={{ maxWidth: 720 }}>
      {docHeader("# now.md")}
      <h2 style={{ fontSize: 36, fontWeight: 400, letterSpacing: -0.6, margin: 0 }}>What I&rsquo;m on this week</h2>
      <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>updated {POSTS[0].date}</div>
      <ul style={{ marginTop: 28, padding: 0, listStyle: "none" }}>
        {NOW.map((n, i) => (
          <li key={i} style={{ padding: "16px 0", borderTop: i === 0 ? "1px solid var(--border)" : "none", borderBottom: "1px solid var(--border)", display: "flex", gap: 16, fontSize: 16, lineHeight: 1.55 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", paddingTop: 4, minWidth: 28 }}>{String(i+1).padStart(2, "0")}</span>
            <span style={{ color: "var(--fg-dim)" }}>{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorkDoc() {
  return (
    <div style={{ maxWidth: 760 }}>
      {docHeader("# work.yaml")}
      <pre style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4,
        padding: 24, fontFamily: "var(--mono)", fontSize: 13, color: "var(--fg-dim)", lineHeight: 1.7, overflow: "auto",
      }}>
{WORK.map((w, i) => (
`${i === 0 ? "" : "\n"}- who:   ${w.who}
  role:  ${w.role}
  when:  ${w.when}
  what: >
    ${w.what}
`)).join("")}
      </pre>
      <div style={{ marginTop: 36, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
        Before Axolotl: self-directed OSS work, mostly in the quantization + distributed training corner of PyTorch.
      </div>
    </div>
  );
}

function ProjectsDoc() {
  return (
    <div style={{ maxWidth: 820 }}>
      {docHeader("# projects/")}
      <h2 style={{ fontSize: 36, fontWeight: 400, letterSpacing: -0.6, margin: 0 }}>Side of the desk</h2>
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
        {PROJECTS.length} repos · click a card to open on github
      </div>
      <div style={{ marginTop: 28, display: "grid", gap: 14 }}>
        {PROJECTS.map(p => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="project-card"
            style={{
              textDecoration: "none", color: "inherit", display: "block",
              border: "1px solid var(--border)", padding: "22px 24px", borderRadius: 4,
              transition: "background 140ms, border-color 140ms",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
              <div>
                <div style={{ fontSize: 20, color: "var(--fg)" }}>{p.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 2 }}>{p.sub}</div>
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", whiteSpace: "nowrap" }}>
                github/{p.repo} ↗
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 14.5, lineHeight: 1.65, color: "var(--fg-dim)" }}>
              {p.desc}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {p.stack.split(" · ").map(t => (
                <span key={t} style={{
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase",
                  color: "var(--muted)", border: "1px solid var(--border)", padding: "2px 7px", borderRadius: 3,
                }}>{t}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function PRsDoc() {
  const fallback = PRS.filter(p => p.state === "merged");
  const [prs, status] = useMergedPRs(fallback);
  const [hover, setHover] = React.useState(null);

  const repoCounts = prs.reduce((acc, p) => { acc[p.repo] = (acc[p.repo] || 0) + 1; return acc; }, {});
  const repoCount = Object.keys(repoCounts).length;

  return (
    <div style={{ maxWidth: 960 }}>
      {docHeader("# prs/  —  " + prs.length + " merged")}
      <h2 style={{ fontSize: 36, fontWeight: 400, letterSpacing: -0.6, margin: 0 }}>Open source</h2>
      <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted)" }}>
        {prs.length} merged PRs across {repoCount} {repoCount === 1 ? "repo" : "repos"}
        <span style={{ color: "#444" }}>  ·  </span>
        {status === "live" && <span style={{ color: "var(--accent)" }}>● live from github</span>}
        {status === "static" && <span>loading…</span>}
        {status === "error" && <span style={{ color: "var(--muted)" }}>github unreachable — showing static</span>}
      </div>
      <div style={{ marginTop: 24, border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 80px 90px", padding: "10px 16px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div>repo</div><div>title</div><div>pr</div><div>merged</div>
        </div>
        {prs.map((pr, i) => {
          const isHover = hover === i;
          const href = pr.url || prUrl(pr.repo, pr.num);
          return (
            <a
              key={`${pr.repo}-${pr.num}`}
              href={href}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                display: "grid", gridTemplateColumns: "260px 1fr 80px 90px",
                padding: "11px 16px", fontFamily: "var(--mono)", fontSize: 12,
                borderTop: i === 0 ? "none" : "1px solid var(--border)",
                background: isHover ? "color-mix(in oklab, var(--accent) 6%, transparent)" : "transparent",
                color: isHover ? "var(--fg)" : "var(--fg-dim)",
                textDecoration: "none",
                transition: "background 120ms",
              }}
            >
              <div style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.repo}</div>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.title}</div>
              <div style={{ color: "var(--muted)" }}>#{pr.num}</div>
              <div style={{ color: "var(--muted)" }}>{(pr.date || "").slice(0, 7)}</div>
            </a>
          );
        })}
      </div>
      <div style={{ marginTop: 14, fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--muted)" }}>
        click any row to open on github · live list cached 10 min · source query:{" "}
        <a href={`https://github.com/pulls?q=sort%3Aupdated-desc+is%3Apr+author%3A${SITE.github}+archived%3Afalse+is%3Amerged`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
          author:{SITE.github} is:merged ↗
        </a>
      </div>
    </div>
  );
}

const POST_URL = {
  "mxfp4-end-to-end": "blog.html",
  "engram":           "engram-blog.html",
};

function BlogIndexDoc() {
  return (
    <div style={{ maxWidth: 760 }}>
      {docHeader("# blog/")}
      <h2 style={{ fontSize: 36, fontWeight: 400, letterSpacing: -0.6, margin: 0 }}>Writing</h2>
      <div style={{ marginTop: 28 }}>
        {POSTS.map(p => {
          const href = POST_URL[p.slug];
          const inner = (
            <div style={{ padding: "20px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{p.date} · {p.read} · {p.tags.join(", ")} {!href && <span style={{ color: "#444" }}>· draft</span>}</div>
              <div style={{ fontSize: 20, marginTop: 8 }}>{p.title} {p.featured && <Tag accent>featured</Tag>}</div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>{p.sub}</div>
            </div>
          );
          return href
            ? <a href={href} key={p.slug} style={{ textDecoration: "none", color: "inherit", display: "block" }}>{inner}</a>
            : <div key={p.slug}>{inner}</div>;
        })}
        <div style={{ borderTop: "1px solid var(--border)" }} />
      </div>
    </div>
  );
}

function BlogPostDoc({ post }) {
  const href = POST_URL[post.slug];
  return (
    <div style={{ maxWidth: 720 }}>
      {docHeader("# blog/" + post.slug + ".md")}
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{post.date} · {post.read}</div>
      <h2 style={{ fontSize: 40, fontWeight: 400, letterSpacing: -0.8, margin: "16px 0 0", lineHeight: 1.1 }}>{post.title}</h2>
      <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 19, color: "var(--fg-dim)", marginTop: 10 }}>{post.sub}</div>
      {href ? (
        <div style={{ marginTop: 24 }}>
          <a href={href} style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 12, textDecoration: "none" }}>OPEN FULL ESSAY →</a>
        </div>
      ) : (
        <p style={{ marginTop: 20, color: "var(--muted)", fontSize: 14 }}>Draft — not yet published.</p>
      )}
    </div>
  );
}

function ContactDoc() {
  return (
    <div style={{ maxWidth: 560 }}>
      {docHeader("# contact")}
      <h2 style={{ fontSize: 40, fontWeight: 400, letterSpacing: -0.8, margin: 0 }}>Say hi.</h2>
      <p style={{ marginTop: 18, color: "var(--fg-dim)", fontSize: 16, lineHeight: 1.65 }}>
        Happy to talk about quantization, FSDP sharp edges, or anything at the seam of
        training and serving.
      </p>
      <div style={{ marginTop: 28, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 2 }}>
        <div><span style={{ color: "var(--muted)" }}>email   </span>  <a href="mailto:ved@axolotl.ai" style={{ color: "var(--accent)", textDecoration: "none" }}>{SITE.email}</a></div>
        <div><span style={{ color: "var(--muted)" }}>x       </span>  <a href="https://x.com/ant_vedaya" target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>{SITE.x}</a></div>
        <div><span style={{ color: "var(--muted)" }}>github  </span>  <a href="https://github.com/ved1beta" target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>{SITE.github}</a></div>
      </div>
    </div>
  );
}

window.VariationIDE = VariationIDE;
