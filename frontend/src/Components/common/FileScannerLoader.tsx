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
  const isGeneratedCadPreview =
    Boolean(filePreviewUrl) &&
    Boolean(file) &&
    /\.(dxf|dwg)$/i.test(file?.name || "");

  return (
    <div
      className={`file-scan-loader ${
        variant === "result" ? "result-file-loader" : ""
      }`}
    >
      <div className="file-scan-card">
        {filePreviewUrl &&
        (file?.type.startsWith("image/") || isGeneratedCadPreview) ? (
          <img
            src={filePreviewUrl}
            alt="Uploaded plan preview"
            className="file-scan-thumbnail"
          />
        ) : filePreviewUrl && file?.type.includes("pdf") ? (
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