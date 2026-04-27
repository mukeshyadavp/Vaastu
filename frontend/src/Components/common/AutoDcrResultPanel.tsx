import FileScannerLoader from "./FileScannerLoader";
import "./ai-file-components.css";

export type AutoDcrResultStatus = "success" | "failure" | "";

export type AutoDcrViolationItem = {
  rule: string;
  message: string;
  required: string | number;
  found: string | number;
};

type AutoDcrResultPanelProps = {
  loading: boolean;
  result: AutoDcrResultStatus;
  message: string;
  applicationNo?: string;
  pdfUrl?: string;
  violations?: AutoDcrViolationItem[];
  file: File | null;
  filePreviewUrl: string;
  onDownload?: () => void;
  onBack?: () => void;
  onFinish?: () => void;
  showBackButton?: boolean;
  showFinishButton?: boolean;
};

const AutoDcrResultPanel: React.FC<AutoDcrResultPanelProps> = ({
  loading,
  result,
  message,
  applicationNo,
  pdfUrl,
  violations = [],
  file,
  filePreviewUrl,
  onDownload,
  onBack,
  onFinish,
  showBackButton = false,
  showFinishButton = false,
}) => {
  return (
    <>
      <div className="result-wrapper">
        {loading && (
          <div className="result-loader-card">
            <FileScannerLoader
              file={file}
              filePreviewUrl={filePreviewUrl}
              variant="result"
            />
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

            {pdfUrl && onDownload && (
              <button
                type="button"
                className="download-btn"
                onClick={onDownload}
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

      {!loading && (showBackButton || showFinishButton) && (
        <div className="bottomActions">
          {showBackButton && (
            <button type="button" className="backBtn" onClick={onBack}>
              ‹ Back
            </button>
          )}

          {showFinishButton && (
            <button type="button" className="nextBtn" onClick={onFinish}>
              Finish
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default AutoDcrResultPanel;