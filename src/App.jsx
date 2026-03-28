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

// ──────────────────────────────────────────────
// CONFERENCES — Update this list once per year!
// Just change the year, dates, location, and
// cfpDeadline. Ask Claude to look them all up.
// ──────────────────────────────────────────────
const DEFAULT_CONFERENCES = [
  { id: 1, name: "MPSA", fullName: "83rd Midwest Political Science Association Conference", location: "Palmer House Hilton, Chicago, IL", dates: "Apr 23–26, 2026", startDate: "2026-04-23", cfpDeadline: "2025-10-07", cfpNote: "Papers, Roundtables & Complete Panels", url: "https://www.mpsanet.org/" },
  { id: 2, name: "ICWSM", fullName: "20th Intl AAAI Conference on Web and Social Media", location: "Los Angeles, California", dates: "May 27–29, 2026", startDate: "2026-05-27", cfpDeadline: "2026-01-15", cfpNote: "Full papers & dataset papers", url: "https://www.icwsm.org/2026/" },
  { id: 3, name: "ICA", fullName: "76th International Communication Association Conference", location: "Cape Town, South Africa", dates: "Jun 4–8, 2026", startDate: "2026-06-04", cfpDeadline: "2025-11-01", cfpNote: "Paper & panel submissions", url: "https://www.icahdq.org/mpage/ICA26" },
  { id: 4, name: "SM+Society", fullName: "Intl Conference on Social Media & Society (#SMSociety)", location: "University of Glasgow, Glasgow, UK", dates: "Jul 13–15, 2026", startDate: "2026-07-13", cfpDeadline: "2026-01-26", cfpNote: "Extended abstracts (1000–1500 words)", url: "https://socialmediaandsociety.org/smsociety-2026/" },
  { id: 5, name: "IC2S2", fullName: "12th Intl Conference on Computational Social Science", location: "University of Vermont, Burlington, VT", dates: "Jul 28–31, 2026", startDate: "2026-07-28", cfpDeadline: "2026-03-03", cfpNote: "Extended abstracts (max 2 pages)", url: "https://ic2s2-2026.org/" },
  { id: 6, name: "AEJMC", fullName: "2026 AEJMC Annual Conference", location: "New Orleans Marriott, New Orleans, LA", dates: "Aug 5–8, 2026", startDate: "2026-08-05", cfpDeadline: "2026-04-01", cfpNote: "Research papers & extended abstracts", url: "https://www.aejmc.org/aejmc-events/conference" },
  { id: 7, name: "APSA", fullName: "122nd American Political Science Association Annual Meeting", location: "Boston, Massachusetts", dates: "Sep 3–6, 2026", startDate: "2026-09-03", cfpDeadline: "2026-01-14", cfpNote: "Papers, panels & roundtables", url: "https://connect.apsanet.org/apsa2026/" },
  { id: 8, name: "IJPP", fullName: "IJPP Annual Conference (Details TBA)", location: "TBA — typically October", dates: "Oct 2026 (TBA)", startDate: "2026-10-15", cfpDeadline: "", cfpNote: "Check journal website for updates", url: "https://journals.sagepub.com/home/hij/" },
  { id: 9, name: "NCA", fullName: "112th National Communication Association Convention", location: "Sheraton New Orleans, New Orleans, LA", dates: "Nov 19–22, 2026", startDate: "2026-11-19", cfpDeadline: "2026-03-25", cfpNote: "Papers, panels & poster submissions", url: "https://www.natcom.org/nca-112th-annual-convention/" },
];

const TABS = ["Feed", "Journals", "Conferences", "CFPs"];

function formatDate(d) { if (!d) return ""; return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function daysAgo(d) { if (!d) return Infinity; return Math.floor((new Date() - new Date(d)) / 864e5); }
function daysUntil(d) { if (!d) return Infinity; return Math.ceil((new Date(d) - new Date()) / 864e5); }

function Badge({ color, children }) {
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 2, fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", background: color || "#333", color: "#fff", marginRight: 6, fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>;
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 0", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "2.5px solid #e0e0e0", borderTopColor: "#E63946", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "#888", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Fetching articles…</span>
    </div>
  );
}

function ArticleCard({ article, journalColor }) {
  const days = daysAgo(article.publication_date);
  return (
    <a href={article.doi ? `https://doi.org/${article.doi}` : (article.url || "#")} target="_blank" rel="noopener noreferrer"
      style={{ display: "block", textDecoration: "none", color: "inherit", borderBottom: "1px solid #eee", padding: "18px 0", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 4, minHeight: 50, borderRadius: 2, background: journalColor || "#ccc", marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <Badge color={journalColor}>{article.journal_short || article.journal}</Badge>
            {days <= 7 && <Badge color="#E63946">New</Badge>}
            <span style={{ fontSize: 11, color: "#999", fontFamily: "'JetBrains Mono', monospace" }}>{formatDate(article.publication_date)}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.45, margin: "0 0 6px", fontFamily: "'Source Serif 4', Georgia, serif", color: "#1a1a1a" }}>{article.title || "Untitled"}</h3>
          <p style={{ fontSize: 12, color: "#777", margin: 0, lineHeight: 1.4, fontFamily: "'JetBrains Mono', monospace" }}>
            {(article.authors || []).slice(0, 4).join(", ")}{(article.authors || []).length > 4 ? ` + ${article.authors.length - 4} more` : ""}
          </p>
          {article.concepts?.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {article.concepts.slice(0, 5).map((c, i) => (
                <span key={i} style={{ fontSize: 10, color: "#999", border: "1px solid #e8e8e8", borderRadius: 2, padding: "1px 6px", fontFamily: "'JetBrains Mono', monospace" }}>{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}

function ConferenceCard({ conf, onDelete }) {
  const isPastEvent = conf.startDate && new Date(conf.startDate) < new Date();
  const isPastCfp = conf.cfpDeadline && new Date(conf.cfpDeadline) < new Date();
  const cfpDays = conf.cfpDeadline ? daysUntil(conf.cfpDeadline) : null;
  const eventDays = conf.startDate ? daysUntil(conf.startDate) : null;
  return (
    <div style={{ borderBottom: "1px solid #eee", padding: "16px 0", opacity: isPastEvent ? 0.5 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 4, background: isPastEvent ? "#ddd" : "#457B9D", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, letterSpacing: "-0.5px" }}>{conf.name}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
            {isPastEvent ? <Badge color="#999">Past</Badge> :
              eventDays !== null && eventDays <= 30 ? <Badge color="#E63946">In {eventDays}d</Badge> :
              eventDays !== null && eventDays <= 90 ? <Badge color="#F4A261">In {eventDays}d</Badge> :
              <Badge color="#2A9D8F">Upcoming</Badge>}
            {!isPastCfp && conf.cfpDeadline ? (
              cfpDays <= 14 ? <Badge color="#E63946">CFP: {cfpDays}d left</Badge> :
              cfpDays <= 30 ? <Badge color="#F4A261">CFP: {cfpDays}d left</Badge> :
              <Badge color="#457B9D">CFP Open</Badge>
            ) : conf.cfpDeadline ? <Badge color="#999">CFP Closed</Badge> : <Badge color="#6A4C93">CFP TBA</Badge>}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", lineHeight: 1.4, fontFamily: "'Source Serif 4', Georgia, serif", color: "#1a1a1a" }}>{conf.fullName}</h3>
          <p style={{ fontSize: 12, color: "#777", margin: "0 0 2px", fontFamily: "'JetBrains Mono', monospace" }}>📍 {conf.location}</p>
          <p style={{ fontSize: 12, color: "#555", margin: "0 0 2px", fontFamily: "'JetBrains Mono', monospace" }}>📅 {conf.dates}</p>
          {conf.cfpDeadline && <p style={{ fontSize: 11, color: isPastCfp ? "#999" : "#E63946", margin: "0 0 2px", fontFamily: "'JetBrains Mono', monospace", textDecoration: isPastCfp ? "line-through" : "none" }}>✏️ Submission deadline: {formatDate(conf.cfpDeadline)}</p>}
          {conf.cfpNote && <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace", fontStyle: "italic" }}>{conf.cfpNote}</p>}
          {conf.url && <a href={conf.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#457B9D", fontFamily: "'JetBrains Mono', monospace" }}>Visit website →</a>}
        </div>
        {onDelete && <button onClick={() => onDelete(conf.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 16, padding: "4px 8px", alignSelf: "flex-start" }}
          onMouseEnter={e => e.target.style.color = "#E63946"} onMouseLeave={e => e.target.style.color = "#ccc"}>×</button>}
      </div>
    </div>
  );
}

function CfpCard({ cfp, onDelete }) {
  const isPast = cfp.deadline && new Date(cfp.deadline) < new Date();
  const days = cfp.deadline ? daysUntil(cfp.deadline) : null;
  return (
    <div style={{ borderBottom: "1px solid #eee", padding: "16px 0", opacity: isPast ? 0.45 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <Badge color={cfp.type === "Special Issue" ? "#2A9D8F" : cfp.type === "Workshop" ? "#6A4C93" : "#E76F51"}>{cfp.type}</Badge>
            {isPast && <Badge color="#999">Closed</Badge>}
            {!isPast && days !== null && days <= 30 && days > 0 && <Badge color="#E63946">{days}d left</Badge>}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", lineHeight: 1.4, fontFamily: "'Source Serif 4', Georgia, serif", color: "#1a1a1a" }}>{cfp.title}</h3>
          {cfp.venue && <p style={{ fontSize: 12, color: "#777", margin: "0 0 2px", fontFamily: "'JetBrains Mono', monospace" }}>{cfp.venue}</p>}
          {cfp.deadline && <p style={{ fontSize: 11, color: isPast ? "#999" : "#E63946", margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>✏️ Submission deadline: {formatDate(cfp.deadline)}</p>}
          {cfp.url && <a href={cfp.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#457B9D", fontFamily: "'JetBrains Mono', monospace" }}>View details →</a>}
        </div>
        <button onClick={() => onDelete(cfp.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 16, padding: "4px 8px" }}
          onMouseEnter={e => e.target.style.color = "#E63946"} onMouseLeave={e => e.target.style.color = "#ccc"}>×</button>
      </div>
    </div>
  );
}

export default function JournalTracker() {
  const [journals, setJournals] = useState(() => { try { const s = localStorage.getItem("jcm-journals"); return s ? JSON.parse(s) : DEFAULT_JOURNALS; } catch { return DEFAULT_JOURNALS; } });
  const [articles, setArticles] = useState([]);
  const [conferences, setConferences] = useState(() => { try { const s = localStorage.getItem("jcm-conf-v5"); return s ? JSON.parse(s) : DEFAULT_CONFERENCES; } catch { return DEFAULT_CONFERENCES; } });
  const [cfps, setCfps] = useState(() => { try { const s = localStorage.getItem("jcm-cfps-v5"); return s ? JSON.parse(s) : []; } catch { return []; } });
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
  useEffect(() => { try { localStorage.setItem("jcm-conf-v5", JSON.stringify(conferences)); } catch {} }, [conferences]);
  useEffect(() => { try { localStorage.setItem("jcm-cfps-v5", JSON.stringify(cfps)); } catch {} }, [cfps]);

  const fetchArticles = useCallback(async () => {
    setLoading(true); setFetchError("");
    const fromDate = new Date(); fromDate.setDate(fromDate.getDate() - parseInt(timeRange));
    const dateStr = fromDate.toISOString().split("T")[0];
    const allArticles = []; const journalStats = {};
    for (const journal of journals) {
      try {
        const issns = journal.issn.split(",").map(s => s.trim()).join("|");
        const res = await fetch(`https://api.openalex.org/works?filter=primary_location.source.issn:${issns},from_publication_date:${dateStr}&sort=publication_date:desc&per_page=25&mailto=jcm-scholarwire@example.com`);
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
            concepts: (work.concepts || []).filter(c => c.level <= 2 && c.score > 0.3).slice(0, 5).map(c => c.display_name),
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
    if (searchTerm) { const s = searchTerm.toLowerCase(); return (a.title || "").toLowerCase().includes(s) || (a.authors || []).some(au => au.toLowerCase().includes(s)) || (a.concepts || []).some(c => c.toLowerCase().includes(s)); }
    return true;
  });

  const sortedConfs = [...conferences].sort((a, b) => {
    const da = a.startDate ? new Date(a.startDate) : new Date("2099-01-01");
    const db = b.startDate ? new Date(b.startDate) : new Date("2099-01-01");
    const now = new Date();
    const aUpcoming = da >= now;
    const bUpcoming = db >= now;
    // Upcoming first (nearest first), then past (most recent first)
    if (aUpcoming && bUpcoming) return da - db;
    if (!aUpcoming && !bUpcoming) return db - da;
    if (aUpcoming) return -1;
    return 1;
  });

  const filteredConfs = sortedConfs.filter(c => {
    if (confFilter === "upcoming") return !c.startDate || new Date(c.startDate) >= new Date();
    if (confFilter === "past") return c.startDate && new Date(c.startDate) < new Date();
    return true;
  });

  const filteredCfps = cfps.filter(c => { if (cfpFilter === "upcoming") return !c.deadline || new Date(c.deadline) >= new Date(); if (cfpFilter === "past") return c.deadline && new Date(c.deadline) < new Date(); return true; });

  const addJournal = () => { if (!newJournal.name || !newJournal.issn) return; const colors = ["#264653","#E76F51","#606C38","#BC6C25","#023047","#8338EC","#FF006E","#3A86FF"]; setJournals([...journals, { ...newJournal, color: colors[journals.length % colors.length] }]); setNewJournal({ name: "", issn: "" }); setShowAddJournal(false); };
  const addCfp = () => { if (!newCfp.title) return; setCfps([...cfps, { ...newCfp, id: Date.now() }]); setNewCfp({ title: "", type: "Special Issue", venue: "", deadline: "", url: "" }); setShowAddCfp(false); };
  const addConf = () => { if (!newConf.name || !newConf.fullName) return; setConferences([...conferences, { ...newConf, id: Date.now() }]); setNewConf({ name: "", fullName: "", location: "", dates: "", startDate: "", cfpDeadline: "", cfpNote: "", url: "" }); setShowAddConf(false); };

  const inputStyle = { width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", borderRadius: 3, fontFamily: "'JetBrains Mono', monospace", boxSizing: "border-box", outline: "none" };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 4, display: "block", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px" };
  const btnPrimary = { background: "#E63946", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 3, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px" };
  const btnSecondary = { background: "#fff", color: "#333", border: "1px solid #ddd", padding: "8px 20px", borderRadius: 3, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" };
  const filterBtn = (active) => ({ ...btnSecondary, padding: "5px 12px", fontSize: 11, background: active ? "#1a1a1a" : "#fff", color: active ? "#fff" : "#999", borderColor: active ? "#1a1a1a" : "#ddd", textTransform: "capitalize" });

  const totalArticles = filteredArticles.length;
  const newThisWeek = articles.filter(a => daysAgo(a.publication_date) <= 7).length;
  const oaCount = articles.filter(a => a.open_access).length;
  const upcomingConfCount = conferences.filter(c => !c.startDate || new Date(c.startDate) >= new Date()).length;

  return (
    <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", maxWidth: 780, margin: "0 auto", padding: "0 20px", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; } ::selection { background: #E63946; color: #fff; }
      `}</style>

      <header style={{ borderBottom: "3px solid #1a1a1a", paddingTop: 32, paddingBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px", fontFamily: "'Source Serif 4', Georgia, serif", color: "#1a1a1a" }}>JCM ScholarWire</h1>
            <p style={{ fontSize: 11, color: "#999", margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "1px" }}>Journalism, Communication & Media Research Tracker</p>
          </div>
          <button onClick={fetchArticles} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.6 : 1 }} disabled={loading}>↻ Refresh</button>
        </div>
      </header>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #eee", padding: "12px 0" }}>
        {[{ label: "Articles", value: totalArticles }, { label: "New this week", value: newThisWeek }, { label: "Open Access", value: oaCount }, { label: "Journals", value: journals.length }, { label: "Upcoming", value: upcomingConfCount }].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 4 ? "1px solid #eee" : "none" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Source Serif 4', Georgia, serif" }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <nav style={{ display: "flex", gap: 0, borderBottom: "1px solid #eee" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #E63946" : "2px solid transparent", padding: "12px 20px", cursor: "pointer", fontSize: 12, fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1a1a1a" : "#999", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.15s" }}>{t}</button>
        ))}
      </nav>

      {/* ──── FEED ──── */}
      {tab === "Feed" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", gap: 10, padding: "14px 0", borderBottom: "1px solid #eee", flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" placeholder="Search titles, authors, topics…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, flex: "1 1 200px", minWidth: 180 }} />
            <select value={filterJournal} onChange={e => setFilterJournal(e.target.value)} style={{ ...inputStyle, flex: "0 1 220px", cursor: "pointer" }}>
              <option value="All">All Journals</option>
              {journals.map(j => <option key={j.issn} value={j.name}>{j.name}</option>)}
            </select>
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ ...inputStyle, flex: "0 1 140px", cursor: "pointer" }}>
              <option value="7">Past 7 days</option><option value="14">Past 14 days</option><option value="30">Past 30 days</option><option value="60">Past 60 days</option><option value="90">Past 90 days</option>
            </select>
            {timeRange !== "30" && <button onClick={fetchArticles} style={{ ...btnSecondary, padding: "8px 14px" }}>Apply</button>}
          </div>
          {loading && <Spinner />}
          {fetchError && <p style={{ textAlign: "center", color: "#999", padding: "30px 0", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{fetchError}</p>}
          {!loading && filteredArticles.length > 0 && <div>{filteredArticles.map(a => <ArticleCard key={a.id} article={a} journalColor={a.journalColor} />)}</div>}
          {!loading && !fetchError && filteredArticles.length === 0 && articles.length > 0 && <p style={{ textAlign: "center", color: "#999", padding: "30px 0", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>No articles match your filters.</p>}
        </div>
      )}

      {/* ──── JOURNALS ──── */}
      {tab === "Journals" && (
        <div style={{ animation: "fadeIn 0.3s ease", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#999", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>Manage your tracked journals. Articles fetched via OpenAlex.</p>
            <button onClick={() => setShowAddJournal(!showAddJournal)} style={btnPrimary}>+ Add Journal</button>
          </div>
          {showAddJournal && (
            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 4, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 250px" }}><label style={labelStyle}>Journal Name</label><input value={newJournal.name} onChange={e => setNewJournal({ ...newJournal, name: e.target.value })} placeholder="e.g. Journalism & Mass Communication Quarterly" style={inputStyle} /></div>
                <div style={{ flex: "0 1 180px" }}><label style={labelStyle}>ISSN (print,online)</label><input value={newJournal.issn} onChange={e => setNewJournal({ ...newJournal, issn: e.target.value })} placeholder="e.g. 1077-6990,2161-4326" style={inputStyle} /></div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}><button onClick={addJournal} style={btnPrimary}>Add</button><button onClick={() => setShowAddJournal(false)} style={btnSecondary}>Cancel</button></div>
              </div>
              <p style={{ fontSize: 11, color: "#aaa", marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>Find ISSNs at <a href="https://portal.issn.org" target="_blank" rel="noopener noreferrer" style={{ color: "#E63946" }}>portal.issn.org</a>. Use both print & online ISSNs separated by comma for best results.</p>
            </div>
          )}
          {journals.map(j => (
            <div key={j.issn} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: j.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Source Serif 4', Georgia, serif" }}>{j.name}</div>
                  <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'JetBrains Mono', monospace" }}>ISSN: {j.issn}{stats[j.name] !== undefined && ` · ${stats[j.name]} articles found`}</div>
                </div>
              </div>
              <button onClick={() => setJournals(journals.filter(x => x.issn !== j.issn))} style={{ background: "none", border: "1px solid #eee", borderRadius: 3, padding: "4px 12px", cursor: "pointer", color: "#999", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                onMouseEnter={e => { e.target.style.borderColor = "#E63946"; e.target.style.color = "#E63946"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#eee"; e.target.style.color = "#999"; }}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {/* ──── CONFERENCES ──── */}
      {tab === "Conferences" && (
        <div style={{ animation: "fadeIn 0.3s ease", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["upcoming", "past", "all"].map(f => (
                <button key={f} onClick={() => setConfFilter(f)} style={filterBtn(confFilter === f)}>{f}</button>
              ))}
            </div>
            <button onClick={() => setShowAddConf(!showAddConf)} style={btnPrimary}>+ Add Conference</button>
          </div>

          {showAddConf && (
            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 4, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: "0 1 100px" }}><label style={labelStyle}>Short Name</label><input value={newConf.name} onChange={e => setNewConf({ ...newConf, name: e.target.value })} placeholder="e.g. WAPOR" style={inputStyle} /></div>
                  <div style={{ flex: "1 1 300px" }}><label style={labelStyle}>Full Name</label><input value={newConf.fullName} onChange={e => setNewConf({ ...newConf, fullName: e.target.value })} placeholder="e.g. World Association for Public Opinion Research" style={inputStyle} /></div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 200px" }}><label style={labelStyle}>Location</label><input value={newConf.location} onChange={e => setNewConf({ ...newConf, location: e.target.value })} placeholder="e.g. Berlin, Germany" style={inputStyle} /></div>
                  <div style={{ flex: "0 1 160px" }}><label style={labelStyle}>Event Dates (text)</label><input value={newConf.dates} onChange={e => setNewConf({ ...newConf, dates: e.target.value })} placeholder="e.g. Jun 10–13, 2026" style={inputStyle} /></div>
                  <div style={{ flex: "0 1 150px" }}><label style={labelStyle}>Start Date</label><input type="date" value={newConf.startDate} onChange={e => setNewConf({ ...newConf, startDate: e.target.value })} style={inputStyle} /></div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: "0 1 160px" }}><label style={labelStyle}>CFP Deadline</label><input type="date" value={newConf.cfpDeadline} onChange={e => setNewConf({ ...newConf, cfpDeadline: e.target.value })} style={inputStyle} /></div>
                  <div style={{ flex: "1 1 250px" }}><label style={labelStyle}>CFP Note</label><input value={newConf.cfpNote} onChange={e => setNewConf({ ...newConf, cfpNote: e.target.value })} placeholder="e.g. Full papers, max 8000 words" style={inputStyle} /></div>
                </div>
                <div><label style={labelStyle}>URL (optional)</label><input value={newConf.url} onChange={e => setNewConf({ ...newConf, url: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
                <div style={{ display: "flex", gap: 6 }}><button onClick={addConf} style={btnPrimary}>Add Conference</button><button onClick={() => setShowAddConf(false)} style={btnSecondary}>Cancel</button></div>
              </div>
            </div>
          )}

          {filteredConfs.map(c => <ConferenceCard key={c.id} conf={c} onDelete={(id) => setConferences(conferences.filter(x => x.id !== id))} />)}
        </div>
      )}

      {/* ──── CFPs ──── */}
      {tab === "CFPs" && (
        <div style={{ animation: "fadeIn 0.3s ease", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["upcoming", "past", "all"].map(f => (
                <button key={f} onClick={() => setCfpFilter(f)} style={filterBtn(cfpFilter === f)}>{f}</button>
              ))}
            </div>
            <button onClick={() => setShowAddCfp(!showAddCfp)} style={btnPrimary}>+ Add CFP</button>
          </div>
          <p style={{ fontSize: 12, color: "#999", margin: "0 0 12px", fontFamily: "'JetBrains Mono', monospace" }}>Track special issue calls, workshop CFPs, and other submission opportunities.</p>

          {showAddCfp && (
            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 4, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div><label style={labelStyle}>Title</label><input value={newCfp.title} onChange={e => setNewCfp({ ...newCfp, title: e.target.value })} placeholder="e.g. Special Issue on Platform Governance" style={inputStyle} /></div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: "0 1 140px" }}><label style={labelStyle}>Type</label>
                    <select value={newCfp.type} onChange={e => setNewCfp({ ...newCfp, type: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option>Special Issue</option><option>Workshop</option><option>Fellowship</option><option>Other</option>
                    </select>
                  </div>
                  <div style={{ flex: "1 1 200px" }}><label style={labelStyle}>Journal / Venue</label><input value={newCfp.venue} onChange={e => setNewCfp({ ...newCfp, venue: e.target.value })} placeholder="e.g. New Media & Society" style={inputStyle} /></div>
                  <div style={{ flex: "0 1 150px" }}><label style={labelStyle}>Submission Deadline</label><input type="date" value={newCfp.deadline} onChange={e => setNewCfp({ ...newCfp, deadline: e.target.value })} style={inputStyle} /></div>
                </div>
                <div><label style={labelStyle}>URL (optional)</label><input value={newCfp.url} onChange={e => setNewCfp({ ...newCfp, url: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
                <div style={{ display: "flex", gap: 6 }}><button onClick={addCfp} style={btnPrimary}>Add CFP</button><button onClick={() => setShowAddCfp(false)} style={btnSecondary}>Cancel</button></div>
              </div>
            </div>
          )}

          {filteredCfps.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#bbb", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              No {cfpFilter !== "all" ? cfpFilter : ""} CFPs yet. Add special issue calls, workshop CFPs, and other opportunities above.
            </div>
          )}

          {filteredCfps.sort((a, b) => { if (!a.deadline) return 1; if (!b.deadline) return -1; return new Date(a.deadline) - new Date(b.deadline); })
            .map(c => <CfpCard key={c.id} cfp={c} onDelete={(id) => setCfps(cfps.filter(x => x.id !== id))} />)}
        </div>
      )}

      <footer style={{ borderTop: "1px solid #eee", padding: "16px 0 32px", marginTop: 32, textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#ccc", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Powered by OpenAlex · Built by Bin Chen · Conference deadlines verified Mar 2026 · Your data is saved in your browser
        </p>
      </footer>
    </div>
  );
}
