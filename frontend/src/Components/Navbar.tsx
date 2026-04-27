import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import "./Navbar.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import { apiPost, getReportDownloadUrl, runAutoDcr } from "../Services/api";
const MapComponent = () => {
  const position: LatLngExpression = [17.385, 78.4867];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Selected Location</Popup>
      </Marker>
    </MapContainer>
  );
};

type NavbarProps = {
  fetchApplications: () => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bpOpen: boolean;
  setBpOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formOpen: boolean;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;

    applyOpen: boolean;              // ✅ ADD
  setApplyOpen: React.Dispatch<React.SetStateAction<boolean>>; // ✅ ADD
};

const Navbar: React.FC<NavbarProps> = ({
  open,
  bpOpen,
  setBpOpen,
  formOpen,
  setFormOpen,
    applyOpen,        // ✅ ADD
  setApplyOpen,     // ✅ ADD
  fetchApplications,
}) => {
  const [type, setType] = useState("");
  const [step, setStep] = useState(1);
  const [floors, setFloors] = useState("");
  const [area, setArea] = useState("");
  const [height, setHeight] = useState("");
  const [usage, setUsage] = useState("");

  const [front, setFront] = useState("");
  const [side, setSide] = useState("");
  const [rear, setRear] = useState("");

  const [survey, setSurvey] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [plotArea, setPlotArea] = useState("");
  const [roadWidth, setRoadWidth] = useState("");
  const [landType, setLandType] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>("");
  const [showFilePreview, setShowFilePreview] = useState(false);
  

  // const [cadFiles, setCadFiles] = useState<File[]>([]);
  // const [result, setResult] = useState<"success" | "failure" | "">("");

  const [showMenu, setShowMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();




  const fileInputRef = useRef<HTMLInputElement | null>(null);

const [file, setFile] = useState<File | null>(null);
const [loading, setLoading] = useState(false);
const [progress, setProgress] = useState(0);

const [pdfUrl, setPdfUrl] = useState("");
const [applicationNo, setApplicationNo] = useState("");
const [aiResult, setAiResult] = useState<"success" | "failure" | "">("");
const [message, setMessage] = useState("");
  /* ===== Dynamic User/Admin Switch ===== */
  const switchLabel =
    location.pathname === "/admin" ? "Admin" : "User";

  const switchOption =
    location.pathname === "/admin"
      ? { label: "User", path: "/Home" }
      : { label: "Admin", path: "/admin" };

  /* ===== Validate CAD ===== */
  // const validateBuilding = () => {
  //   if (cadFiles.length === 0) {
  //     setResult("failure");
  //     return;
  //   }

  //   const fileNames = cadFiles.map((file) =>
  //     file.name.toLowerCase()
  //   );

  //   const isSuccessFile = fileNames.some(
  //     (name) => name.includes("success") || name.includes("2006")
  //   );

  //   const isFailureFile = fileNames.some(
  //     (name) => name.includes("failure") || name.includes("2016")
  //   );

  //   if (isSuccessFile) {
  //     setResult("success");
  //   } else if (isFailureFile) {
  //     setResult("failure");
  //   } else {
  //     setResult("failure");
  //   }
  // };

  const submitApplication = async () => {
  try {
    const newData = {
   applicantName: applicantName || "New Applicant",
      location: "Auto Location",
      plotSize: plotArea || "N/A",
    };

  const response = await apiPost("api/applications", newData);

if (response) {
  alert("Application Submitted ✅");
  fetchApplications(); // 🔥 VERY IMPORTANT
} else {
    console.error("Failed to submit application");
  }} catch (error) {
    console.error("Error submitting application:", error);
  }
};

  /* ===== Disable Background Scroll ===== */
  useEffect(() => {
    if (open || bpOpen || formOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open, bpOpen, formOpen]);


  const handleAIUpload = async () => {
  if (!file) {
    alert("Please upload file");
    return;
  }

  setLoading(true);
  setProgress(1);

  try {
    const data = await runAutoDcr(
      file,
      {
        buildingType: "Residential",
        floors: Number(floors || 2),
        height: Number(height || 7),
        classification: "Non-High-Rise",
      },
      (p) => setProgress(p)
    );

    const isCompliant = data.result.isCompliant;

    setAiResult(isCompliant ? "success" : "failure");
    setMessage(
      isCompliant
        ? "Plan Approved"
        : "Plan Rejected"
    );

    setPdfUrl(data.pdf.downloadUrl);
    setApplicationNo(data.pdf.applicationNo);
  } catch (err) {
    setAiResult("failure");
    setMessage("AI Processing Failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      {/* ===== Header ===== */}
      <div className="header">
        <img src={logo} className="logo" alt="logo" />

        <div>
          <h2 className="title">
            Andhra Pradesh Building Permission Approval &
            Self Certification System
          </h2>

          <h3 className="subtitle">
            (AP-bPASS) GOVERNMENT OF ANDHRA PRADESH
          </h3>
        </div>
      </div>

      {/* ===== Menu Bar ===== */}
      <div className="menuBar">
        <div className="menuItems">
          <button
            className="navBtn homeIcon"
            onClick={() => navigate("/")}
          >
            🏠
          </button>

          <button className="navBtn">
            ABOUT AP-bPASS
          </button>

          <button className="navBtn">
            INFORMATION ▼
          </button>

          <button className="navBtn">
            RESOURCES ▼
          </button>

          <button className="navBtn">
            DCR PORTAL
          </button>

          <button className="navBtn">
            SEARCH ▼
          </button>

          <button className="navBtn">
            COMPLAINTS ▼
          </button>

          <button className="navBtn">
            LOGIN ▼
          </button>
        </div>

        {/* ===== User/Admin Dropdown ===== */}
        <div className="dropdownWrapper">
          <button
            className="admin-back-btn"
            onClick={() =>
              setShowMenu((prev) => !prev)
            }
          >
            {switchLabel} ▼
          </button>

          {showMenu && (
            <div className="dropdownMenu">
              <p
                onClick={() => {
                  navigate(switchOption.path);
                  setShowMenu(false);
                }}
              >
                {switchOption.label}
              </p>
            </div>
          )}
        </div>
      </div>

      <hr />

      {/* ===== Apply Modal ===== */}
  {applyOpen && (
        <div className="modalOverlay">
          <div className="modal">
            <div className="modalHeader">
              <h2>Apply For</h2>


              <span
                className="closeBtn"
            onClick={() => setApplyOpen(false)}
              >
                ✖
              </span>
            </div>

            <div className="modalContent">
              <p
                className="active"
                onClick={() => {
             setApplyOpen(false);
                  setBpOpen(true);
                }}
              >
                Building Permission
              </p>

              <p>GP Layout Permission</p>
              <p>Final Layout</p>
              <p>Occupancy Certificate</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Building Permission Modal ===== */}
      {bpOpen && (
        <div className="modalOverlay">
          <div className="modal largeModal">
            <div className="modalHeader">
              <h2>Building Permission</h2>

              <span
                className="closeBtn"
                onClick={() => setBpOpen(false)}
              >
                ✖
              </span>
            </div>

            <div className="modalContent">
              <h4>Building Permission Type</h4>

              <div className="radioGroup">
                <input
                  type="radio"
                  id="new"
                  name="type"
                  onChange={() => setType("new")}
                />
                <label htmlFor="new">New</label>

                <input
                  type="radio"
                  id="additional"
                  name="type"
                  onChange={() =>
                    setType("additional")
                  }
                />
                <label htmlFor="additional">
                  Additional
                </label>

                <input
                  type="radio"
                  id="revision"
                  name="type"
                  onChange={() =>
                    setType("revision")
                  }
                />
                <label htmlFor="revision">
                  Revision
                </label>
              </div>

              <button
                className="goBtn"
                onClick={() => {
                  if (type === "new") {
                    setBpOpen(false);
                    setFormOpen(true);
                  }
                }}
              >
                GO →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Form Wizard ===== */}
      {formOpen && (
        <div
          className="modalOverlay"
          onClick={() => {
          setApplyOpen(false);
            setBpOpen(false);
            setFormOpen(false);
          }}
        >
          <div
            className="formPage"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="closeFormBtn"
              onClick={() =>
                setFormOpen(false)
              }
            >
              ✖
            </button>

            {/* Stepper */}
            <div className="stepper">
              {[
                "Applicant Details",
                "Plot Details",
                "Building Details",
                "Upload CAD Designs",
                "Review & Submit",
                "Result",
              ].map((item, index) => (
                <div
                  key={item}
                  className={`step ${
                    step >= index + 1
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setStep(index + 1)
                  }
                >
                  {item}
                </div>
              ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <h2>Personal Information</h2>

                <div className="formGrid">
                <input
  placeholder="Applicant Full Name"
  value={applicantName}
  onChange={(e) => setApplicantName(e.target.value)}
/>
                  <input placeholder="Relationship" />
                  <input placeholder="Aadhaar Number" />
                  <input placeholder="Mobile Number" />
                  <input placeholder="E-mail ID" />
                  <input
                    placeholder="Password"
                    type="password"
                  />
                  <input
                    placeholder="Confirm Password"
                    type="password"
                  />
                  <textarea placeholder="Address" />
                </div>

                <button
                  className="saveBtn"
                  onClick={() => setStep(2)}
                >
                  Save & Continue →
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <h2 className="sectionTitle">
                  Plot Details
                </h2>

                <input
                  className="inputBox"
                  value={survey}
                  onChange={(e) =>
                    setSurvey(
                      e.target.value
                    )
                  }
                  placeholder="Survey Number"
                />

                <input
                  className="inputBox"
                  value={plotArea}
                  onChange={(e) =>
                    setPlotArea(
                      e.target.value
                    )
                  }
                  placeholder="Plot Area"
                />

                <input
                  className="inputBox"
                  value={roadWidth}
                  onChange={(e) =>
                    setRoadWidth(
                      e.target.value
                    )
                  }
                  placeholder="Road Width"
                />

                <select
                  className="inputBox"
                  value={landType}
                  onChange={(e) =>
                    setLandType(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Land Type
                  </option>
                  <option>
                    Residential
                  </option>
                  <option>
                    Commercial
                  </option>
                </select>

                <div className="mapBoxReal">
                  <MapComponent />
                </div>

                <div className="bottomActions">
                  <button
                    className="backBtn"
                    onClick={() =>
                      setStep(1)
                    }
                  >
                    ‹ Back
                  </button>

                  <button
                    className="nextBtn"
                    onClick={() =>
                      setStep(3)
                    }
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <h2 className="sectionTitle">
                  Building Details
                </h2>

                <input
                  className="inputBox"
                  value={floors}
                  onChange={(e) =>
                    setFloors(
                      e.target.value
                    )
                  }
                  placeholder="Floors"
                />

                <input
                  className="inputBox"
                  value={area}
                  onChange={(e) =>
                    setArea(
                      e.target.value
                    )
                  }
                  placeholder="Area"
                />

                <input
                  className="inputBox"
                  value={height}
                  onChange={(e) =>
                    setHeight(
                      e.target.value
                    )
                  }
                  placeholder="Height"
                />

                <input
                  className="inputBox"
                  value={front}
                  onChange={(e) =>
                    setFront(
                      e.target.value
                    )
                  }
                  placeholder="Front"
                />

                <input
                  className="inputBox"
                  value={side}
                  onChange={(e) =>
                    setSide(
                      e.target.value
                    )
                  }
                  placeholder="Side"
                />

                <input
                  className="inputBox"
                  value={rear}
                  onChange={(e) =>
                    setRear(
                      e.target.value
                    )
                  }
                  placeholder="Rear"
                />

                <select
                  className="inputBox"
                  value={usage}
                  onChange={(e) =>
                    setUsage(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Usage Type
                  </option>
                  <option>
                    Residential
                  </option>
                  <option>
                    Commercial
                  </option>
                </select>

                <div className="bottomActions">
                  <button
                    className="backBtn"
                    onClick={() =>
                      setStep(2)
                    }
                  >
                    ‹ Back
                  </button>

                  <button
                    className="nextBtn"
                    onClick={() =>
                      setStep(4)
                    }
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {/* STEP 4 */}
           {/* STEP 4 - AI Upload */}
{/* STEP 4 - AI Upload (UI SAME AS AIUpload component) */}
{step === 4 && (
  <>
    {/* <h2 className="sectionTitle">
      
    </h2> */}

    <div className="upload-section" style={{ padding: 0, boxShadow: "none" }}>
      <div className="upload-box">
        <label className="file-label">
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
    onChange={(e) => {
  const selected = e.target.files?.[0];
  if (selected) {
    setFile(selected);
    setFilePreviewUrl(URL.createObjectURL(selected)); // 🔥 ADD THIS
  }
}}
          />

          <div className="upload-content">
            <p className="upload-icon">📄</p>

            <p className="upload-text">
              {file ? file.name : "Click to upload or drag & drop"}
            </p>

            <span className="upload-subtext">
              CAD / PDF / Drawing File (Max 20MB)
            </span>
          </div>
        </label>

        {loading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p>Processing AI... {progress}%</p>
          </div>
        )}
      </div>
    </div>

    <div className="bottomActions">
      <button className="backBtn" onClick={() => setStep(3)}>
        ‹ Back
      </button>

      <button
        className="nextBtn"
        onClick={() => {
          handleAIUpload();
          setStep(5);
        }}
      >
        Next →
      </button>
    </div>
  </>
)}
{step === 5 && (
  <div className="reviewCenterWrapper">
    <div className="reviewColorCard">
      <h2 className="reviewTitle">Review & Submit</h2>

      <p className="reviewText">
        Please verify all details before final submission.
      </p>

      {/* ===== Applicant Details ===== */}
      <div className="reviewCard">
        <h4>👤 Applicant Details</h4>
        <p><b>Name:</b> {applicantName || "-"}</p>
      </div>

      {/* ===== Plot Details ===== */}
      <div className="reviewCard">
        <h4>📍 Plot Details</h4>
        <p><b>Survey No:</b> {survey || "-"}</p>
        <p><b>Plot Area:</b> {plotArea || "-"}</p>
        <p><b>Road Width:</b> {roadWidth || "-"}</p>
        <p><b>Land Type:</b> {landType || "-"}</p>
      </div>

      {/* ===== Building Details ===== */}
      <div className="reviewCard">
        <h4>🏗 Building Details</h4>
        <p><b>Floors:</b> {floors || "-"}</p>
        <p><b>Area:</b> {area || "-"}</p>
        <p><b>Height:</b> {height || "-"}</p>
        <p><b>Front:</b> {front || "-"}</p>
        <p><b>Side:</b> {side || "-"}</p>
        <p><b>Rear:</b> {rear || "-"}</p>
        <p><b>Usage:</b> {usage || "-"}</p>
      </div>

      {/* ===== File Upload ===== */}
<div className="reviewCard">
  <h4>📄 Uploaded File</h4>

  <p><b>File Name:</b> {file?.name || "No file uploaded"}</p>

  <button
    className="previewBtn"
    onClick={() => setShowFilePreview(true)}
    disabled={!filePreviewUrl}
  >
    👁 Preview File
  </button>
</div>

      <div className="reviewNote">
        ⚠️ Once submitted, changes cannot be edited.
      </div>

      <div className="bottomActions">
        <button className="backBtn" onClick={() => setStep(4)}>
          ‹ Back
        </button>

        <button
          className="nextBtn"
          onClick={() => {
            submitApplication();
            setStep(6);
          }}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
   {showFilePreview && (
  <div className="modalOverlay" onClick={() => setShowFilePreview(false)}>
    <div
      className="largeModal previewModal"
      onClick={(e) => e.stopPropagation()}
      style={{ width: "90%", height: "95vh", position: "relative" }}
    >

      {/* 🔥 CLOSE BUTTON INSIDE FILE AREA */}
      <button
        className="previewCloseBtn"
        onClick={() => setShowFilePreview(false)}
      >
        ✖
      </button>

      <div style={{ height: "100%", padding: "10px" }}>
        {file?.type.includes("pdf") ? (
          <iframe
            src={filePreviewUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <img
            src={filePreviewUrl}
            alt="preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </div>

    </div>
  </div>
)}
     
     
            {/* STEP 6 - FINAL RESULT */}
{step === 6 && (
  <>
    <h2 className="sectionTitle">Result</h2>

    <div className="reviewCard" style={{ textAlign: "center" }}>
      {aiResult === "success" ? (
        <>
          <h3 style={{ color: "green" }}>✅ Plan Approved</h3>
        </>
      ) : (
        <>
          <h3 style={{ color: "red" }}>❌ Plan Rejected</h3>
        </>
      )}

      <p>{message}</p>

      {applicationNo && (
        <p>
          Application No: <b>{applicationNo}</b>
        </p>
      )}

      {pdfUrl && (
        <button
          className="nextBtn"
          onClick={() => {
            const link = document.createElement("a");
            link.href = getReportDownloadUrl(pdfUrl);
            link.download = `${applicationNo}.pdf`;
            link.click();
          }}
        >
          ⬇ Download Report
        </button>
      )}
    </div>

    <div className="bottomActions">
      <button className="backBtn" onClick={() => setStep(5)}>
        ‹ Back
      </button>
    </div>
  </>
)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;