import React, { useState, useEffect } from 'react'; 
import '../App.css';

function UploadForm() {
  const [summary, setSummary] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  //  Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(true);

  // check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setIsAuthenticated(true);
      setShowAuth(false);
    }
  }, []);

  // ---- File handlers ----
  const handleFileSelect = (file) => {
    if (!file) return;
    setFile(file);
    setFileName(file.name);
    setSummary('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // ---- Upload ----
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file.");
      return;
    }

    setLoading(true);
    setSummary('');

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem("access");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/summarize/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (response.ok) {
        setSummary(result.summary);
      } else {
        alert("Error: " + (result.detail || "Something went wrong."));
      }
    } catch (error) {
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${fileName.replace(/\.[^/.]+$/, "")}_summary.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <>
      {/* ---- Auth Modal ---- */}
      {showAuth && (
        <AuthModal
          onAuthSuccess={() => {
            setIsAuthenticated(true);
            setShowAuth(false);
          }}
        />
      )}

      {/* ---- Main Summarizer ---- */}
      {isAuthenticated && (
        <div className="upload-wrapper">
          <div className="upload-card">
            <h2 className="title">Ai File Summarizer</h2>

            <form onSubmit={handleUpload} className="upload-form">
              {/* Drop area */}
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {file ? (
                  <p>{file.name} selected</p>
                ) : (
                  <p>Drag & Drop your file here, or choose below</p>
                )}
              </div>

              {/* Stylish upload button */}
              <label className="upload-btn">
                <input
                  type="file"
                  name="file"
                  hidden
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />
                <span>Choose File</span>
              </label>

              <button type="submit" disabled={loading} className="btn gradient">
                {loading ? 'Reading And Thinking...' : '✨ Upload & Summarize'}
              </button>
            </form>

            {loading && (
              <div className="loading" aria-live="polite">
                <div className="spinner"></div>
                <p>Summarizing file...</p>
              </div>
            )}

            {summary && (
              <div className="summary-box">
                <h3>
                  Summary of: <span className="filename">{fileName}</span>
                </h3>
                <pre className="summary-text">{summary}</pre>
                <button onClick={downloadSummary} className="btn secondary">
                  Download Your Summary
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ---- Auth Modal Component ----
function AuthModal({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? `${import.meta.env.VITE_BACKEND_API_URL}/api/auth/token/`
      : `${import.meta.env.VITE_BACKEND_API_URL}/api/auth/register/`;

    const payload = isLogin
      ? { username, password }
      : { username, email, password }; // include email only on signup

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Auth error: " + (data.detail || JSON.stringify(data)));
        return;
      }

      // Save tokens if login
      if (isLogin) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
      }

      onAuthSuccess();
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleAuth}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
        </form>
        <div
          className="auth-switch"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don’t have an account? Sign up"
            : "Already have an account? Login"}
        </div>
      </div>
    </div>
  );
}

export default UploadForm;
