import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import "./Navbar.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { LatLngExpression } from "leaflet";
import { useNavigate, useLocation } from "react-router-dom";

import {
  apiPost,
  runAutoDcr,
  getReportDownloadUrl,
} from "../Services/api";

type MapProps = {
  setLatitude: (lat: string) => void;
  setLongitude: (lng: string) => void;
};

const MapComponent: React.FC<MapProps> = ({ setLatitude, setLongitude }) => {
  const [position, setPosition] = useState<LatLngExpression>([17.385, 78.4867]);

  const MapMover = ({ setPosition }: { setPosition: (pos: LatLngExpression) => void }) => {
    const map = useMap();

    useEffect(() => {
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<{ lat: number; lon: number }>;
        const { lat, lon } = customEvent.detail;

        map.setView([lat, lon], 13);
        setPosition([lat, lon]);
      };

      window.addEventListener("moveMap", handler);

      return () => {
        window.removeEventListener("moveMap", handler);
      };
    }, [map, setPosition]);

    return null;
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        setPosition([lat, lng]);
        setLatitude(lat.toString());
        setLongitude(lng.toString());
      },
    });

    return null;
  };

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

      <MapMover setPosition={setPosition} />
      <MapClickHandler />

      <Marker
        position={position}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const latlng = marker.getLatLng();

            setPosition([latlng.lat, latlng.lng]);
            setLatitude(latlng.lat.toString());
            setLongitude(latlng.lng.toString());
          },
        }}
      >
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
  applyOpen: boolean;
  setApplyOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Navbar: React.FC<NavbarProps> = ({
  open,
  bpOpen,
  setBpOpen,
  formOpen,
  setFormOpen,
  applyOpen,
  setApplyOpen,
  fetchApplications,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [type, setType] = useState("");
  const [step, setStep] = useState(1);

  const [applicantName, setApplicantName] = useState("");
  const [survey, setSurvey] = useState("");
  const [plotArea, setPlotArea] = useState("");
  const [roadWidth, setRoadWidth] = useState("");
  const [landType, setLandType] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [floors, setFloors] = useState("");
  const [area, setArea] = useState("");
  const [height, setHeight] = useState("");
  const [front, setFront] = useState("");
  const [side, setSide] = useState("");
  const [rear, setRear] = useState("");
  const [usage, setUsage] = useState("");

  const [showMenu, setShowMenu] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [showFilePreview, setShowFilePreview] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [applicationNo, setApplicationNo] = useState("");
  const [aiResult, setAiResult] = useState<"success" | "failure" | "">("");
  const [message, setMessage] = useState("");
  const [violations, setViolations] = useState<any[]>([]);

  const switchLabel = location.pathname === "/admin" ? "Admin" : "User";

  const switchOption =
    location.pathname === "/admin"
      ? { label: "User", path: "/Home" }
      : { label: "Admin", path: "/admin" };

  const wait = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

  const resetResult = () => {
    setPdfUrl("");
    setApplicationNo("");
    setAiResult("");
    setMessage("");
    setViolations([]);
  };

  useEffect(() => {
    if (open || bpOpen || formOpen || applyOpen || showFilePreview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open, bpOpen, formOpen, applyOpen, showFilePreview]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const searchMapLocation = async () => {
    if (!searchLocation.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchLocation
        )}`
      );

      const data = await res.json();

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
    setType("");
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
    setFilePreviewUrl("");
    setShowFilePreview(false);

    resetResult();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    resetWizard();
  };

  return (
    <div>
      <div className="header">
        <img src={logo} className="logo" alt="logo" />

        <div>
          <h2 className="title">
            Andhra Pradesh Building Permission Approval & Self Certification
            System
          </h2>

          <h3 className="subtitle">
            (AP-bPASS) GOVERNMENT OF ANDHRA PRADESH
          </h3>
        </div>
      </div>

      <div className="menuBar">
        <div className="menuItems">
          <button className="navBtn homeIcon" onClick={() => navigate("/")}>
            🏠
          </button>

          <button className="navBtn">ABOUT AP-bPASS</button>
          <button className="navBtn">INFORMATION ▼</button>
          <button className="navBtn">RESOURCES ▼</button>
          <button className="navBtn">DCR PORTAL</button>
          <button className="navBtn">SEARCH ▼</button>
          <button className="navBtn">COMPLAINTS ▼</button>
          <button className="navBtn">LOGIN ▼</button>
        </div>

        <div className="dropdownWrapper">
          <button
            className="admin-back-btn"
            onClick={() => setShowMenu((prev) => !prev)}
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

      {applyOpen && (
        <div className="modalOverlay">
          <div className="modal">
            <div className="modalHeader">
              <h2>Apply For</h2>

              <span className="closeBtn" onClick={() => setApplyOpen(false)}>
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

      {bpOpen && (
        <div className="modalOverlay">
          <div className="modal largeModal">
            <div className="modalHeader">
              <h2>Building Permission</h2>

              <span className="closeBtn" onClick={() => setBpOpen(false)}>
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
                  onChange={() => setType("additional")}
                />
                <label htmlFor="additional">Additional</label>

                <input
                  type="radio"
                  id="revision"
                  name="type"
                  onChange={() => setType("revision")}
                />
                <label htmlFor="revision">Revision</label>
              </div>

              <button
                className="goBtn"
                onClick={() => {
                  if (type === "new") {
                    setBpOpen(false);
                    setFormOpen(true);
                  } else {
                    alert("Please select New to continue");
                  }
                }}
              >
                GO →
              </button>
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="modalOverlay">
          <div className="formPage" onClick={(e) => e.stopPropagation()}>
            <button className="closeFormBtn" onClick={closeForm}>
              ✖
            </button>

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
                  className={`step ${step >= index + 1 ? "active" : ""}`}
                  onClick={() => {
                    if (!loading) {
                      setStep(index + 1);
                    }
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

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
                  <input placeholder="Password" type="password" />
                  <input placeholder="Confirm Password" type="password" />
                  <textarea placeholder="Address" />
                </div>

                <button className="saveBtn" onClick={() => setStep(2)}>
                  Save & Continue →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="sectionTitle">Plot Details</h2>

                <input
                  className="inputBox"
                  value={survey}
                  onChange={(e) => setSurvey(e.target.value)}
                  placeholder="Survey Number"
                />

                <input
                  className="inputBox"
                  value={plotArea}
                  onChange={(e) => setPlotArea(e.target.value)}
                  placeholder="Plot Area"
                />

                <input
                  className="inputBox"
                  value={roadWidth}
                  onChange={(e) => setRoadWidth(e.target.value)}
                  placeholder="Road Width"
                />

                <select
                  className="inputBox"
                  value={landType}
                  onChange={(e) => setLandType(e.target.value)}
                >
                  <option value="">Select Land Type</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                </select>

                <div className="searchContainer">
                  <input
                    className="inputBox searchInput"
                    placeholder="Search Location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />

                  <button className="searchBtn" onClick={searchMapLocation}>
                    Search
                  </button>
                </div>

                <div className="latLngRow">
                  <div className="fieldGroup">
                    <label>Latitude</label>
                    <input className="inputBox" value={latitude} readOnly />
                  </div>

                  <div className="fieldGroup">
                    <label>Longitude</label>
                    <input className="inputBox" value={longitude} readOnly />
                  </div>
                </div>

                <div className="mapBoxReal">
                  <MapComponent
                    setLatitude={setLatitude}
                    setLongitude={setLongitude}
                  />
                </div>

                <div className="bottomActions">
                  <button className="backBtn" onClick={() => setStep(1)}>
                    ‹ Back
                  </button>

                  <button className="nextBtn" onClick={() => setStep(3)}>
                    Next →
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="sectionTitle">Building Details</h2>

                <input
                  className="inputBox"
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  placeholder="Floors"
                />

                <input
                  className="inputBox"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area"
                />

                <input
                  className="inputBox"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Height"
                />

                <input
                  className="inputBox"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Front Setback"
                />

                <input
                  className="inputBox"
                  value={side}
                  onChange={(e) => setSide(e.target.value)}
                  placeholder="Side Setback"
                />

                <input
                  className="inputBox"
                  value={rear}
                  onChange={(e) => setRear(e.target.value)}
                  placeholder="Rear Setback"
                />

                <select
                  className="inputBox"
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                >
                  <option value="">Usage Type</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                </select>

                <div className="bottomActions">
                  <button className="backBtn" onClick={() => setStep(2)}>
                    ‹ Back
                  </button>

                  <button className="nextBtn" onClick={() => setStep(4)}>
                    Next →
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="sectionTitle">Upload CAD Designs</h2>

                <div className="upload-section wizard-upload-section">
                  <div className="upload-area-wrapper">
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

                              if (filePreviewUrl) {
                                URL.revokeObjectURL(filePreviewUrl);
                              }

                              setFilePreviewUrl(URL.createObjectURL(selected));
                              resetResult();
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
                    </div>
                  </div>
                </div>

                <div className="bottomActions">
                  <button className="backBtn" onClick={() => setStep(3)}>
                    ‹ Back
                  </button>

                  <button className="nextBtn" onClick={() => setStep(5)}>
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

                  <div className="reviewCard">
                    <h4>👤 Applicant Details</h4>
                    <p>
                      <b>Name:</b> {applicantName || "-"}
                    </p>
                  </div>

                  <div className="reviewCard">
                    <h4>📍 Plot Details</h4>
                    <p>
                      <b>Survey No:</b> {survey || "-"}
                    </p>
                    <p>
                      <b>Plot Area:</b> {plotArea || "-"}
                    </p>
                    <p>
                      <b>Road Width:</b> {roadWidth || "-"}
                    </p>
                    <p>
                      <b>Land Type:</b> {landType || "-"}
                    </p>
                    <p>
                      <b>Latitude:</b> {latitude || "-"}
                    </p>
                    <p>
                      <b>Longitude:</b> {longitude || "-"}
                    </p>
                  </div>

                  <div className="reviewCard">
                    <h4>🏗 Building Details</h4>
                    <p>
                      <b>Floors:</b> {floors || "-"}
                    </p>
                    <p>
                      <b>Area:</b> {area || "-"}
                    </p>
                    <p>
                      <b>Height:</b> {height || "-"}
                    </p>
                    <p>
                      <b>Front:</b> {front || "-"}
                    </p>
                    <p>
                      <b>Side:</b> {side || "-"}
                    </p>
                    <p>
                      <b>Rear:</b> {rear || "-"}
                    </p>
                    <p>
                      <b>Usage:</b> {usage || "-"}
                    </p>
                  </div>

                  <div className="reviewCard">
                    <h4>📄 Uploaded File</h4>

                    <p>
                      <b>File Name:</b> {file?.name || "No file uploaded"}
                    </p>

                    <button
                      className="previewBtn"
                      onClick={() => setShowFilePreview(true)}
                      disabled={!filePreviewUrl}
                    >
                      👁 Preview File
                    </button>
                  </div>

                  <div className="reviewNote">
                    ⚠️ On submit, application will be saved and Auto-DCR scrutiny
                    will run automatically.
                  </div>

                  <div className="bottomActions">
                    <button className="backBtn" onClick={() => setStep(4)}>
                      ‹ Back
                    </button>

                    <button className="nextBtn" onClick={submitAndRunAutoDcr}>
                      Submit & Run Auto-DCR →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showFilePreview && (
              <div
                className="modalOverlay"
                onClick={() => setShowFilePreview(false)}
              >
                <div
                  className="largeModal previewModal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="previewCloseBtn"
                    onClick={() => setShowFilePreview(false)}
                  >
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
                      <img
                        src={filePreviewUrl}
                        alt="preview"
                        className="previewImage"
                      />
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
            )}

            {step === 6 && (
              <>
                <div className="result-wrapper">
                  {loading && (
                    <div className="result-loader-card">
                      <div className="floorplan-loader">
                        <div className="floorplan-card">
                          <div className="floorplan-grid"></div>

                          <div className="floorplan-boundary">
                            <div className="floorplan-garden"></div>

                            <div className="floorplan-room living"></div>
                            <div className="floorplan-room kitchen"></div>
                            <div className="floorplan-room bedroom-one"></div>
                            <div className="floorplan-room bedroom-two"></div>
                            <div className="floorplan-room toilet-one"></div>
                            <div className="floorplan-room toilet-two"></div>
                            <div className="floorplan-room lobby"></div>
                            <div className="floorplan-room stairs"></div>

                            <div className="floorplan-door door-one"></div>
                            <div className="floorplan-door door-two"></div>
                            <div className="floorplan-door door-three"></div>

                            <span className="scan-target target-one"></span>
                            <span className="scan-target target-two"></span>
                            <span className="scan-target target-three"></span>
                          </div>

                          <div className="floorplan-scan-band"></div>
                          <div className="floorplan-scan-line"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!loading && aiResult !== "" && (
                    <div className={`result-card ${aiResult}`}>
                      <div className="result-left">
                        <div className={`result-icon ${aiResult}`}>
                          {aiResult === "success" ? "✔" : "✖"}
                        </div>

                        <div>
                          <h3 className="result-title">
                            {aiResult === "success"
                              ? "Plan Approved"
                              : "Plan Rejected"}
                          </h3>

                          <p className="result-message">{message}</p>

                          {applicationNo && (
                            <p className="application-no">
                              Application No: <strong>{applicationNo}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {pdfUrl && (
                        <button
                          type="button"
                          className="download-btn"
                          onClick={downloadReport}
                        >
                          ⬇ Download Compliance PDF
                        </button>
                      )}
                    </div>
                  )}

                  {!loading && violations.length > 0 && (
                    <div className="violation-list">
                      <h3>Compliance Violations</h3>

                      {violations.map((item, index) => (
                        <div
                          className="violation-item"
                          key={`${item.rule}-${index}`}
                        >
                          <strong>{item.rule}</strong>
                          <p>{item.message}</p>
                          <span>
                            Required: {item.required} | Found: {item.found}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!loading && (
                  <div className="bottomActions">
                    <button className="backBtn" onClick={() => setStep(5)}>
                      ‹ Back
                    </button>

                    <button className="nextBtn" onClick={closeForm}>
                      Finish
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;