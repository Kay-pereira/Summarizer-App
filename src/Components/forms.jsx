import React, { useState } from 'react';
import '../App.css';

function UploadForm() {
  const [summary, setSummary] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

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

    console.log("Backend URL:", import.meta.env.VITE_BACKEND_API_URL);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/summarize/`, {
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
    const fileBlob = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${fileName.replace(/\.[^/.]+$/, "")}_summary.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
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
              <p> {file.name} selected</p>
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
  );
}

export default UploadForm;
