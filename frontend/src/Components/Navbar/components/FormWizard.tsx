import { useEffect } from "react";

import Stepper from "./Stepper";
import FilePreviewModal from "./FilePreviewModal";

import ApplicantDetailsStep from "./steps/ApplicantDetailsStep";
import PlotDetailsStep from "./steps/PlotDetailsStep";
import BuildingDetailsStep from "./steps/BuildingDetailsStep";
import UploadCadStep from "./steps/UploadCadStep";
import ReviewSubmitStep from "./steps/ReviewSubmitStep";
import ResultStep from "./steps/ResultStep";

import { useBuildingPermissionForm } from "./hooks/useBuildingPermissionForm";

type FormWizardProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchApplications?: () => void;
  lockBodyScroll: boolean;
};

const FormWizard: React.FC<FormWizardProps> = ({
  open,
  setOpen,
  fetchApplications = () => {},
  lockBodyScroll,
}) => {
  const form = useBuildingPermissionForm({
    setOpen,
    fetchApplications,
  });

  useEffect(() => {
    if (lockBodyScroll || form.showFilePreview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [lockBodyScroll, form.showFilePreview]);

  if (!open) return null;

  return (
    <div className="modalOverlay">
      <div className="formPage" onClick={(event) => event.stopPropagation()}>
        <button className="closeFormBtn" onClick={form.closeForm}>
          ✖
        </button>

        <Stepper step={form.step} loading={form.loading} setStep={form.setStep} />

        {form.step === 1 && <ApplicantDetailsStep form={form} />}
        {form.step === 2 && <PlotDetailsStep form={form} />}
        {form.step === 3 && <BuildingDetailsStep form={form} />}
        {form.step === 4 && <UploadCadStep form={form} />}
        {form.step === 5 && <ReviewSubmitStep form={form} />}
        {form.step === 6 && <ResultStep form={form} />}

        <FilePreviewModal
          open={form.showFilePreview}
          file={form.file}
          filePreviewUrl={form.filePreviewUrl}
          onClose={() => form.setShowFilePreview(false)}
        />
      </div>
    </div>
  );
};

export default FormWizard;