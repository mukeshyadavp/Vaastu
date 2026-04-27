import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";

type Props = {
  form: BuildingPermissionForm;
};

const ApplicantDetailsStep: React.FC<Props> = ({ form }) => {
  return (
    <>
      <h2>Personal Information</h2>

      <div className="formGrid">
        <input
          placeholder="Applicant Full Name"
          value={form.applicantName}
          onChange={(event) => form.setApplicantName(event.target.value)}
        />

        <input placeholder="Relationship" />
        <input placeholder="Aadhaar Number" />
        <input placeholder="Mobile Number" />
        <input placeholder="E-mail ID" />
        <input placeholder="Password" type="password" />
        <input placeholder="Confirm Password" type="password" />
        <textarea placeholder="Address" />
      </div>

      <button className="saveBtn" onClick={() => form.setStep(2)}>
        Save & Continue →
      </button>
    </>
  );
};

export default ApplicantDetailsStep;