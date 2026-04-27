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
  const [loading, setLoading] = useState(false);

  const [pdfUrl, setPdfUrl] = useState("");
  const [applicationNo, setApplicationNo] = useState("");
  const [violations, setViolations] = useState<AutoDcrViolation[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const wait = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

  const resetFileInput = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetResult = () => {
    setResult("");
    setMessage("");
    setPdfUrl("");
    setApplicationNo("");
    setViolations([]);
  };

  const handleUpload = async () => {
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

    const loaderStartTime = Date.now();

    try {
      const data = await runAutoDcr(file, {
        buildingType: "Residential",
        floors: 2,
        height: 7.0,
        classification: "Non-High-Rise",
      });

      const elapsedTime = Date.now() - loaderStartTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);

      await wait(remainingTime);

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
      const elapsedTime = Date.now() - loaderStartTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);

      await wait(remainingTime);

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

      <div className="upload-area-wrapper">
        <div className="upload-box">
          <label className="file-label">
            <input
              type="file"
              accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
              ref={fileInputRef}
              disabled={loading}
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
            {loading ? "AI Scanning..." : "Run AI Scrutiny"}
          </button>
        </div>

        {loading && (
          <div className="upload-loader-overlay">
            <div className="ai-plan-loader">
              <div className="ai-plan-card">
                <div className="plan-bg-grid"></div>

                <div className="plan-plot">
                  <div className="plan-house">
                    <span className="plan-room room-top-left"></span>
                    <span className="plan-room room-top-right"></span>
                    <span className="plan-room room-bottom-left"></span>
                    <span className="plan-room room-bottom-right"></span>

                    <span className="plan-wall wall-center-v"></span>
                    <span className="plan-wall wall-center-h"></span>
                    <span className="plan-door door-main"></span>
                  </div>

                  <span className="setback-line setback-top"></span>
                  <span className="setback-line setback-right"></span>
                  <span className="setback-line setback-bottom"></span>
                  <span className="setback-line setback-left"></span>
                </div>

                <span className="ai-node node-1"></span>
                <span className="ai-node node-2"></span>
                <span className="ai-node node-3"></span>
                <span className="ai-node node-4"></span>

                <span className="ai-scan-ring ring-1"></span>
                <span className="ai-scan-ring ring-2"></span>

                <div className="ai-scan-beam"></div>
                <div className="ai-scan-line"></div>
              </div>
            </div>
          </div>
        )}
      </div>

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