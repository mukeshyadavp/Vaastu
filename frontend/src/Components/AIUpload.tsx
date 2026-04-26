import { useRef, useState } from "react";
import {
  runAutoDcr,
  getReportDownloadUrl,
  type AutoDcrViolation,
} from "../Services/api";
import "./AIUpload.css";

type UploadResult = "success" | "failure" | "";

const AIUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult>("");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const [pdfUrl, setPdfUrl] = useState("");
  const [applicationNo, setApplicationNo] = useState("");
  const [violations, setViolations] = useState<AutoDcrViolation[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetFileInput = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetResult = () => {
    setResult("");
    setMessage("");
    setProgress(0);
    setPdfUrl("");
    setApplicationNo("");
    setViolations([]);
  };

  const handleUpload = async () => {
    console.log("Selected file:", file);
    if (!file) {
      setResult("failure");
      setMessage("Please select a file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setResult("failure");
      setMessage("File too large. Maximum allowed size is 20MB");
      return;
    }

    setLoading(true);
    resetResult();
    setProgress(1);

    try {
      const data = await runAutoDcr(
        file,
        {
          buildingType: "Residential",
          floors: 2,
          height: 7.0,
          classification: "Non-High-Rise",
        },
        (uploadProgress) => {
          setProgress(uploadProgress);
        }
      );

      const isCompliant = data.result.isCompliant;

      setResult(isCompliant ? "success" : "failure");

      setMessage(
        isCompliant
          ? "Plan Approved. Compliance certificate generated successfully."
          : "Plan Rejected. Non-compliance report generated successfully."
      );

      setPdfUrl(data.pdf.downloadUrl);
      setApplicationNo(data.pdf.applicationNo);
      setViolations(data.result.violations || []);

      setTimeout(() => {
        resetFileInput();
      }, 1500);
    } catch (error) {
      setProgress(0);
      setResult("failure");
      setMessage(
        error instanceof Error
          ? error.message
          : "Upload failed. Please check Flask server and try again."
      );
      setPdfUrl("");
      setApplicationNo("");
      setViolations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      setMessage("PDF is not available yet");
      return;
    }

    const link = document.createElement("a");

    link.href = getReportDownloadUrl(pdfUrl);
    link.download =
      result === "success"
        ? `${applicationNo}-Approved-Compliance.pdf`
        : `${applicationNo}-Rejected-Compliance.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="upload-section">
      <h2>AI-Assisted Automated Scrutiny</h2>

      <div className="upload-box">
        <label className="file-label">
          <input
            type="file"
            accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
            ref={fileInputRef}
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];

              if (selectedFile) {
                setFile(selectedFile);
                resetResult();
              }
            }}
          />

          <div className="upload-content">
            <p className="upload-icon">📄</p>

            <p className="upload-text">
              {file ? file.name : "Click to upload or drag & drop"}
            </p>

            <span className="upload-subtext">
              CAD / PDF / Drawing File (Max 20MB)
            </span>
          </div>
        </label>

        <button
          type="button"
          className="upload-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Run AI Scrutiny"}
        </button>
      </div>

      {loading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p>
            {progress < 80
              ? `${progress}% Uploading file...`
              : `${progress}% Generating compliance PDF...`}
          </p>
        </div>
      )}

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

              {applicationNo && (
                <p className="application-no">
                  Application No: <strong>{applicationNo}</strong>
                </p>
              )}
            </div>
          </div>

          {pdfUrl && (
            <button
              type="button"
              className="download-btn"
              onClick={handleDownload}
            >
              ⬇ Download Compliance PDF
            </button>
          )}
        </div>
      )}

      {!loading && violations.length > 0 && (
        <div className="violation-list">
          <h3>Compliance Violations</h3>

          {violations.map((item, index) => (
            <div className="violation-item" key={`${item.rule}-${index}`}>
              <strong>{item.rule}</strong>
              <p>{item.message}</p>
              <span>
                Required: {item.required} | Found: {item.found}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIUpload;