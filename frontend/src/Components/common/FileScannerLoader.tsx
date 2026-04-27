type FileScannerLoaderProps = {
  file: File | null;
  filePreviewUrl: string;
  variant?: "upload" | "result";
};

const FileScannerLoader: React.FC<FileScannerLoaderProps> = ({
  file,
  filePreviewUrl,
  variant = "upload",
}) => {
  const fileName = file?.name || "";
  const isPdfFile =
    Boolean(filePreviewUrl) &&
    (file?.type.includes("pdf") || fileName.toLowerCase().endsWith(".pdf"));

  const shouldShowImagePreview = Boolean(filePreviewUrl) && !isPdfFile;

  return (
    <div
      className={`file-scan-loader ${
        variant === "result" ? "result-file-loader" : ""
      }`}
    >
      <div className="file-scan-card">
        {shouldShowImagePreview ? (
          <img
            src={filePreviewUrl}
            alt="Uploaded plan preview"
            className="file-scan-thumbnail"
            onError={(event) => {
              console.error("Preview image failed:", filePreviewUrl);
              event.currentTarget.style.display = "none";
            }}
          />
        ) : isPdfFile ? (
          <iframe
            src={filePreviewUrl}
            title="Uploaded PDF preview"
            className="file-scan-thumbnail file-scan-pdf"
          />
        ) : (
          <div className="file-scan-fallback">
            <span>CAD</span>
          </div>
        )}

        <div className="file-scan-overlay-grid"></div>
        <div className="file-scan-band"></div>
        <div className="file-scan-line"></div>

        <span className="file-scan-corner top-left"></span>
        <span className="file-scan-corner top-right"></span>
        <span className="file-scan-corner bottom-left"></span>
        <span className="file-scan-corner bottom-right"></span>
      </div>
    </div>
  );
};

export default FileScannerLoader;