import { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_JOURNALS = [
  { name: "Journal of Communication", issn: "0021-9916,1460-2466", color: "#E63946" },
  { name: "Political Communication", issn: "1058-4609,1091-7675", color: "#457B9D" },
  { name: "Intl Journal of Press/Politics", issn: "1940-1612,1940-1620", color: "#2A9D8F" },
  { name: "Digital Journalism", issn: "2167-0811,2167-082X", color: "#E9C46A" },
  { name: "New Media & Society", issn: "1461-4448,1461-7315", color: "#F4A261" },
  { name: "Information, Communication & Society", issn: "1369-118X,1468-4462", color: "#6A4C93" },
  { name: "Journal of Computer-Mediated Communication", issn: "1083-6101", color: "#1D3557" },
  { name: "Social Media + Society", issn: "2056-3051", color: "#3A86FF" },
];

const DEFAULT_CONFERENCES = [
  { id: 1, name: "MPSA", fullName: "83rd Midwest Political Science Association Conference", location: "Chicago, IL", dates: "Apr 23–26, 2026", startDate: "2026-04-23", cfpDeadline: "2025-10-07", cfpNote: "Papers, Roundtables & Complete Panels", url: "https://www.mpsanet.org/" },
  { id: 2, name: "ICWSM", fullName: "20th Intl AAAI Conf. on Web and Social Media", location: "Los Angeles, CA", dates: "May 27–29, 2026", startDate: "2026-05-27", cfpDeadline: "2026-01-15", cfpNote: "Full papers & dataset papers", url: "https://www.icwsm.org/2026/" },
  { id: 3, name: "ICA", fullName: "76th International Communication Association Conf.", location: "Cape Town, South Africa", dates: "Jun 4–8, 2026", startDate: "2026-06-04", cfpDeadline: "2025-11-01", cfpNote: "Paper & panel submissions", url: "https://www.icahdq.org/mpage/ICA26" },
  { id: 4, name: "CIRC", fullName: "23rd Chinese Internet Research Conference", location: "Edmonton, Canada", dates: "Jun 22–23, 2026", startDate: "2026-06-22", cfpDeadline: "2026-03-01", cfpNote: "500-word abstracts or full panel proposals", url: "https://www.ualberta.ca/en/china-institute/events/latest/2026/circ/index.html" },
  { id: 5, name: "IAMCR", fullName: "IAMCR 2026 Annual Conference", location: "Galway, Ireland", dates: "Jun 28–Jul 2, 2026", startDate: "2026-06-28", cfpDeadline: "2026-02-03", cfpNote: "Abstracts 800–1000 words", url: "https://iamcr.org/galway2026" },
  { id: 6, name: "SM+Society", fullName: "Intl Conf. on Social Media & Society", location: "Glasgow, UK", dates: "Jul 13–15, 2026", startDate: "2026-07-13", cfpDeadline: "2026-01-26", cfpNote: "Extended abstracts (1000–1500 words)", url: "https://socialmediaandsociety.org/smsociety-2026/" },
  { id: 7, name: "IC2S2", fullName: "12th Intl Conf. on Computational Social Science", location: "Burlington, VT", dates: "Jul 28–31, 2026", startDate: "2026-07-28", cfpDeadline: "2026-03-03", cfpNote: "Extended abstracts (max 2 pages)", url: "https://ic2s2-2026.org/" },
  { id: 8, name: "AEJMC", fullName: "2026 AEJMC Annual Conference", location: "New Orleans, LA", dates: "Aug 5–8, 2026", startDate: "2026-08-05", cfpDeadline: "2026-04-01", cfpNote: "Research papers & extended abstracts", url: "https://www.aejmc.org/aejmc-events/conference" },
  { id: 9, name: "APSA", fullName: "122nd American Political Science Association Meeting", location: "Boston, MA", dates: "Sep 3–6, 2026", startDate: "2026-09-03", cfpDeadline: "2026-01-14", cfpNote: "Papers, panels & roundtables", url: "https://connect.apsanet.org/apsa2026/" },
  { id: 10, name: "IJPP", fullName: "12th Annual Conference of the Intl Journal of Press/Politics", location: "NUS, Singapore", dates: "Nov 18–20, 2026", startDate: "2026-11-18", cfpDeadline: "2026-06-26", cfpNote: "300-word abstracts via online form", url: "https://fass.nus.edu.sg/cnm/2025/02/21/call-for-papers-11th-annual-conference-of-the-international-journal-of-press-politics-19-21-november-2025/" },
  { id: 11, name: "NCA", fullName: "112th National Communication Association Convention", location: "New Orleans, LA", dates: "Nov 19–22, 2026", startDate: "2026-11-19", cfpDeadline: "2026-03-25", cfpNote: "Papers, panels & posters", url: "https://www.natcom.org/nca-112th-annual-convention/" },
];

const TABS = ["Feed", "Journals", "Conferences", "CFPs"];

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function shortDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function daysAgo(d) { if (!d) return Infinity; return Math.floor((new Date() - new Date(d)) / 864e5); }
function daysUntil(d) { if (!d) return Infinity; return Math.ceil((new Date(d) - new Date()) / 864e5); }

/* ─── Apple-Style CSS ─── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  ::selection { background: rgba(0,113,227,0.2); color: #1d1d1f; }

  :root {
    --bg: #f5f5f7;
    --surface: #ffffff;
    --surface-hover: #fafafa;
    --text-1: #1d1d1f;
    --text-2: #6e6e73;
    --text-3: #86868b;
    --text-4: #aeaeb2;
    --border: rgba(0,0,0,0.06);
    --border-s: rgba(0,0,0,0.1);
    --accent: #0071e3;
    --accent-h: #0077ed;
    --accent-bg: rgba(0,113,227,0.06);
    --red: #ff3b30;
    --red-bg: rgba(255,59,48,0.08);
    --green: #34c759;
    --green-bg: rgba(52,199,89,0.08);
    --orange: #ff9500;
    --orange-bg: rgba(255,149,0,0.08);
    --purple: #af52de;
    --purple-bg: rgba(175,82,222,0.08);
    --teal: #30b0c7;
    --teal-bg: rgba(48,176,199,0.08);
    --r-sm: 10px;
    --r-md: 14px;
    --r-lg: 20px;
    --sh-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
    --sh-md: 0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
    --sh-lg: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
    --blur: saturate(180%) blur(20px);
    --sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --serif: 'Newsreader', Georgia, serif;
    --mono: 'IBM Plex Mono', 'SF Mono', monospace;
  }

  body { font-family: var(--sans); background: var(--bg); color: var(--text-1); -webkit-font-smoothing: antialiased; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: .3; } 50% { opacity: 1; } }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
`;

/* ─── Reusable components ─── */

function Badge({ color, bg, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.01em",
      background: bg || "var(--bg)", color: color || "var(--text-2)",
      fontFamily: "var(--sans)", whiteSpace: "nowrap", lineHeight: "18px",
    }}>
      {children}
    </span>
  );
}

function StatusBadge({ type, children }) {
  const styles = {
    new: { color: "var(--red)", bg: "var(--red-bg)" },
    oa: { color: "#1a7d37", bg: "var(--green-bg)" },
    open: { color: "var(--accent)", bg: "var(--accent-bg)" },
    closed: { color: "var(--text-3)", bg: "var(--bg)" },
    urgent: { color: "var(--red)", bg: "var(--red-bg)" },
    warning: { color: "#b35900", bg: "var(--orange-bg)" },
    upcoming: { color: "#0e7a6e", bg: "var(--teal-bg)" },
    past: { color: "var(--text-4)", bg: "var(--bg)" },
  };
  const s = styles[type] || styles.open;
  return <Badge color={s.color} bg={s.bg}>{children}</Badge>;
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
      <div style={{ width: 24, height: 24, border: "2.5px solid var(--border-s)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "var(--text-3)", fontSize: 13, fontWeight: 500 }}>Fetching articles…</span>
    </div>
  );
}

function EmptyState({ icon, children }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 20px", color: "var(--text-3)" }}>
      <div style={{ fontSize: 40, marginBottom: 12, filter: "grayscale(0.2)" }}>{icon || "📭"}</div>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

/* ─── Article Card ─── */
function ArticleCard({ article, journalColor }) {
  const days = daysAgo(article.publication_date);
  const dateParts = article.publication_date ? (() => {
    const d = new Date(article.publication_date);
    return { month: d.toLocaleDateString("en-US", { month: "short" }), day: d.getDate() };
  })() : null;

  return (
    <a href={article.doi ? `https://doi.org/${article.doi}` : (article.url || "#")}
      target="_blank" rel="noopener noreferrer"
      style={{
        display: "flex", gap: 16, padding: "18px 20px",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-md)", textDecoration: "none", color: "inherit",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "var(--sh-sm)", alignItems: "flex-start",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--sh-md)"; e.currentTarget.style.borderColor = "transparent"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--sh-sm)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)"; }}>

      {/* Date column */}
      {dateParts && (
        <div style={{ flexShrink: 0, width: 48, textAlign: "center", paddingTop: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: journalColor || "var(--accent)", textTransform: "uppercase", letterSpacing: "0.03em", lineHeight: 1 }}>{dateParts.month}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{dateParts.day}</div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Meta badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
          <Badge color={journalColor || "var(--text-2)"} bg={journalColor ? journalColor + "14" : undefined}>
            {article.journal_short || article.journal}
          </Badge>
          {days <= 7 && <StatusBadge type="new">New</StatusBadge>}
          {article.open_access && <StatusBadge type="oa">Open Access</StatusBadge>}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4, margin: "0 0 6px", fontFamily: "var(--serif)", color: "var(--text-1)" }}>
          {article.title || "Untitled"}
        </h3>

        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, lineHeight: 1.45, fontWeight: 400 }}>
          {(article.authors || []).slice(0, 4).join(", ")}
          {(article.authors || []).length > 4 ? ` + ${article.authors.length - 4} more` : ""}
        </p>
      </div>

      {/* Chevron */}
      <div style={{ flexShrink: 0, color: "var(--text-4)", fontSize: 16, paddingTop: 14, transition: "color 0.2s" }}>›</div>
    </a>
  );
}

/* ─── CFP Card ─── */
function CfpCard({ cfp, onDelete }) {
  const isPast = cfp.deadline && new Date(cfp.deadline) < new Date();
  const days = cfp.deadline ? daysUntil(cfp.deadline) : null;
  const typeStyles = {
    "Special Issue": { color: "#0e7a6e", bg: "var(--teal-bg)" },
    "Workshop": { color: "#7c3aed", bg: "var(--purple-bg)" },
    "Fellowship": { color: "#b35900", bg: "var(--orange-bg)" },
  };
  const ts = typeStyles[cfp.type] || { color: "var(--text-2)", bg: "var(--bg)" };

  return (
    <div style={{
      padding: "18px 20px", background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--r-md)", boxShadow: "var(--sh-sm)",
      opacity: isPast ? 0.5 : 1, transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
            <Badge color={ts.color} bg={ts.bg}>{cfp.type}</Badge>
            {isPast && <StatusBadge type="closed">Closed</StatusBadge>}
            {!isPast && days !== null && days <= 30 && days > 0 && <StatusBadge type="urgent">{days}d left</StatusBadge>}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px", lineHeight: 1.4, fontFamily: "var(--serif)", color: "var(--text-1)" }}>{cfp.title}</h3>
          {cfp.venue && <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 4px" }}>{cfp.venue}</p>}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
            {cfp.deadline && (
              <span style={{ fontSize: 12, color: isPast ? "var(--text-4)" : "var(--red)", fontWeight: 500 }}>
                Deadline: {formatDate(cfp.deadline)}
              </span>
            )}
            {cfp.url && (
              <a href={cfp.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
                View details →
              </a>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(cfp.id)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-4)", fontSize: 18, padding: "4px 8px",
            borderRadius: 6, transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.target.style.color = "var(--red)"; e.target.style.background = "var(--red-bg)"; }}
          onMouseLeave={e => { e.target.style.color = "var(--text-4)"; e.target.style.background = "none"; }}>
          ×
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════ */
export default function JournalTracker() {
  const [journals, setJournals] = useState(() => { try { const s = localStorage.getItem("jcm-journals"); return s ? JSON.parse(s) : DEFAULT_JOURNALS; } catch { return DEFAULT_JOURNALS; } });
  const [articles, setArticles] = useState([]);
  const [conferences, setConferences] = useState(() => { try { const s = localStorage.getItem("jcm-conf-v7"); return s ? JSON.parse(s) : DEFAULT_CONFERENCES; } catch { return DEFAULT_CONFERENCES; } });
  const [cfps, setCfps] = useState(() => { try { const s = localStorage.getItem("jcm-cfps-v7"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("Feed");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJournal, setFilterJournal] = useState("All");
  const [timeRange, setTimeRange] = useState("30");
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [showAddCfp, setShowAddCfp] = useState(false);
  const [showAddConf, setShowAddConf] = useState(false);
  const [newJournal, setNewJournal] = useState({ name: "", issn: "" });
  const [newCfp, setNewCfp] = useState({ title: "", type: "Special Issue", venue: "", deadline: "", url: "" });
  const [newConf, setNewConf] = useState({ name: "", fullName: "", location: "", dates: "", startDate: "", cfpDeadline: "", cfpNote: "", url: "" });
  const [fetchError, setFetchError] = useState("");
  const [stats, setStats] = useState({});
  const [confFilter, setConfFilter] = useState("upcoming");
  const [cfpFilter, setCfpFilter] = useState("upcoming");
  const hasFetched = useRef(false);

  useEffect(() => { try { localStorage.setItem("jcm-journals", JSON.stringify(journals)); } catch {} }, [journals]);
  useEffect(() => { try { localStorage.setItem("jcm-conf-v7", JSON.stringify(conferences)); } catch {} }, [conferences]);
  useEffect(() => { try { localStorage.setItem("jcm-cfps-v7", JSON.stringify(cfps)); } catch {} }, [cfps]);

  const fetchArticles = useCallback(async () => {
    setLoading(true); setFetchError("");
    const fromDate = new Date(); fromDate.setDate(fromDate.getDate() - parseInt(timeRange));
    const dateStr = fromDate.toISOString().split("T")[0];
    const allArticles = []; const journalStats = {};
    for (const journal of journals) {
      try {
        const issns = journal.issn.split(",").map(s => s.trim()).join("|");
        const res = await fetch(`https://api.openalex.org/works?filter=locations.source.issn:${issns},from_publication_date:${dateStr}&sort=publication_date:desc&per_page=25&mailto=bindotchen@gmail.com`);
        if (!res.ok) continue;
        const data = await res.json();
        journalStats[journal.name] = data.meta?.count || 0;
        (data.results || []).forEach(work => {
          allArticles.push({
            id: work.id, title: work.title, doi: work.doi?.replace("https://doi.org/", ""),
            url: work.primary_location?.landing_page_url || work.doi,
            publication_date: work.publication_date, journal: journal.name,
            journal_short: journal.name.length > 25 ? journal.name.substring(0, 22) + "…" : journal.name,
            journalColor: journal.color,
            authors: (work.authorships || []).map(a => a.author?.display_name).filter(Boolean),
            open_access: work.open_access?.is_oa || false,
          });
        });
      } catch (err) { console.error(`Error fetching ${journal.name}:`, err); }
    }
    allArticles.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
    setArticles(allArticles); setStats(journalStats); setLoading(false);
    if (allArticles.length === 0) setFetchError("No articles found. Try expanding the time range.");
  }, [journals, timeRange]);

  useEffect(() => { if (!hasFetched.current) { hasFetched.current = true; fetchArticles(); } }, [fetchArticles]);

  const filteredArticles = articles.filter(a => {
    if (filterJournal !== "All" && a.journal !== filterJournal) return false;
    if (searchTerm) { const s = searchTerm.toLowerCase(); return (a.title || "").toLowerCase().includes(s) || (a.authors || []).some(au => au.toLowerCase().includes(s)); }
    return true;
  });

  const sortedConfs = [...conferences].sort((a, b) => {
    const da = a.startDate ? new Date(a.startDate) : new Date("2099-01-01");
    const db = b.startDate ? new Date(b.startDate) : new Date("2099-01-01");
    const now = new Date(); const aUp = da >= now, bUp = db >= now;
    if (aUp && bUp) return da - db; if (!aUp && !bUp) return db - da; return aUp ? -1 : 1;
  });
  const filteredConfs = sortedConfs.filter(c => {
    if (confFilter === "upcoming") return !c.startDate || new Date(c.startDate) >= new Date();
    if (confFilter === "past") return c.startDate && new Date(c.startDate) < new Date();
    return true;
  });
  const filteredCfps = cfps.filter(c => {
    if (cfpFilter === "upcoming") return !c.deadline || new Date(c.deadline) >= new Date();
    if (cfpFilter === "past") return c.deadline && new Date(c.deadline) < new Date();
    return true;
  });

  const addJournal = () => { if (!newJournal.name || !newJournal.issn) return; const colors = ["#264653","#E76F51","#606C38","#BC6C25","#023047","#8338EC","#FF006E","#3A86FF"]; setJournals([...journals, { ...newJournal, color: colors[journals.length % colors.length] }]); setNewJournal({ name: "", issn: "" }); setShowAddJournal(false); };
  const addCfp = () => { if (!newCfp.title) return; setCfps([...cfps, { ...newCfp, id: Date.now() }]); setNewCfp({ title: "", type: "Special Issue", venue: "", deadline: "", url: "" }); setShowAddCfp(false); };
  const addConf = () => { if (!newConf.name || !newConf.fullName) return; setConferences([...conferences, { ...newConf, id: Date.now() }]); setNewConf({ name: "", fullName: "", location: "", dates: "", startDate: "", cfpDeadline: "", cfpNote: "", url: "" }); setShowAddConf(false); };

  const totalArticles = filteredArticles.length;
  const newThisWeek = articles.filter(a => daysAgo(a.publication_date) <= 7).length;
  const oaCount = articles.filter(a => a.open_access).length;
  const upcomingConfCount = conferences.filter(c => !c.startDate || new Date(c.startDate) >= new Date()).length;

  /* ─── Shared inline styles ─── */
  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--border-s)",
    borderRadius: "var(--r-sm)", fontFamily: "var(--sans)", background: "var(--surface)",
    color: "var(--text-1)", outline: "none", transition: "all 0.2s", boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6,
    display: "block", fontFamily: "var(--sans)", letterSpacing: "0.01em",
  };
  const btnPrimary = {
    background: "var(--accent)", color: "#fff", border: "none", padding: "10px 22px",
    borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 600,
    fontFamily: "var(--sans)", transition: "all 0.2s", whiteSpace: "nowrap",
  };
  const btnSecondary = {
    background: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border-s)",
    padding: "10px 22px", borderRadius: 100, cursor: "pointer", fontSize: 13,
    fontWeight: 500, fontFamily: "var(--sans)", transition: "all 0.2s",
  };
  const chipBtn = (active) => ({
    padding: "6px 14px", borderRadius: 100, border: "1px solid " + (active ? "var(--accent)" : "var(--border-s)"),
    background: active ? "var(--accent)" : "var(--surface)", color: active ? "#fff" : "var(--text-2)",
    fontSize: 13, fontWeight: 500, fontFamily: "var(--sans)", cursor: "pointer",
    transition: "all 0.2s", textTransform: "capitalize", whiteSpace: "nowrap",
  });
  const formPanel = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)", padding: 24, marginBottom: 16,
    boxShadow: "var(--sh-sm)", animation: "fadeUp 0.3s ease both",
  };

  return (
    <div style={{ fontFamily: "var(--sans)", maxWidth: 960, margin: "0 auto", padding: "0 20px", minHeight: "100vh" }}>
      <style>{globalCSS}</style>

      {/* ─── Header ─── */}
      <header style={{ textAlign: "center", padding: "56px 0 32px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 10 }}>
          Journalism, Communication & Media
        </div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10, fontFamily: "var(--sans)" }}>
          Scholar<span style={{ background: "linear-gradient(135deg, #0071e3, #6e3adb, #e3478c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Wire</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", fontWeight: 400, maxWidth: 480, margin: "0 auto" }}>
          Track the latest research across top journals, conferences & calls for papers.
        </p>
      </header>

      {/* ─── Stats Row ─── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10,
        marginBottom: 16,
      }}>
        {[
          { label: "Articles", value: totalArticles, icon: "📄" },
          { label: "New this week", value: newThisWeek, icon: "✨" },
          { label: "Open Access", value: oaCount, icon: "🔓" },
          { label: "Journals", value: journals.length, icon: "📚" },
          { label: "Upcoming", value: upcomingConfCount, icon: "📅" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--r-md)", padding: "16px 14px", textAlign: "center",
            boxShadow: "var(--sh-sm)",
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Navigation ─── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, padding: "8px 0", marginBottom: 8 }}>
        <nav style={{
          display: "flex", gap: 4,
          background: "rgba(255,255,255,0.72)", backdropFilter: "var(--blur)", WebkitBackdropFilter: "var(--blur)",
          borderRadius: 12, padding: 4, border: "1px solid var(--border)", boxShadow: "var(--sh-sm)",
          width: "fit-content", margin: "0 auto",
        }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", fontSize: 13, fontWeight: tab === t ? 600 : 500,
              color: tab === t ? "var(--text-1)" : "var(--text-2)",
              background: tab === t ? "var(--surface)" : "none",
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "var(--sans)", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {t}
            </button>
          ))}
        </nav>
      </div>

      {/* ════════ FEED ════════ */}
      {tab === "Feed" && (
        <div style={{ animation: "fadeUp 0.4s ease both" }}>
          {/* Search + filters */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 0 16px" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-4)", fontSize: 15, pointerEvents: "none" }}>⌕</span>
              <input type="text" placeholder="Search titles, authors…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 38, boxShadow: "var(--sh-sm)" }}
                onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-bg), var(--sh-sm)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "var(--sh-sm)"; }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select value={filterJournal} onChange={e => setFilterJournal(e.target.value)}
                style={{ ...inputStyle, width: "auto", flex: "0 1 240px", cursor: "pointer", boxShadow: "var(--sh-sm)" }}>
                <option value="All">All Journals</option>
                {journals.map(j => <option key={j.issn} value={j.name}>{j.name}</option>)}
              </select>
              <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
                style={{ ...inputStyle, width: "auto", flex: "0 1 160px", cursor: "pointer", boxShadow: "var(--sh-sm)" }}>
                <option value="7">Past 7 days</option>
                <option value="14">Past 14 days</option>
                <option value="30">Past 30 days</option>
                <option value="60">Past 60 days</option>
                <option value="90">Past 90 days</option>
              </select>
              <button onClick={fetchArticles} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} disabled={loading}>
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading && <Spinner />}
          {fetchError && <EmptyState icon="🔍">{fetchError}</EmptyState>}

          {!loading && filteredArticles.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 40 }}>
              {filteredArticles.map((a, i) => (
                <div key={a.id} style={{ animation: `fadeUp 0.4s ease ${Math.min(i * 0.03, 0.3)}s both` }}>
                  <ArticleCard article={a} journalColor={a.journalColor} />
                </div>
              ))}
            </div>
          )}
          {!loading && !fetchError && filteredArticles.length === 0 && articles.length > 0 && (
            <EmptyState icon="🔍">No articles match your filters.</EmptyState>
          )}
        </div>
      )}

      {/* ════════ JOURNALS ════════ */}
      {tab === "Journals" && (
        <div style={{ animation: "fadeUp 0.4s ease both", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0 }}>
              Manage your tracked journals. Articles fetched via OpenAlex.
            </p>
            <button onClick={() => setShowAddJournal(!showAddJournal)} style={btnPrimary}>+ Add Journal</button>
          </div>

          {showAddJournal && (
            <div style={formPanel}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: "1 1 260px" }}>
                  <label style={labelStyle}>Journal Name</label>
                  <input value={newJournal.name} onChange={e => setNewJournal({ ...newJournal, name: e.target.value })}
                    placeholder="e.g. Journalism & Mass Communication Quarterly" style={inputStyle} />
                </div>
                <div style={{ flex: "0 1 200px" }}>
                  <label style={labelStyle}>ISSN (print, online)</label>
                  <input value={newJournal.issn} onChange={e => setNewJournal({ ...newJournal, issn: e.target.value })}
                    placeholder="e.g. 1077-6990,2161-4326" style={inputStyle} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addJournal} style={btnPrimary}>Add</button>
                  <button onClick={() => setShowAddJournal(false)} style={btnSecondary}>Cancel</button>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 12 }}>
                Find ISSNs at <a href="https://portal.issn.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 500 }}>portal.issn.org</a>. Use both print & online ISSNs separated by comma.
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {journals.map((j, i) => (
              <div key={j.issn} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--r-md)", boxShadow: "var(--sh-sm)",
                transition: "all 0.3s", animation: `fadeUp 0.4s ease ${i * 0.04}s both`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "var(--r-sm)", background: j.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: j.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{j.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
                    {j.issn}{stats[j.name] !== undefined && ` · ${stats[j.name]} articles`}
                  </div>
                </div>
                <button onClick={() => setJournals(journals.filter(x => x.issn !== j.issn))}
                  style={{
                    ...btnSecondary, padding: "6px 14px", fontSize: 12, borderRadius: 8,
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "var(--red)"; e.target.style.color = "var(--red)"; e.target.style.background = "var(--red-bg)"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.color = "var(--text-2)"; e.target.style.background = "var(--surface)"; }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ CONFERENCES ════════ */}
      {tab === "Conferences" && (
        <div style={{ animation: "fadeUp 0.4s ease both", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["upcoming", "past", "all"].map(f => (
                <button key={f} onClick={() => setConfFilter(f)} style={chipBtn(confFilter === f)}>{f}</button>
              ))}
            </div>
            <button onClick={() => setShowAddConf(!showAddConf)} style={btnPrimary}>+ Add Conference</button>
          </div>

          {showAddConf && (
            <div style={formPanel}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "0 1 120px" }}><label style={labelStyle}>Short Name</label><input value={newConf.name} onChange={e => setNewConf({ ...newConf, name: e.target.value })} placeholder="e.g. WAPOR" style={inputStyle} /></div>
                  <div style={{ flex: "1 1 280px" }}><label style={labelStyle}>Full Name</label><input value={newConf.fullName} onChange={e => setNewConf({ ...newConf, fullName: e.target.value })} placeholder="e.g. World Association for Public Opinion Research" style={inputStyle} /></div>
                  <div style={{ flex: "0 1 180px" }}><label style={labelStyle}>Location</label><input value={newConf.location} onChange={e => setNewConf({ ...newConf, location: e.target.value })} placeholder="e.g. Berlin, Germany" style={inputStyle} /></div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "0 1 170px" }}><label style={labelStyle}>Event Dates</label><input value={newConf.dates} onChange={e => setNewConf({ ...newConf, dates: e.target.value })} placeholder="e.g. Jun 10–13, 2026" style={inputStyle} /></div>
                  <div style={{ flex: "0 1 160px" }}><label style={labelStyle}>Start Date</label><input type="date" value={newConf.startDate} onChange={e => setNewConf({ ...newConf, startDate: e.target.value })} style={inputStyle} /></div>
                  <div style={{ flex: "0 1 160px" }}><label style={labelStyle}>CFP Deadline</label><input type="date" value={newConf.cfpDeadline} onChange={e => setNewConf({ ...newConf, cfpDeadline: e.target.value })} style={inputStyle} /></div>
                  <div style={{ flex: "1 1 220px" }}><label style={labelStyle}>CFP Note</label><input value={newConf.cfpNote} onChange={e => setNewConf({ ...newConf, cfpNote: e.target.value })} placeholder="e.g. Full papers" style={inputStyle} /></div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 300px" }}><label style={labelStyle}>URL</label><input value={newConf.url} onChange={e => setNewConf({ ...newConf, url: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
                  <button onClick={addConf} style={btnPrimary}>Add</button>
                  <button onClick={() => setShowAddConf(false)} style={btnSecondary}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Conference cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredConfs.map((c, i) => {
              const isPast = c.startDate && new Date(c.startDate) < new Date();
              const isPastCfp = c.cfpDeadline && new Date(c.cfpDeadline) < new Date();
              const cfpDays = c.cfpDeadline ? daysUntil(c.cfpDeadline) : null;
              const eventDays = c.startDate ? daysUntil(c.startDate) : null;

              return (
                <div key={c.id} style={{
                  display: "flex", gap: 16, padding: "18px 20px",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", boxShadow: "var(--sh-sm)",
                  opacity: isPast ? 0.5 : 1, transition: "all 0.3s",
                  animation: `fadeUp 0.4s ease ${Math.min(i * 0.04, 0.3)}s both`,
                  alignItems: "flex-start",
                }}>
                  {/* Abbreviation block */}
                  <div style={{
                    flexShrink: 0, width: 60, height: 60, borderRadius: "var(--r-sm)",
                    background: isPast ? "var(--bg)" : "var(--accent-bg)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{
                      fontSize: c.name.length > 6 ? 11 : 14, fontWeight: 700,
                      color: isPast ? "var(--text-4)" : "var(--accent)",
                      letterSpacing: "-0.02em",
                    }}>{c.name}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                      {isPast ? <StatusBadge type="past">Past</StatusBadge> :
                        !isPastCfp && c.cfpDeadline ? (
                          cfpDays <= 14 ? <StatusBadge type="urgent">{cfpDays}d to CFP</StatusBadge> :
                          cfpDays <= 30 ? <StatusBadge type="warning">{cfpDays}d to CFP</StatusBadge> :
                          <StatusBadge type="open">CFP Open</StatusBadge>
                        ) : c.cfpDeadline ? <StatusBadge type="closed">CFP Closed</StatusBadge> :
                        eventDays !== null && eventDays <= 90 ? <StatusBadge type="warning">In {eventDays}d</StatusBadge> :
                        <StatusBadge type="upcoming">Upcoming</StatusBadge>}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 2px", lineHeight: 1.35 }}>
                      {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{c.fullName}</a> : c.fullName}
                    </h3>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 6, fontSize: 13, color: "var(--text-3)" }}>
                      <span>📍 {c.location}</span>
                      <span>📆 {c.dates}</span>
                      {c.cfpDeadline && (
                        <span style={{ color: isPastCfp ? "var(--text-4)" : "var(--red)", fontWeight: 500, textDecoration: isPastCfp ? "line-through" : "none" }}>
                          ✏️ CFP: {shortDate(c.cfpDeadline)}
                        </span>
                      )}
                    </div>
                    {c.cfpNote && <p style={{ fontSize: 12, color: "var(--text-4)", marginTop: 4 }}>{c.cfpNote}</p>}
                  </div>

                  <button onClick={() => setConferences(conferences.filter(x => x.id !== c.id))}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-4)", fontSize: 18, padding: "4px 8px",
                      borderRadius: 6, transition: "all 0.2s", flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.target.style.color = "var(--red)"; e.target.style.background = "var(--red-bg)"; }}
                    onMouseLeave={e => { e.target.style.color = "var(--text-4)"; e.target.style.background = "none"; }}>
                    ×
                  </button>
                </div>
              );
            })}
            {filteredConfs.length === 0 && <EmptyState icon="📅">No {confFilter !== "all" ? confFilter : ""} conferences.</EmptyState>}
          </div>
        </div>
      )}

      {/* ════════ CFPs ════════ */}
      {tab === "CFPs" && (
        <div style={{ animation: "fadeUp 0.4s ease both", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["upcoming", "past", "all"].map(f => (
                <button key={f} onClick={() => setCfpFilter(f)} style={chipBtn(cfpFilter === f)}>{f}</button>
              ))}
            </div>
            <button onClick={() => setShowAddCfp(!showAddCfp)} style={btnPrimary}>+ Add CFP</button>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 16px" }}>
            Track special issue calls, workshop CFPs, and other opportunities.
          </p>

          {showAddCfp && (
            <div style={formPanel}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={labelStyle}>Title</label><input value={newCfp.title} onChange={e => setNewCfp({ ...newCfp, title: e.target.value })} placeholder="e.g. Special Issue on Platform Governance" style={inputStyle} /></div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "0 1 160px" }}>
                    <label style={labelStyle}>Type</label>
                    <select value={newCfp.type} onChange={e => setNewCfp({ ...newCfp, type: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option>Special Issue</option><option>Workshop</option><option>Fellowship</option><option>Other</option>
                    </select>
                  </div>
                  <div style={{ flex: "1 1 220px" }}><label style={labelStyle}>Journal / Venue</label><input value={newCfp.venue} onChange={e => setNewCfp({ ...newCfp, venue: e.target.value })} placeholder="e.g. New Media & Society" style={inputStyle} /></div>
                  <div style={{ flex: "0 1 160px" }}><label style={labelStyle}>Deadline</label><input type="date" value={newCfp.deadline} onChange={e => setNewCfp({ ...newCfp, deadline: e.target.value })} style={inputStyle} /></div>
                </div>
                <div><label style={labelStyle}>URL</label><input value={newCfp.url} onChange={e => setNewCfp({ ...newCfp, url: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addCfp} style={btnPrimary}>Add CFP</button>
                  <button onClick={() => setShowAddCfp(false)} style={btnSecondary}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {filteredCfps.length === 0 && <EmptyState icon="📭">No {cfpFilter !== "all" ? cfpFilter : ""} CFPs yet.</EmptyState>}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredCfps
              .sort((a, b) => { if (!a.deadline) return 1; if (!b.deadline) return -1; return new Date(a.deadline) - new Date(b.deadline); })
              .map(c => <CfpCard key={c.id} cfp={c} onDelete={(id) => setCfps(cfps.filter(x => x.id !== id))} />)}
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer style={{ padding: "24px 0 40px", textAlign: "center", marginTop: 32 }}>
        <p style={{ fontSize: 12, color: "var(--text-4)" }}>
          Powered by OpenAlex · Built by Bin Chen · Conference deadlines verified Apr 2026
        </p>
      </footer>
    </div>
  );
}