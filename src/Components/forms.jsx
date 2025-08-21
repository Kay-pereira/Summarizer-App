import React, { useState } from 'react';
import '../App.css';

function UploadForm() {
  const [summary, setSummary] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];

    if (!file) {
      alert("Please select a file.");
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setSummary('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.BACKEND_API_URL}/api/summarize/`, {
        method: 'POST',
        body: formData,
      });

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
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName.replace(/\.[^/.]+$/, "")}_summary.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-card">
        <h2 className="title">📄 Ai File Summarizer</h2>

        <form onSubmit={handleUpload} className="upload-form">
          {/* Stylish upload button */}
          <label className="upload-btn">
            <input type="file" name="file" hidden />
            <span>📂 Choose File</span>
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
              ⬇️ Download Your Summary
            </button>
          </div>
        )}
      </div>

      
    </div>
  );
}

export default UploadForm;
