import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import "./Navbar.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import { apiPost } from "../Services/api";
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

  const [cadFiles, setCadFiles] = useState<File[]>([]);
  const [result, setResult] = useState<"success" | "failure" | "">("");

  const [showMenu, setShowMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* ===== Dynamic User/Admin Switch ===== */
  const switchLabel =
    location.pathname === "/admin" ? "Admin" : "User";

  const switchOption =
    location.pathname === "/admin"
      ? { label: "User", path: "/Home" }
      : { label: "Admin", path: "/admin" };

  /* ===== Validate CAD ===== */
  const validateBuilding = () => {
    if (cadFiles.length === 0) {
      setResult("failure");
      return;
    }

    const fileNames = cadFiles.map((file) =>
      file.name.toLowerCase()
    );

    const isSuccessFile = fileNames.some(
      (name) => name.includes("success") || name.includes("2006")
    );

    const isFailureFile = fileNames.some(
      (name) => name.includes("failure") || name.includes("2016")
    );

    if (isSuccessFile) {
      setResult("success");
    } else if (isFailureFile) {
      setResult("failure");
    } else {
      setResult("failure");
    }
  };

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
            {step === 4 && (
              <>
                <h2 className="sectionTitle">
                  Upload CAD Designs
                </h2>

                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setCadFiles(
                      Array.from(
                        e.target
                          .files || []
                      )
                    )
                  }
                />

                <div className="bottomActions">
                  <button
                    className="backBtn"
                    onClick={() =>
                      setStep(3)
                    }
                  >
                    ‹ Back
                  </button>

                  <button
                    className="nextBtn"
                    onClick={() => {
                      validateBuilding();
                      setStep(5);
                    }}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <>
                <h2 className="sectionTitle">
                  Review & Submit
                </h2>

                <p>
                  Please review all
                  entered details.
                </p>

                <div className="bottomActions">
                  <button
                    className="backBtn"
                    onClick={() =>
                      setStep(4)
                    }
                  >
                    ‹ Back
                  </button>

  <button
  className="nextBtn"
  onClick={() => {
    submitApplication(); // 🔥 POST call
    setStep(6);
  }}
>
  Submit
</button>
                </div>
              </>
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <>
                <h2 className="sectionTitle">
                  Result
                </h2>

                <div
                  className="reviewCard"
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  {result ===
                  "success" ? (
                    <>
                      <h3
                        style={{
                          color:
                            "green",
                        }}
                      >
                        ✅ Approved
                      </h3>
                      <p>
                        Building
                        Permission
                        Approved
                      </p>
                    </>
                  ) : (
                    <>
                      <h3
                        style={{
                          color:
                            "red",
                        }}
                      >
                        ❌ Failed
                      </h3>
                      <p>
                        Some rules
                        are not
                        satisfied
                      </p>
                    </>
                  )}

                  <button
                    className="nextBtn"
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >
                    📥 Download
                    Report
                  </button>
                </div>

                <div className="bottomActions">
                  <button
                    className="backBtn"
                    onClick={() =>
                      setStep(5)
                    }
                  >
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