import FloorPlanLoader from "../FloorPlanLoader";
import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";

type Props = {
  form: BuildingPermissionForm;
};

const ResultStep: React.FC<Props> = ({ form }) => {
  return (
    <>
      <div className="result-wrapper">
        {form.loading && (
          <div className="result-loader-card">
            <FloorPlanLoader />
          </div>
        )}

        {!form.loading && form.aiResult !== "" && (
          <div className={`result-card ${form.aiResult}`}>
            <div className="result-left">
              <div className={`result-icon ${form.aiResult}`}>
                {form.aiResult === "success" ? "✔" : "✖"}
              </div>

              <div>
                <h3 className="result-title">
                  {form.aiResult === "success" ? "Plan Approved" : "Plan Rejected"}
                </h3>

                <p className="result-message">{form.message}</p>

                {form.applicationNo && (
                  <p className="application-no">
                    Application No: <strong>{form.applicationNo}</strong>
                  </p>
                )}
              </div>
            </div>

            {form.pdfUrl && (
              <button
                type="button"
                className="download-btn"
                onClick={form.downloadReport}
              >
                ⬇ Download Compliance PDF
              </button>
            )}
          </div>
        )}

        {!form.loading && form.violations.length > 0 && (
          <div className="violation-list">
            <h3>Compliance Violations</h3>

            {form.violations.map((item, index) => (
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

      {!form.loading && (
        <div className="bottomActions">
          <button className="backBtn" onClick={() => form.setStep(5)}>
            ‹ Back
          </button>

          <button className="nextBtn" onClick={form.closeForm}>
            Finish
          </button>
        </div>
      )}
    </>
  );
};

export default ResultStep;