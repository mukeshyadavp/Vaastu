type FilePreviewModalProps = {
  open: boolean;
  file: File | null;
  filePreviewUrl: string;
  onClose: () => void;
};

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  open,
  file,
  filePreviewUrl,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div
        className="largeModal previewModal"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="previewCloseBtn" onClick={onClose}>
          ✖
        </button>

        <div className="previewBody">
          {file?.type.includes("pdf") ? (
            <iframe
              src={filePreviewUrl}
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : file?.type.startsWith("image/") ? (
            <img src={filePreviewUrl} alt="preview" className="previewImage" />
          ) : (
            <div className="previewUnsupported">
              <h3>Preview not available</h3>
              <p>{file?.name}</p>
              <p>CAD/DXF files can be uploaded and processed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;