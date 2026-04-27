import AutoDcrResultPanel from "../../../common/AutoDcrResultPanel";
import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";

type Props = {
  form: BuildingPermissionForm;
};

const ResultStep: React.FC<Props> = ({ form }) => {
  return (
    <AutoDcrResultPanel
      loading={form.loading}
      result={form.aiResult}
      message={form.message}
      applicationNo={form.applicationNo}
      pdfUrl={form.pdfUrl}
      violations={form.violations}
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