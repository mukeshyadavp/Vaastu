import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";

type Props = {
  form: BuildingPermissionForm;
};

const ReviewSubmitStep: React.FC<Props> = ({ form }) => {
  return (
    <div className="reviewCenterWrapper">
      <div className="reviewColorCard">
        <h2 className="reviewTitle">Review & Submit</h2>

        <p className="reviewText">
          Please verify all details before final submission.
        </p>

        <div className="reviewCard">
          <h4>👤 Applicant Details</h4>
          <p>
            <b>Name:</b> {form.applicantName || "-"}
          </p>
        </div>

        <div className="reviewCard">
          <h4>📍 Plot Details</h4>
          <p>
            <b>Survey No:</b> {form.survey || "-"}
          </p>
          <p>
            <b>Plot Area:</b> {form.plotArea || "-"}
          </p>
          <p>
            <b>Road Width:</b> {form.roadWidth || "-"}
          </p>
          <p>
            <b>Land Type:</b> {form.landType || "-"}
          </p>
          <p>
            <b>Latitude:</b> {form.latitude || "-"}
          </p>
          <p>
            <b>Longitude:</b> {form.longitude || "-"}
          </p>
        </div>

        <div className="reviewCard">
          <h4>🏗 Building Details</h4>
          <p>
            <b>Floors:</b> {form.floors || "-"}
          </p>
          <p>
            <b>Area:</b> {form.area || "-"}
          </p>
          <p>
            <b>Height:</b> {form.height || "-"}
          </p>
          <p>
            <b>Front:</b> {form.front || "-"}
          </p>
          <p>
            <b>Side:</b> {form.side || "-"}
          </p>
          <p>
            <b>Rear:</b> {form.rear || "-"}
          </p>
          <p>
            <b>Usage:</b> {form.usage || "-"}
          </p>
        </div>

        <div className="reviewCard">
          <h4>📄 Uploaded File</h4>

          <p>
            <b>File Name:</b> {form.file?.name || "No file uploaded"}
          </p>

          <button
            className="previewBtn"
            onClick={() => form.setShowFilePreview(true)}
            disabled={!form.filePreviewUrl}
          >
            👁 Preview File
          </button>
        </div>

        <div className="reviewNote">
          ⚠️ On submit, application will be saved and Auto-DCR scrutiny will run
          automatically.
        </div>

        <div className="bottomActions">
          <button className="backBtn" onClick={() => form.setStep(4)}>
            ‹ Back
          </button>

          <button className="nextBtn" onClick={form.submitAndRunAutoDcr}>
            Submit & Run Auto-DCR →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;