type StepperProps = {
  step: number;
  loading: boolean;
  setStep: (step: number) => void;
};

const steps = [
  "Applicant Details",
  "Plot Details",
  "Building Details",
  "Upload CAD Designs",
  "Review & Submit",
  "Result",
];

const Stepper: React.FC<StepperProps> = ({ step, loading, setStep }) => {
  return (
    <div className="stepper">
      {steps.map((item, index) => (
        <div
          key={item}
          className={`step ${step >= index + 1 ? "active" : ""}`}
          onClick={() => {
            if (!loading) {
              setStep(index + 1);
            }
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default Stepper;