import FileScannerLoader from "./FileScannerLoader";
import "./ai-file-components.css";

type GenericFileUploadProps = {
  file: File | null;
  filePreviewUrl: string;

  loading?: boolean;
  disabled?: boolean;

  accept?: string;
  title?: string;

  uploadText?: string;
  uploadSubtext?: string;

  buttonText?: string;
  loadingButtonText?: string;
  showButton?: boolean;

  onFileChange: (file: File) => void | Promise<void>;
  onRun?: () => void | Promise<void>;

  inputRef?: React.RefObject<HTMLInputElement>;
};

const GenericFileUpload: React.FC<GenericFileUploadProps> = ({
  file,
  filePreviewUrl,

  loading = false,
  disabled = false,

  accept = ".pdf,.dwg,.dxf,.png,.jpg,.jpeg",
  title,

  uploadText = "Click to upload or drag & drop",
  uploadSubtext = "CAD / PDF / Drawing File (Max 20MB)",

  buttonText = "Run AI Scrutiny",
  loadingButtonText = "AI Scanning...",
  showButton = true,

  onFileChange,
  onRun,

  inputRef,
}) => {
  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    await onFileChange(selectedFile);
  };

  return (
    <div className="generic-upload-section">
      {title && <h2>{title}</h2>}

      <div className="upload-area-wrapper">
        <div className="upload-box">
          <label className="file-label">
            <input
              type="file"
              accept={accept}
              ref={inputRef}
              disabled={disabled || loading}
              onChange={handleInputChange}
            />

            <div className="upload-content">
              <p className="upload-icon">📄</p>

              <p className="upload-text">
                {file ? file.name : uploadText}
              </p>

              <span className="upload-subtext">{uploadSubtext}</span>
            </div>
          </label>

          {showButton && (
            <button
              type="button"
              className="upload-btn"
              onClick={onRun}
              disabled={disabled || loading}
            >
              {loading ? loadingButtonText : buttonText}
            </button>
          )}
        </div>

        {loading && (
          <div className="upload-loader-overlay">
            <FileScannerLoader
              file={file}
              filePreviewUrl={filePreviewUrl}
              variant="upload"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericFileUpload;