import FileScannerLoader from "./FileScannerLoader";
import "./ai-file-components.css";

export type AutoDcrResultStatus = "success" | "failure" | "";

export type AutoDcrViolationItem = {
  rule: string;
  message: string;
  required: string | number;
  found: string | number;
};

export type AutoDcrComplianceItem = {
  rule: string;
  status: "PASSED" | "FAILED";
  submitted: number;
  required: number;
  unit: string;
  reference: string;
  message: string;
  suggestion?: string;
};

type AutoDcrResultPanelProps = {
  loading: boolean;
  result: AutoDcrResultStatus;
  message: string;
  applicationNo?: string;
  pdfUrl?: string;

  violations?: AutoDcrViolationItem[];
  complianceChecks?: AutoDcrComplianceItem[];

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
  complianceChecks = [],
  file,
  filePreviewUrl,
  onDownload,
  onBack,
  onFinish,
  showBackButton = false,
  showFinishButton = false,
}) => {
  const passedChecks = complianceChecks.filter(
    (item) => item.status === "PASSED"
  );

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

        {!loading && result === "success" && (
          <div className="compliance-list">
            <h3>Compliance Checks Passed</h3>

            {passedChecks.length > 0 ? (
              passedChecks.map((item, index) => (
                <div className="compliance-item" key={`${item.rule}-${index}`}>
                  <strong>{item.rule}</strong>

                  <p>{item.message}</p>

                  <span>
                    Submitted: {item.submitted} {item.unit} | Required:{" "}
                    {item.required} {item.unit}
                  </span>

                  {item.reference && (
                    <small>Reference: {item.reference}</small>
                  )}
                </div>
              ))
            ) : (
              <div className="compliance-item">
                <strong>All Rules Passed</strong>
                <p>
                  The uploaded plan satisfies the configured Auto-DCR compliance
                  checks.
                </p>
              </div>
            )}
          </div>
        )}

        {!loading && result === "failure" && violations.length > 0 && (
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