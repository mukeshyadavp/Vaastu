type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  onBuildingPermission: () => void;
};

const ApplyModal: React.FC<ApplyModalProps> = ({
  open,
  onClose,
  onBuildingPermission,
}) => {
  if (!open) return null;

  return (
    <div className="modalOverlay">
      <div className="modal">
        <div className="modalHeader">
          <h2>Apply For</h2>

          <span className="closeBtn" onClick={onClose}>
            ✖
          </span>
        </div>

        <div className="modalContent">
          <p className="active" onClick={onBuildingPermission}>
            Building Permission
          </p>

          <p>GP Layout Permission</p>
          <p>Final Layout</p>
          <p>Occupancy Certificate</p>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;