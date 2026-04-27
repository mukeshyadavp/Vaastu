import GenericFileUpload from "../../../common/GenericFileUpload";
import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";

type Props = {
  form: BuildingPermissionForm;
};

const UploadCadStep: React.FC<Props> = ({ form }) => {
  return (
    <>
      <h2 className="sectionTitle">Upload CAD Designs</h2>

      <GenericFileUpload
        file={form.file}
        filePreviewUrl={form.filePreviewUrl}
        loading={form.loading}
        disabled={form.loading}
        inputRef={form.fileInputRef}
        showButton={false}
        uploadText="Click to upload or drag & drop"
        uploadSubtext="CAD / PDF / Drawing File (Max 20MB)"
        onFileChange={form.handleFileChange}
      />

      <div className="bottomActions">
        <button
          type="button"
          className="backBtn"
          onClick={() => form.setStep(3)}
          disabled={form.loading}
        >
          ‹ Back
        </button>

        <button
          type="button"
          className="nextBtn"
          onClick={() => {
            if (!form.file) {
              alert("Please upload CAD / PDF / drawing file");
              return;
            }

            form.setStep(5);
          }}
          disabled={form.loading}
        >
          Next →
        </button>
      </div>
    </>
  );
};

export default UploadCadStep;