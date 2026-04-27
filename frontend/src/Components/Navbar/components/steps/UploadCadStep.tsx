import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";

type Props = {
  form: BuildingPermissionForm;
};

const UploadCadStep: React.FC<Props> = ({ form }) => {
  return (
    <>
      <h2 className="sectionTitle">Upload CAD Designs</h2>

      <div className="upload-section wizard-upload-section">
        <div className="upload-area-wrapper">
          <div className="upload-box">
            <label className="file-label">
              <input
                type="file"
                ref={form.fileInputRef}
                accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                onChange={(event) => {
                  const selected = event.target.files?.[0];

                  if (selected) {
                    form.handleFileChange(selected);
                  }
                }}
              />

              <div className="upload-content">
                <p className="upload-icon">📄</p>

                <p className="upload-text">
                  {form.file ? form.file.name : "Click to upload or drag & drop"}
                </p>

                <span className="upload-subtext">
                  CAD / PDF / Drawing File (Max 20MB)
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="bottomActions">
        <button className="backBtn" onClick={() => form.setStep(3)}>
          ‹ Back
        </button>

        <button className="nextBtn" onClick={() => form.setStep(5)}>
          Next →
        </button>
      </div>
    </>
  );
};

export default UploadCadStep;