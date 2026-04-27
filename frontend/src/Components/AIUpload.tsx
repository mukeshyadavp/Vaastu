import { useEffect, useRef, useState } from "react";
import {
  runAutoDcr,
  getReportDownloadUrl,
  generateCadPreview,
  type AutoDcrViolation,
  type AutoDcrCheck,
} from "../Services/api";

import GenericFileUpload from "./common/GenericFileUpload";
import AutoDcrResultPanel from "./common/AutoDcrResultPanel";

import "./AIUpload.css";

type UploadResult = "success" | "failure" | "";

const AIUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");

  const [result, setResult] = useState<UploadResult>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [pdfUrl, setPdfUrl] = useState("");
  const [applicationNo, setApplicationNo] = useState("");
  const [violations, setViolations] = useState<AutoDcrViolation[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<AutoDcrCheck[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const wait = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

  const resetResult = () => {
    setResult("");
    setMessage("");
    setPdfUrl("");
    setApplicationNo("");
    setViolations([]);
    setComplianceChecks([]);
  };

  const isImageFile = (selectedFile: File) => {
    return selectedFile.type.startsWith("image/");
  };

  const isPdfFile = (selectedFile: File) => {
    return selectedFile.type.includes("pdf");
  };

  const isDxfFile = (selectedFile: File) => {
    return selectedFile.name.toLowerCase().endsWith(".dxf");
  };

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);

    if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setFilePreviewUrl("");
    resetResult();

    if (isImageFile(selectedFile) || isPdfFile(selectedFile)) {
      setFilePreviewUrl(URL.createObjectURL(selectedFile));
      return;
    }

    if (isDxfFile(selectedFile)) {
      try {
        const previewUrl = await generateCadPreview(selectedFile);
        const fullPreviewUrl = getReportDownloadUrl(previewUrl);

        console.log("DXF preview URL:", fullPreviewUrl);

        setFilePreviewUrl(fullPreviewUrl);
        return;
      } catch (error) {
        console.error("CAD preview failed:", error);
        setFilePreviewUrl("");
        return;
      }
    }

    setFilePreviewUrl("");
  };

  const handleUpload = async () => {
    if (!file) {
      setResult("failure");
      setMessage("Please select a file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setResult("failure");
      setMessage("File too large. Maximum allowed size is 20MB");
      return;
    }

    setLoading(true);
    resetResult();

    const loaderStartTime = Date.now();

    try {
      const data = await runAutoDcr(file, {
        buildingType: "Residential",
        floors: 2,
        height: 7.0,
        classification: "Non-High-Rise",
      });

      const elapsedTime = Date.now() - loaderStartTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);

      await wait(remainingTime);

      const isCompliant = data.result.isCompliant;

      setResult(isCompliant ? "success" : "failure");

      setMessage(
        isCompliant
          ? "Plan Approved. Compliance certificate generated successfully."
          : "Plan Rejected. Non-compliance report generated successfully."
      );

      setPdfUrl(data.pdf.downloadUrl);
      setApplicationNo(data.pdf.applicationNo);
      setViolations(data.result.violations || []);
      setComplianceChecks(data.result.checks || []);
    } catch (error) {
      const elapsedTime = Date.now() - loaderStartTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);

      await wait(remainingTime);

      setResult("failure");

      setMessage(
        error instanceof Error
          ? error.message
          : "Upload failed. Please check Flask server and try again."
      );

      setPdfUrl("");
      setApplicationNo("");
      setViolations([]);
      setComplianceChecks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      setMessage("PDF is not available yet");
      return;
    }

    const link = document.createElement("a");

    link.href = getReportDownloadUrl(pdfUrl);
    link.download =
      result === "success"
        ? `${applicationNo}-Approved-Compliance.pdf`
        : `${applicationNo}-Rejected-Compliance.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shouldShowResultPanel =
    !loading &&
    (result !== "" || violations.length > 0 || complianceChecks.length > 0);

  return (
    <>
      <GenericFileUpload
        title="AI-Assisted Automated Scrutiny"
        file={file}
        filePreviewUrl={filePreviewUrl}
        loading={loading}
        disabled={loading}
        inputRef={fileInputRef}
        buttonText="Run AI Scrutiny"
        loadingButtonText="AI Scanning..."
        onFileChange={handleFileChange}
        onRun={handleUpload}
      />

      {shouldShowResultPanel && (
        <AutoDcrResultPanel
          loading={false}
          result={result}
          message={message}
          applicationNo={applicationNo}
          pdfUrl={pdfUrl}
          violations={violations}
          complianceChecks={complianceChecks}
          file={file}
          filePreviewUrl={filePreviewUrl}
          onDownload={handleDownload}
        />
      )}
    </>
  );
};

export default AIUpload;