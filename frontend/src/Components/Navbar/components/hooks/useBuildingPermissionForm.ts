import { useEffect, useRef, useState } from "react";
import {
  apiPost,
  getReportDownloadUrl,
  runAutoDcr,
  generateCadPreview,
  searchLocationSuggestions,
  type AutoDcrCheck,
} from "../../../../Services/api";

type UseBuildingPermissionFormProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchApplications?: () => void;
};

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export const useBuildingPermissionForm = ({
  setOpen,
  fetchApplications = () => {},
}: UseBuildingPermissionFormProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState(1);

  const [applicantName, setApplicantName] = useState("");
  const [survey, setSurvey] = useState("");
  const [plotArea, setPlotArea] = useState("");
  const [roadWidth, setRoadWidth] = useState("");
  const [landType, setLandType] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [floors, setFloors] = useState("");
  const [area, setArea] = useState("");
  const [height, setHeight] = useState("");
  const [front, setFront] = useState("");
  const [side, setSide] = useState("");
  const [rear, setRear] = useState("");
  const [usage, setUsage] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [showFilePreview, setShowFilePreview] = useState(false);

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [pdfUrl, setPdfUrl] = useState("");
  const [applicationNo, setApplicationNo] = useState("");
  const [aiResult, setAiResult] = useState<"success" | "failure" | "">("");
  const [message, setMessage] = useState("");
  const [violations, setViolations] = useState<any[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<AutoDcrCheck[]>([]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const resetResult = () => {
    setPdfUrl("");
    setApplicationNo("");
    setAiResult("");
    setMessage("");
    setViolations([]);
    setComplianceChecks([]);
  };

  const isImageFile = (selectedFile: File) => {
    return selectedFile.type.startsWith("image/");
  };

  const isPdfFile = (selectedFile: File) => {
    return (
      selectedFile.type.includes("pdf") ||
      selectedFile.name.toLowerCase().endsWith(".pdf")
    );
  };

  const isDxfFile = (selectedFile: File) => {
    return selectedFile.name.toLowerCase().endsWith(".dxf");
  };

  const isDwgFile = (selectedFile: File) => {
    return selectedFile.name.toLowerCase().endsWith(".dwg");
  };

  const searchMapLocation = async () => {
  if (!searchLocation.trim()) return;

  try {
    const data = await searchLocationSuggestions(searchLocation);

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      setLatitude(lat.toString());
      setLongitude(lon.toString());

      window.dispatchEvent(
        new CustomEvent("moveMap", {
          detail: { lat, lon },
        })
      );
    } else {
      alert("Location not found");
    }
  } catch (error) {
    console.error("Location search failed:", error);
    alert("Unable to search location");
  }
};

const fetchSuggestions = async (query: string) => {
  if (!query.trim()) {
    setSuggestions([]);
    return;
  }

  if (query.trim().length < 3) {
    setSuggestions([]);
    return;
  }

  try {
    const data = await searchLocationSuggestions(query);
    setSuggestions(data);
  } catch (error) {
    console.error("Suggestion fetch failed:", error);
    setSuggestions([]);
  }
};


  const submitApplication = async () => {
    const newData = {
      applicantName: applicantName || "New Applicant",
      location: searchLocation || landType || "Auto Location",
      plotSize: plotArea || "N/A",
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      status: "Pending",
    };

    const response = await apiPost("/api/applications", newData);

    return response;
  };

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    resetResult();

    if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setFilePreviewUrl("");

    if (isImageFile(selectedFile) || isPdfFile(selectedFile)) {
      setFilePreviewUrl(URL.createObjectURL(selectedFile));
      return;
    }

    // if (isDxfFile(selectedFile)) {
    //   try {
    //     setPreviewLoading(true);

    //     const previewUrl = await generateCadPreview(selectedFile);
    //     const fullPreviewUrl = getReportDownloadUrl(previewUrl);

    //     console.log("DXF preview URL:", fullPreviewUrl);

    //     setFilePreviewUrl(fullPreviewUrl);
    //   } catch (error) {
    //     console.error("CAD preview failed:", error);
    //     setFilePreviewUrl("");
    //   } finally {
    //     setPreviewLoading(false);
    //   }

    //   return;
    // }

    if (isDwgFile(selectedFile) || isDxfFile(selectedFile)) {
      console.warn("DWG preview is disabled on Render free. Showing CAD fallback.");
      setFilePreviewUrl("");
      return;
    }

    setFilePreviewUrl("");
  };

  const submitAndRunAutoDcr = async () => {
    if (!file) {
      alert("Please upload CAD / PDF / drawing file before submitting");
      setStep(4);
      return;
    }

    setStep(6);
    setLoading(true);
    resetResult();

    const loaderStartTime = Date.now();

    try {
      await submitApplication();

      const data = await runAutoDcr(file, {
        buildingType: usage || "Residential",
        floors: Number(floors || 2),
        height: Number(height || 7),
        classification: "Non-High-Rise",
      });

      const elapsedTime = Date.now() - loaderStartTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);

      await wait(remainingTime);

      const isCompliant = data.result.isCompliant;

      setAiResult(isCompliant ? "success" : "failure");

      setMessage(
        isCompliant
          ? "Plan Approved. Compliance certificate generated successfully."
          : "Plan Rejected. Non-compliance report generated successfully."
      );

      setPdfUrl(data.pdf.downloadUrl);
      setApplicationNo(data.pdf.applicationNo);
      setViolations(data.result.violations || []);
      setComplianceChecks(data.result.checks || []);

      fetchApplications();

      alert("Application Submitted ✅");
    } catch (error) {
      const elapsedTime = Date.now() - loaderStartTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);

      await wait(remainingTime);

      setAiResult("failure");

      setMessage(
        error instanceof Error
          ? error.message
          : "AI Auto-DCR processing failed"
      );

      setPdfUrl("");
      setApplicationNo("");
      setViolations([]);
      setComplianceChecks([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!pdfUrl) {
      alert("Report is not available yet");
      return;
    }

    const link = document.createElement("a");

    link.href = getReportDownloadUrl(pdfUrl);

    link.download =
      aiResult === "success"
        ? `${applicationNo}-Approved-Compliance.pdf`
        : `${applicationNo}-Rejected-Compliance.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetWizard = () => {
    setStep(1);

    setApplicantName("");
    setSurvey("");
    setPlotArea("");
    setRoadWidth("");
    setLandType("");
    setSearchLocation("");
    setLatitude("");
    setLongitude("");

    setFloors("");
    setArea("");
    setHeight("");
    setFront("");
    setSide("");
    setRear("");
    setUsage("");

    setFile(null);

    if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setFilePreviewUrl("");
    setShowFilePreview(false);

    setLoading(false);
    setPreviewLoading(false);

    resetResult();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeForm = () => {
    setOpen(false);
    resetWizard();
    setSuggestions([]);
  };

  return {
    fileInputRef,

    step,
    setStep,

    applicantName,
    setApplicantName,

    survey,
    setSurvey,

    plotArea,
    setPlotArea,

    roadWidth,
    setRoadWidth,

    landType,
    setLandType,

    searchLocation,
    setSearchLocation,

    latitude,
    setLatitude,

    longitude,
    setLongitude,

    floors,
    setFloors,

    area,
    setArea,

    height,
    setHeight,

    front,
    setFront,

    side,
    setSide,

    rear,
    setRear,

    usage,
    setUsage,

    file,
    filePreviewUrl,
    showFilePreview,
    setShowFilePreview,

    loading,
    previewLoading,

    pdfUrl,
    applicationNo,
    aiResult,
    message,
    violations,
    complianceChecks,

    searchMapLocation,
    submitAndRunAutoDcr,
    downloadReport,
    handleFileChange,
    closeForm,

    suggestions,
setSuggestions,
fetchSuggestions,
  };
};

export type BuildingPermissionForm = ReturnType<
  typeof useBuildingPermissionForm
>;