import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";

type Props = {
  form: BuildingPermissionForm;
};

const BuildingDetailsStep: React.FC<Props> = ({ form }) => {
  return (
    <>
      <h2 className="sectionTitle">Building Details</h2>

      <input
        className="inputBox"
        value={form.floors}
        onChange={(event) => form.setFloors(event.target.value)}
        placeholder="Floors"
      />

      <input
        className="inputBox"
        value={form.area}
        onChange={(event) => form.setArea(event.target.value)}
        placeholder="Area"
      />

      <input
        className="inputBox"
        value={form.height}
        onChange={(event) => form.setHeight(event.target.value)}
        placeholder="Height"
      />

      <input
        className="inputBox"
        value={form.front}
        onChange={(event) => form.setFront(event.target.value)}
        placeholder="Front Setback"
      />

      <input
        className="inputBox"
        value={form.side}
        onChange={(event) => form.setSide(event.target.value)}
        placeholder="Side Setback"
      />

      <input
        className="inputBox"
        value={form.rear}
        onChange={(event) => form.setRear(event.target.value)}
        placeholder="Rear Setback"
      />

      <select
        className="inputBox"
        value={form.usage}
        onChange={(event) => form.setUsage(event.target.value)}
      >
        <option value="">Usage Type</option>
        <option>Residential</option>
        <option>Commercial</option>
      </select>

      <div className="bottomActions">
        <button className="backBtn" onClick={() => form.setStep(2)}>
          ‹ Back
        </button>

        <button className="nextBtn" onClick={() => form.setStep(4)}>
          Next →
        </button>
      </div>
    </>
  );
};

export default BuildingDetailsStep;