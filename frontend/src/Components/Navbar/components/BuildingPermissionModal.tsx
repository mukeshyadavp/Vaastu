type BuildingPermissionModalProps = {
  open: boolean;
  type: string;
  setType: (value: string) => void;
  onClose: () => void;
  onContinue: () => void;
};

const BuildingPermissionModal: React.FC<BuildingPermissionModalProps> = ({
  open,
  type,
  setType,
  onClose,
  onContinue,
}) => {
  if (!open) return null;

  return (
    <div className="modalOverlay">
      <div className="modal largeModal">
        <div className="modalHeader">
          <h2>Building Permission</h2>

          <span className="closeBtn" onClick={onClose}>
            X
          </span>
        </div>

        <div className="modalContent">
          <h4>Building Permission Type</h4>

          <div className="radioGroup">
            <input
              type="radio"
              id="new"
              name="type"
              checked={type === "new"}
              onChange={() => setType("new")}
            />
            <label htmlFor="new">New</label>

            <input
              type="radio"
              id="additional"
              name="type"
              checked={type === "additional"}
              onChange={() => setType("additional")}
            />
            <label htmlFor="additional">Additional</label>

            <input
              type="radio"
              id="revision"
              name="type"
              checked={type === "revision"}
              onChange={() => setType("revision")}
            />
            <label htmlFor="revision">Revision</label>
          </div>

          <button className="goBtn" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildingPermissionModal;
