import { useState } from "react";
import "./AIUpload.css";

const AIUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<"success" | "failure" | "">("");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0); // ✅ progress state
  const [loading, setLoading] = useState(false);

  // 🔥 UPLOAD
  const handleUpload = () => {
    if (!file) {
      setResult("failure");
      setMessage("Please select a file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setResult("failure");
      setMessage("File too large (max 2MB)");
      return;
    }

    setLoading(true);
    setProgress(0);
    setResult("");

    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);

        const fileName = file.name.toLowerCase();

        if (fileName.includes("2006") || fileName.includes("plan")) {
          setResult("success");
          setMessage("Plan Approved");
        } else {
          setResult("failure");
          setMessage("Plan Rejected");
        }

        setLoading(false);
      }
    }, 150);
  };

  // 🔥 DOWNLOAD
  const handleDownload = () => {
    const link = document.createElement("a");

    if (result === "success") {
      link.href = "/AP-VAASTU-20260327062006 - VAASTU.pdf";
      link.download = "approved.pdf";
    } else {
      link.href = "/AP-VAASTU-20260327062016 - VAASTU.pdf";
      link.download = "rejected.pdf";
    }

    link.click();
  };

  return (
    <div className="upload-section">
      <h2>AI-Assisted Automated Scrutiny</h2>

      <div className="upload-box">
        <label className="file-label">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              if (e.target.files) {
                setFile(e.target.files[0]);
                setResult("");
              }
            }}
          />

          <div className="upload-content">
            <p className="upload-icon">📄</p>
            <p className="upload-text">
              {file ? file.name : "Click to upload or drag & drop"}
            </p>
            <span className="upload-subtext">PDF (Max 2MB)</span>
          </div>
        </label>

        <button className="upload-btn" onClick={handleUpload}>
          Upload File
        </button>
      </div>

      {/* 📊 PROGRESS BAR */}
      {loading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p>{progress}% Uploading...</p>
        </div>
      )}

    {/* ✅ RESULT */}
{!loading && result !== "" && (
  <div className={`result-card ${result}`}>
    
    <div className="result-left">
      <div className={`result-icon ${result}`}>
        {result === "success" ? "✔" : "✖"}
      </div>

      <div>
        <h3 className="result-title">
          {result === "success" ? "Plan Approved" : "Plan Rejected"}
        </h3>
        <p className="result-message">{message}</p>
      </div>
    </div>

    <button className="download-btn" onClick={handleDownload}>
      ⬇ Download Certificate
    </button>
  </div>
)}
    </div>
  );
};

export default AIUpload;