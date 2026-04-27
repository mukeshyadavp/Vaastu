import AutoDcrResultPanel from "../../../common/AutoDcrResultPanel";
import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";
import "../../styles/common.css"

type Props = {
  form: BuildingPermissionForm;
};

const ResultStep: React.FC<Props> = ({ form }) => {
  // ✅ ADD THIS CHECK
  const noResult =
    !form.file || (!form.pdfUrl && !form.loading);

if (noResult) {
  return (
    <div className="result-panel">
      <div className="empty-icon">📄</div>
      <h2>No Result Found</h2>
      <p>
        Please upload your CAD/PDF file and submit the application to generate
        AI compliance results.
      </p>
    </div>
  );
}

  return (
    <AutoDcrResultPanel
      loading={form.loading}
      result={form.aiResult}
      message={form.message}
      applicationNo={form.applicationNo}
      pdfUrl={form.pdfUrl}
      violations={form.violations}
      complianceChecks={form.complianceChecks}
      file={form.file}
      filePreviewUrl={form.filePreviewUrl}
      onDownload={form.downloadReport}
      onBack={() => form.setStep(5)}
      onFinish={form.closeForm}
      showBackButton
      showFinishButton
    />
  );
};

export default ResultStep;