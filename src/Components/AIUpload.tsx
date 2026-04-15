import { useState } from "react";

const AIUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<"success" | "failure" | "">("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // 🔥 spinner state

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

    setLoading(true); // 🔥 start spinner

    setTimeout(() => {
      const fileName = file.name.toLowerCase();

      if (fileName.includes("2006") || fileName.includes("plan")) {
        setResult("success");
        setMessage("Plan Approved");
      } else {
        setResult("failure");
        setMessage("Plan Rejected");
      }

      setLoading(false); // 🔥 stop spinner
    }, 1000);
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

      <div className="upload-row">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }}
        />

        <button className="upload-btn" onClick={handleUpload}>
          Upload
        </button>
      </div>

      {/* 🔄 SPINNER */}
      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Uploading...</p>
        </div>
      )}

      {/* ✅ RESULT */}
      {!loading && result !== "" && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            background: "#f8fafc",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <span style={{ color: result === "success" ? "green" : "red" }}>
            {result === "success" ? "✅" : "❌"} {message}
          </span>

          <button className="download-btn" onClick={handleDownload}>
            ⬇ Download Certificate
          </button>
        </div>
      )}
    </div>
  );
};

export default AIUpload;