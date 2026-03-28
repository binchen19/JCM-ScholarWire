import { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_JOURNALS = [
  { name: "Journal of Communication", issn: "0021-9916", color: "#E63946" },
  { name: "Political Communication", issn: "1058-4609", color: "#457B9D" },
  { name: "Intl Journal of Press/Politics", issn: "1940-1612", color: "#2A9D8F" },
  { name: "Digital Journalism", issn: "2167-0811", color: "#E9C46A" },
  { name: "New Media & Society", issn: "1461-4448", color: "#F4A261" },
  { name: "Information, Communication & Society", issn: "1369-118X", color: "#6A4C93" },
  { name: "Journal of Computer-Mediated Communication", issn: "1083-6101", color: "#1D3557" },
];

const DEFAULT_OPPORTUNITIES = [
  {
    id: 1, type: "Conference", title: "83rd MPSA Annual Conference",
    venue: "Palmer House Hilton, Chicago, IL",
    deadline: "2026-04-08", dates: "Apr 23–26, 2026",
    url: "https://www.mpsanet.org/",
  },
  {
    id: 2, type: "Conference", title: "ICWSM 2026 — 20th Intl AAAI Conference on Web and Social Media",
    venue: "Los Angeles, California",
    deadline: "2026-05-15", dates: "May 27–29, 2026",
    url: "https://www.icwsm.org/2026/",
  },
  {
    id: 3, type: "Conference", title: "76th ICA Annual Conference",
    venue: "Cape Town, South Africa",
    deadline: "2026-05-04", dates: "Jun 4–8, 2026",
    url: "https://www.icahdq.org/mpage/ICA26",
  },
  {
    id: 4, type: "Conference", title: "#SMSociety 2026 — Intl Conference on Social Media & Society",
    venue: "University of Glasgow, Glasgow, UK",
    deadline: "2026-06-15", dates: "Jul 13–15, 2026",
    url: "https://socialmediaandsociety.org/smsociety-2026/",
  },
  {
    id: 5, type: "Conference", title: "IC2S2 2026 — 12th Intl Conference on Computational Social Science",
    venue: "University of Vermont, Burlington, VT",
    deadline: "2026-06-01", dates: "Jul 28–31, 2026",
    url: "https://ic2s2-2026.org/",
  },
  {
    id: 6, type: "Conference", title: "2026 AEJMC Annual Conference",
    venue: "New Orleans Marriott, New Orleans, LA",
    deadline: "2026-06-01", dates: "Aug 5–8, 2026",
    url: "https://www.aejmc.org/aejmc-events/conference",
  },
  {
    id: 7, type: "Conference", title: "122nd APSA Annual Meeting & Exhibition",
    venue: "Boston, Massachusetts",
    deadline: "2026-07-01", dates: "Sep 3–6, 2026",
    url: "https://connect.apsanet.org/apsa2026/",
  },
  {
    id: 8, type: "Conference", title: "IJPP Annual Conference (Details TBA)",
    venue: "Typically October — check journal website",
    deadline: "", dates: "Oct 2026 (TBA)",
    url: "https://journals.sagepub.com/home/hij/",
  },
  {
    id: 9, type: "Conference", title: "112th NCA Annual Convention — Move/ment(s)",
    venue: "Sheraton New Orleans, New Orleans, LA",
    deadline: "2026-09-01", dates: "Nov 19–22, 2026",
    url: "https://www.natcom.org/nca-112th-annual-convention/",
  },
];

const TABS = ["Feed", "Journals", "Opportunities"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysAgo(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function Badge({ color, children }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: "2px",
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px",
      textTransform: "uppercase", background: color || "#333", color: "#fff",
      marginRight: "6px", fontFamily: "'JetBrains Mono', monospace",
    }}>{children}</span>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 0", justifyContent: "center" }}>
      <div style={{
        width: 20, height: 20, border: "2.5px solid #e0e0e0",
        borderTopColor: "#E63946", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ color: "#888", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Fetching articles…</span>
    </div>
  );
}

function ArticleCard({ article, journalColor }) {
  const days = daysAgo(article.publication_date);
  const isNew = days <= 7;
  return (
    <a href={article.doi ? `https://doi.org/${article.doi}` : (article.url || "#")}
      target="_blank" rel="noopener noreferrer"
      style={{ display: "block", textDecoration: "none", color: "inherit",
        borderBottom: "1px solid #eee", padding: "18px 0", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 4, minHeight: 50, borderRadius: 2,
          background: journalColor || "#ccc", marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <Badge color={journalColor}>{article.journal_short || article.journal}</Badge>
            {isNew && <Badge color="#E63946">New</Badge>}
            <span style={{ fontSize: 11, color: "#999", fontFamily: "'JetBrains Mono', monospace" }}>
              {formatDate(article.publication_date)}
            </span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.45, margin: "0 0 6px 0",
            fontFamily: "'Source Serif 4', Georgia, serif", color: "#1a1a1a" }}>
            {article.title || "Untitled"}
          </h3>
          <p style={{ fontSize: 12, color: "#777", margin: 0, lineHeight: 1.4,
            fontFamily: "'JetBrains Mono', monospace" }}>
            {(article.authors || []).slice(0, 4).join(", ")}
            {(article.authors || []).length > 4 ? ` + ${article.authors.length - 4} more` : ""}
          </p>
          {article.concepts && article.concepts.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {article.concepts.slice(0, 5).map((c, i) => (
                <span key={i} style={{ fontSize: 10, color: "#999", border: "1px solid #e8e8e8",
                  borderRadius: 2, padding: "1px 6px", fontFamily: "'JetBrains Mono', monospace" }}>{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}

function OpportunityCard({ opp, onDelete }) {
  const isExpired = opp.deadline && new Date(opp.deadline) < new Date();
  const daysLeft = opp.deadline ? Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  return (
    <div style={{ borderBottom: "1px solid #eee", padding: "16px 0", opacity: isExpired ? 0.45 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <Badge color={opp.type === "Special Issue" ? "#2A9D8F" : opp.type === "Conference" ? "#457B9D" : opp.type === "Workshop" ? "#6A4C93" : "#E76F51"}>
              {opp.type}
            </Badge>
            {isExpired && <Badge color="#999">Past</Badge>}
            {!isExpired && daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
              <Badge color="#E63946">{daysLeft}d left</Badge>
            )}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", lineHeight: 1.4,
            fontFamily: "'Source Serif 4', Georgia, serif", color: "#1a1a1a" }}>{opp.title}</h3>
          {opp.venue && (
            <p style={{ fontSize: 12, color: "#777", margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>
              📍 {opp.venue}
            </p>
          )}
          {opp.dates && (
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>
              📅 {opp.dates}
            </p>
          )}
          {opp.deadline && (
            <p style={{ fontSize: 11, color: isExpired ? "#999" : "#E63946", margin: "0 0 4px",
              fontFamily: "'JetBrains Mono', monospace" }}>
              ⏰ Registration deadline: {formatDate(opp.deadline)}
            </p>
          )}
          {opp.url && (
            <a href={opp.url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: "#457B9D", fontFamily: "'JetBrains Mono', monospace" }}>
              View details →
            </a>
          )}
        </div>
        <button onClick={() => onDelete(opp.id)}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: "#ccc", fontSize: 16, padding: "4px 8px" }}
          onMouseEnter={e => e.target.style.color = "#E63946"}
          onMouseLeave={e => e.target.style.color = "#ccc"}>×</button>
      </div>
    </div>
  );
}

export default function JournalTracker() {
  const [journals, setJournals] = useState(() => {
    try {
      const saved = localStorage.getItem("jcm-journals");
      return saved ? JSON.parse(saved) : DEFAULT_JOURNALS;
    } catch { return DEFAULT_JOURNALS; }
  });
  const [articles, setArticles] = useState([]);
  const [opportunities, setOpportunities] = useState(() => {
    try {
      const saved = localStorage.getItem("jcm-opportunities-v2");
      return saved ? JSON.parse(saved) : DEFAULT_OPPORTUNITIES;
    } catch { return DEFAULT_OPPORTUNITIES; }
  });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("Feed");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJournal, setFilterJournal] = useState("All");
  const [timeRange, setTimeRange] = useState("30");
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [showAddOpp, setShowAddOpp] = useState(false);
  const [newJournal, setNewJournal] = useState({ name: "", issn: "" });
  const [newOpp, setNewOpp] = useState({ title: "", type: "Special Issue", venue: "", deadline: "", dates: "", url: "" });
  const [fetchError, setFetchError] = useState("");
  const [stats, setStats] = useState({});
  const [oppFilter, setOppFilter] = useState("upcoming");
  const hasFetched = useRef(false);

  useEffect(() => {
    try { localStorage.setItem("jcm-journals", JSON.stringify(journals)); } catch {}
  }, [journals]);

  useEffect(() => {
    try { localStorage.setItem("jcm-opportunities-v2", JSON.stringify(opportunities)); } catch {}
  }, [opportunities]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(timeRange));
    const dateStr = fromDate.toISOString().split("T")[0];
    const allArticles = [];
    const journalStats = {};

    for (const journal of journals) {
      try {
        const issns = journal.issn.split(",").map(s => s.trim()).join("|");
        const url = `https://api.openalex.org/works?filter=primary_location.source.issn:${issns},from_publication_date:${dateStr}&sort=publication_date:desc&per_page=25&mailto=jcm-scholarwire@example.com`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        journalStats[journal.name] = data.meta?.count || 0;
        (data.results || []).forEach(work => {
          allArticles.push({
            id: work.id,
            title: work.title,
            doi: work.doi?.replace("https://doi.org/", ""),
            url: work.primary_location?.landing_page_url || work.doi,
            publication_date: work.publication_date,
            journal: journal.name,
            journal_short: journal.name.length > 25 ? journal.name.substring(0, 22) + "…" : journal.name,
            journalColor: journal.color,
            authors: (work.authorships || []).map(a => a.author?.display_name).filter(Boolean),
            concepts: (work.concepts || [])
              .filter(c => c.level <= 2 && c.score > 0.3)
              .slice(0, 5)
              .map(c => c.display_name),
            cited_by: work.cited_by_count || 0,
            open_access: work.open_access?.is_oa || false,
          });
        });
      } catch (err) {
        console.error(`Error fetching ${journal.name}:`, err);
      }
    }

    allArticles.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
    setArticles(allArticles);
    setStats(journalStats);
    setLoading(false);
    if (allArticles.length === 0) setFetchError("No articles found. Try expanding the time range.");
  }, [journals, timeRange]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchArticles();
    }
  }, [fetchArticles]);

  const filteredArticles = articles.filter(a => {
    if (filterJournal !== "All" && a.journal !== filterJournal) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (a.title || "").toLowerCase().includes(s) ||
        (a.authors || []).some(au => au.toLowerCase().includes(s)) ||
        (a.concepts || []).some(c => c.toLowerCase().includes(s));
    }
    return true;
  });

  const filteredOpps = opportunities.filter(opp => {
    if (oppFilter === "upcoming") {
      return !opp.deadline || new Date(opp.deadline) >= new Date();
    }
    if (oppFilter === "past") {
      return opp.deadline && new Date(opp.deadline) < new Date();
    }
    return true;
  });

  const addJournal = () => {
    if (!newJournal.name || !newJournal.issn) return;
    const colors = ["#264653","#E76F51","#606C38","#BC6C25","#023047","#8338EC","#FF006E","#3A86FF"];
    const color = colors[journals.length % colors.length];
    setJournals([...journals, { ...newJournal, color }]);
    setNewJournal({ name: "", issn: "" });
    setShowAddJournal(false);
  };

  const removeJournal = (issn) => setJournals(journals.filter(j => j.issn !== issn));

  const addOpp = () => {
    if (!newOpp.title) return;
    setOpportunities([...opportunities, { ...newOpp, id: Date.now() }]);
    setNewOpp({ title: "", type: "Special Issue", venue: "", deadline: "", dates: "", url: "" });
    setShowAddOpp(false);
  };

  const deleteOpp = (id) => setOpportunities(opportunities.filter(o => o.id !== id));

  const inputStyle = {
    width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #ddd",
    borderRadius: 3, fontFamily: "'JetBrains Mono', monospace", boxSizing: "border-box", outline: "none",
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 4, display: "block",
    fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px",
  };
  const btnPrimary = {
    background: "#E63946", color: "#fff", border: "none", padding: "8px 20px",
    borderRadius: 3, cursor: "pointer", fontSize: 12, fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px",
  };
  const btnSecondary = {
    background: "#fff", color: "#333", border: "1px solid #ddd", padding: "8px 20px",
    borderRadius: 3, cursor: "pointer", fontSize: 12, fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  };

  const totalArticles = filteredArticles.length;
  const newThisWeek = articles.filter(a => daysAgo(a.publication_date) <= 7).length;
  const oaCount = articles.filter(a => a.open_access).length;
  const upcomingCount = opportunities.filter(o => !o.deadline || new Date(o.deadline) >= new Date()).length;

  return (
    <div style={{ fontFamily: "'Source Serif 4', Georgia, serif",
      maxWidth: 780, margin: "0 auto", padding: "0 20px", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::selection { background: #E63946; color: #fff; }
      `}</style>

      <header style={{ borderBottom: "3px solid #1a1a1a", paddingTop: 32, paddingBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.5px",
              fontFamily: "'Source Serif 4', Georgia, serif", color: "#1a1a1a" }}>
              JCM ScholarWire
            </h1>
            <p style={{ fontSize: 11, color: "#999", margin: "4px 0 0",
              fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "1px" }}>
              Journalism, Communication & Media Research Tracker
            </p>
          </div>
          <button onClick={fetchArticles} style={{
            ...btnPrimary, display: "flex", alignItems: "center", gap: 6,
            opacity: loading ? 0.6 : 1 }} disabled={loading}>
            ↻ Refresh
          </button>
        </div>
      </header>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #eee", padding: "12px 0" }}>
        {[
          { label: "Articles", value: totalArticles },
          { label: "New this week", value: newThisWeek },
          { label: "Open Access", value: oaCount },
          { label: "Journals", value: journals.length },
          { label: "Upcoming", value: upcomingCount },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center",
            borderRight: i < 4 ? "1px solid #eee" : "none" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a",
              fontFamily: "'Source Serif 4', Georgia, serif" }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <nav style={{ display: "flex", gap: 0, borderBottom: "1px solid #eee" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none",
            borderBottom: tab === t ? "2px solid #E63946" : "2px solid transparent",
            padding: "12px 20px", cursor: "pointer",
            fontSize: 12, fontWeight: tab === t ? 700 : 500,
            color: tab === t ? "#1a1a1a" : "#999",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.15s",
          }}>{t}{t === "Opportunities" && upcomingCount > 0 ? ` (${upcomingCount})` : ""}</button>
        ))}
      </nav>

      {tab === "Feed" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", gap: 10, padding: "14px 0", borderBottom: "1px solid #eee",
            flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" placeholder="Search titles, authors, topics…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, flex: "1 1 200px", minWidth: 180 }} />
            <select value={filterJournal} onChange={e => setFilterJournal(e.target.value)}
              style={{ ...inputStyle, flex: "0 1 220px", cursor: "pointer" }}>
              <option value="All">All Journals</option>
              {journals.map(j => <option key={j.issn} value={j.name}>{j.name}</option>)}
            </select>
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
              style={{ ...inputStyle, flex: "0 1 140px", cursor: "pointer" }}>
              <option value="7">Past 7 days</option>
              <option value="14">Past 14 days</option>
              <option value="30">Past 30 days</option>
              <option value="60">Past 60 days</option>
              <option value="90">Past 90 days</option>
            </select>
            {timeRange !== "30" && (
              <button onClick={fetchArticles} style={{ ...btnSecondary, padding: "8px 14px" }}>Apply</button>
            )}
          </div>
          {loading && <Spinner />}
          {fetchError && (
            <p style={{ textAlign: "center", color: "#999", padding: "30px 0", fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace" }}>{fetchError}</p>
          )}
          {!loading && filteredArticles.length > 0 && (
            <div>{filteredArticles.map(a => <ArticleCard key={a.id} article={a} journalColor={a.journalColor} />)}</div>
          )}
          {!loading && !fetchError && filteredArticles.length === 0 && articles.length > 0 && (
            <p style={{ textAlign: "center", color: "#999", padding: "30px 0", fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace" }}>No articles match your filters.</p>
          )}
        </div>
      )}

      {tab === "Journals" && (
        <div style={{ animation: "fadeIn 0.3s ease", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#999", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
              Manage your tracked journals. Articles are fetched via OpenAlex (free, open API).
            </p>
            <button onClick={() => setShowAddJournal(!showAddJournal)} style={btnPrimary}>+ Add Journal</button>
          </div>
          {showAddJournal && (
            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 4, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 250px" }}>
                  <label style={labelStyle}>Journal Name</label>
                  <input value={newJournal.name} onChange={e => setNewJournal({ ...newJournal, name: e.target.value })}
                    placeholder="e.g. Journalism & Mass Communication Quarterly" style={inputStyle} />
                </div>
                <div style={{ flex: "0 1 180px" }}>
                  <label style={labelStyle}>ISSN</label>
                  <input value={newJournal.issn} onChange={e => setNewJournal({ ...newJournal, issn: e.target.value })}
                    placeholder="e.g. 1077-6990" style={inputStyle} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                  <button onClick={addJournal} style={btnPrimary}>Add</button>
                  <button onClick={() => setShowAddJournal(false)} style={btnSecondary}>Cancel</button>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "#aaa", marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                Tip: Find ISSNs at <a href="https://portal.issn.org" target="_blank" rel="noopener noreferrer" style={{ color: "#E63946" }}>portal.issn.org</a> or on the journal's homepage. After adding, hit Refresh.
              </p>
            </div>
          )}
          {journals.map(j => (
            <div key={j.issn} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: j.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Source Serif 4', Georgia, serif" }}>{j.name}</div>
                  <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'JetBrains Mono', monospace" }}>
                    ISSN: {j.issn}{stats[j.name] !== undefined && ` · ${stats[j.name]} articles found`}
                  </div>
                </div>
              </div>
              <button onClick={() => removeJournal(j.issn)} style={{
                background: "none", border: "1px solid #eee", borderRadius: 3,
                padding: "4px 12px", cursor: "pointer", color: "#999", fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace" }}
                onMouseEnter={e => { e.target.style.borderColor = "#E63946"; e.target.style.color = "#E63946"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#eee"; e.target.style.color = "#999"; }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "Opportunities" && (
        <div style={{ animation: "fadeIn 0.3s ease", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["upcoming", "past", "all"].map(f => (
                <button key={f} onClick={() => setOppFilter(f)} style={{
                  ...btnSecondary, padding: "5px 12px", fontSize: 11,
                  background: oppFilter === f ? "#1a1a1a" : "#fff",
                  color: oppFilter === f ? "#fff" : "#999",
                  borderColor: oppFilter === f ? "#1a1a1a" : "#ddd",
                  textTransform: "capitalize",
                }}>{f}</button>
              ))}
            </div>
            <button onClick={() => setShowAddOpp(!showAddOpp)} style={btnPrimary}>+ Add</button>
          </div>

          {showAddOpp && (
            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 4, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input value={newOpp.title} onChange={e => setNewOpp({ ...newOpp, title: e.target.value })}
                    placeholder="e.g. Special Issue on Platform Governance" style={inputStyle} />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: "0 1 140px" }}>
                    <label style={labelStyle}>Type</label>
                    <select value={newOpp.type} onChange={e => setNewOpp({ ...newOpp, type: e.target.value })}
                      style={{ ...inputStyle, cursor: "pointer" }}>
                      <option>Special Issue</option>
                      <option>Conference</option>
                      <option>Workshop</option>
                      <option>Fellowship</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div style={{ flex: "1 1 180px" }}>
                    <label style={labelStyle}>Venue / Location</label>
                    <input value={newOpp.venue} onChange={e => setNewOpp({ ...newOpp, venue: e.target.value })}
                      placeholder="e.g. Chicago, IL" style={inputStyle} />
                  </div>
                  <div style={{ flex: "0 1 160px" }}>
                    <label style={labelStyle}>Event Dates</label>
                    <input value={newOpp.dates} onChange={e => setNewOpp({ ...newOpp, dates: e.target.value })}
                      placeholder="e.g. Jun 4–8, 2026" style={inputStyle} />
                  </div>
                  <div style={{ flex: "0 1 150px" }}>
                    <label style={labelStyle}>Deadline</label>
                    <input type="date" value={newOpp.deadline}
                      onChange={e => setNewOpp({ ...newOpp, deadline: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>URL (optional)</label>
                  <input value={newOpp.url} onChange={e => setNewOpp({ ...newOpp, url: e.target.value })}
                    placeholder="https://..." style={inputStyle} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={addOpp} style={btnPrimary}>Add</button>
                  <button onClick={() => setShowAddOpp(false)} style={btnSecondary}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {filteredOpps.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#bbb",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              No {oppFilter} opportunities found.
            </div>
          )}

          {filteredOpps
            .sort((a, b) => {
              if (!a.deadline) return 1;
              if (!b.deadline) return -1;
              return new Date(a.deadline) - new Date(b.deadline);
            })
            .map(opp => <OpportunityCard key={opp.id} opp={opp} onDelete={deleteOpp} />)}
        </div>
      )}

      <footer style={{ borderTop: "1px solid #eee", padding: "16px 0 32px", marginTop: 32, textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#ccc", fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Powered by OpenAlex · Conference data verified Mar 2026 · Your data is saved in your browser
        </p>
      </footer>
    </div>
  );
}
