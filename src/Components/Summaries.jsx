import { useState, useEffect } from "react";

async function fetchSummaries() {
  const token = localStorage.getItem("access"); // 👈 grab JWT from localStorage

  const response = await fetch(
    "https://summarizer-app-production.up.railway.app/api/summaries/",
    {
      headers: {
        Authorization: `Bearer ${token}`, // 👈 attach token
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Your Info");
  }

  return response.json();
}

export default function Summaries() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSummaries();
        setSummaries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredSummaries = summaries.filter(
    (s) =>
      s.file_name.toLowerCase().includes(query.toLowerCase()) ||
      s.summary_text.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <p className="loading">Loading summaries...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="summaries-container">
      <h2 className="title">Summary History</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search summaries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Summaries List */}
      {filteredSummaries.length === 0 ? (
        <p className="empty">No summaries found.</p>
      ) : (
        <ul className="summary-list">
          {filteredSummaries.map((s, index) => (
            <li key={index} className="summary-card">
              <div className="summary-header">
                <p className="file-name">{s.file_name}</p>
                <p className="timestamp">
                  {new Date(s.created_at).toLocaleString()}
                </p>
              </div>
              {/* Show only first 150 characters */}
              <p className="summary-text">
                {s.summary_text.length > 150
                  ? s.summary_text.slice(0, 150) + "..."
                  : s.summary_text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
