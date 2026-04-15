import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
// import mapImage from "../assets/map.jpg";
import "./Navbar.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import { useNavigate } from "react-router-dom";


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
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bpOpen: boolean;
  setBpOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formOpen: boolean;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const Navbar: React.FC<NavbarProps> = ({ open, setOpen, bpOpen, setBpOpen, formOpen, setFormOpen }) => {
  const [type, setType] = useState("");
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [floors, setFloors] = useState("");
  const [area, setArea] = useState("");
  const [height, setHeight] = useState("");
  const [usage, setUsage] = useState("");
  const [front, setFront] = useState("");
  const [side, setSide] = useState("");
  const [rear, setRear] = useState("");
  const [survey, setSurvey] = useState("");
  const [plotArea, setPlotArea] = useState("");
  const [roadWidth, setRoadWidth] = useState("");
  const [landType, setLandType] = useState("");
  const [cadFiles, setCadFiles] = useState<File[]>([]);
  const [result, setResult] = useState<"success" | "failure" | "">("");
  const navigate = useNavigate();
const [showMenu, setShowMenu] = useState(false);


const validateBuilding = () => {
  if (cadFiles.length === 0) {
    setResult("failure");
    return;
  }


  const fileNames = cadFiles.map(file => file.name.toLowerCase());

  const isSuccessFile = fileNames.some(name =>
    name.includes("success") || name.includes("2006")
  );

  const isFailureFile = fileNames.some(name =>
    name.includes("failure") || name.includes("2016")
  );

  if (isSuccessFile) {
    setResult("success");
  } else if (isFailureFile) {
    setResult("failure");
  } else {
    setResult("failure"); // default
  }
};


useEffect(() => {
  if (open || bpOpen || formOpen) {
    document.body.style.overflow = "hidden";  // 🚫 stop background scroll
  } else {
    document.body.style.overflow = "auto";    // ✅ enable again
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [open, bpOpen, formOpen]);

  return (
    <div>
      {/* Top Header */}
      <div className="header">
        <img src={logo} className="logo" />
        <div>
          <h2 className="title">
            Andhra Pradesh Building Permission Approval & Self Certification System
          </h2>
          <h3 className="subtitle">
            (AP-bPASS) GOVERNMENT OF ANDHRA PRADESH
          </h3>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="menuBar">
        <div className="menuItems">
          <button className="navBtn homeIcon" >🏠</button>
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
    onClick={() => setShowMenu(!showMenu)}
  >
    User ▼
  </button>

  {showMenu && (
    <div className="dropdownMenu">

      {/* 🔥 ADMIN PAGE lo unte only USER chupinchu */}
      {location.pathname === "/admin" && (
        <p
          onClick={() => {
            navigate("/Home");
            setShowMenu(false);
          }}
        >
          User 
        </p>
      )}

      {/* 🔥 HOME lo unte only ADMIN chupinchu */}
      {location.pathname === "/Home" && (
        <p
          onClick={() => {
            navigate("/admin");
            setShowMenu(false);
          }}
        >
          Admin 
        </p>
      )}

    </div>
  )}

</div>
      </div>

      <hr />

      {/* Modal */}
      {open && (
        <div className="modalOverlay">
          <div className="modal">
            <div className="modalHeader">
              <h2>Apply For</h2>
              <span className="closeBtn" onClick={() => setOpen(false)}>X</span>
            </div>

            <div className="modalContent">
              <p
                className="active"
                onClick={() => {
                  setOpen(false);
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
              <span className="closeBtn" onClick={() => setBpOpen(false)}>×</span>
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
        <div
          className="modalOverlay"
          onClick={() => {
            setOpen(false);
            setBpOpen(false);
            setFormOpen(false);
          }}
        >
          <div className="formPage" onClick={(e) => e.stopPropagation()}>

            {/* Close Button */}
            <button
              className="closeFormBtn"
              onClick={() => setFormOpen(false)}
            >
              ✖
            </button>
            <div className="stepper">
              <div
                className={`step ${step >= 1 ? "active" : ""}`}
                onClick={() => setStep(1)}
              >
                Applicant Details
              </div>

              <div
                className={`step ${step >= 2 ? "active" : ""}`}
                onClick={() => setStep(2)}
              >
                Plot Details
              </div>

              <div
                className={`step ${step >= 3 ? "active" : ""}`}
                onClick={() => setStep(3)}
              >
                Building Details
              </div>
              <div
                className={`step ${step >= 4 ? "active" : ""}`}
                onClick={() => setStep(4)}
              >
                Upload CAD Designs
              </div>


              <div
                className={`step ${step >= 5 ? "active" : ""}`}
                onClick={() => setStep(5)}
              >
                Review & Submit
              </div>

              <div
                className={`step ${step >= 6 ? "active" : ""}`}
                onClick={() => setStep(6)}
              >
                Result
              </div>
            </div>
            {/* STEP 1 - APPLICANT */}
            {step === 1 && (
              <>
                <h2>Personal Information</h2>

                <div className="formGrid">
                  <input placeholder="Applicant Full Name" />
                  <input placeholder="Relationship" />
                  <input placeholder="Aadhaar Number" />
                  <input placeholder="Mobile Number" />
                  <input placeholder="E-mail ID (optional)" />
                  <input placeholder="Set Password" type="password" />
                  <input placeholder="Confirm Password" type="password" />
                  <textarea placeholder="Complete Postal Address"></textarea>
                </div>

                <button className="saveBtn" onClick={() => setStep(2)}>
                  Save & Continue →
                </button>
              </>
            )}


            {/* STEP 2 - PLOT DETAILS */}
            {step === 2 && (
              <>
                <h2 className="sectionTitle">Plot Details</h2>

                <div className="alertBox">
                  ⚠ Please make sure the plot boundary is correctly selected on the map.
                </div>

                <div className="plotWrapper">

                  {/* LEFT SIDE */}
                  <div className="plotLeft">

                    {/* Survey Number */}
                    <label>Survey Number*</label>
                    <input
                      className="inputBox"
                      value={survey}
                      onChange={(e) => setSurvey(e.target.value)}
                      placeholder="123/4"
                    />
                    {!survey && <span className="errorText">Survey Number is Required</span>}
                    {survey && !/^\d+\/\d+$/.test(survey) && (
                      <span className="errorText">Format should be like 123/4</span>
                    )}

                    {/* District / Mandal / Village */}
                    <div className="threeGrid">
                      <div>
                        <label>District</label>
                        <select className="inputBox">
                          <option>Loading...</option>
                        </select>
                      </div>

                      <div>
                        <label>Mandal</label>
                        <select className="inputBox">
                          <option>Loading...</option>
                        </select>
                      </div>

                      <div>
                        <label>Village</label>
                        <select className="inputBox">
                          <option>Loading...</option>
                        </select>
                      </div>
                    </div>

                    {/* Plot Area + Road Width */}
                    <div className="twoGrid">

                      <div>
                        <label>Plot Area*</label>
                        <div className="inputWithUnit">
                          <input
                            className="inputBox"
                            value={plotArea}
                            onChange={(e) => {
                              if (/^\d*$/.test(e.target.value)) {
                                setPlotArea(e.target.value);
                              }
                            }}
                            placeholder="0"
                          />
                          <span>Sq Yards</span>
                        </div>
                        {!plotArea && <span className="errorText">Plot Area is Required</span>}
                      </div>

                      <div>
                        <label>Road Width*</label>
                        <input
                          className="inputBox"
                          value={roadWidth}
                          onChange={(e) => {
                            if (/^\d*$/.test(e.target.value)) {
                              setRoadWidth(e.target.value);
                            }
                          }}
                          placeholder="0"
                        />
                        {!roadWidth && <span className="errorText">Road Width is Required</span>}
                      </div>

                    </div>

                    {/* Land Type */}
                    <div className="twoGrid">
                      <div>
                        <label>Land Type*</label>
                        <select
                          className="inputBox"
                          value={landType}
                          onChange={(e) => setLandType(e.target.value)}
                        >
                          <option value="">Select</option>
                          <option>Residential</option>
                          <option>Commercial</option>
                        </select>
                        {!landType && <span className="errorText">Land Type is Required</span>}
                      </div>
                    </div>

                  </div>

                  {/* RIGHT SIDE MAP */}
                  <div className="plotRight">
                    <div className="mapBoxReal">
                      <MapComponent />
                    </div>
                  </div>

                </div>

                {/* BUTTONS */}
                <div className="bottomActions">
                  <button className="backBtn" onClick={() => setStep(1)}>‹ Back</button>

                  <button
                    className="nextBtn"
                    onClick={() => {
                      if (
                        survey &&
                        /^\d+\/\d+$/.test(survey) &&
                        plotArea &&
                        roadWidth &&
                        landType
                      ) {
                        setStep(3);
                      }
                    }}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}


            {/* STEP 3 - BUILDING DETAILS */}
            {step === 3 && (
              <>
                <h2 className="sectionTitle">Building Details</h2>

                <div className="plotWrapper">

                  {/* LEFT SIDE */}
                  <div className="plotLeft">

                    {/* Floors */}
                    <label>Number of Floors*</label>
                    <select
                      className="inputBox"
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                    >
                      <option value="">Select</option>
                      <option>G + 0</option>
                      <option>G + 1</option>
                      <option>G + 2</option>
                    </select>
                    {!floors && <span className="errorText">Number of Floors is Required</span>}

                    {/* Built-up Area */}
                    <label>Built-up Area*</label>
                    <div className="inputWithUnit">
                      <input
                        className="inputBox"
                        value={area}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            setArea(e.target.value);
                          }
                        }}
                        placeholder="0"
                      />
                      <span>Sq Yards</span>
                    </div>
                    {!area && <span className="errorText">Built-up Area is Required</span>}

                    {/* Setbacks */}
                    <label>Setbacks*</label>
                    <div className="threeGrid">
                      <input
                        className="inputBox"
                        placeholder="Front (Feet)"
                        value={front}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            setFront(e.target.value);
                          }
                        }}
                      />
                      <input
                        className="inputBox"
                        placeholder="Side (Feet)"
                        value={side}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            setSide(e.target.value);
                          }
                        }}
                      />
                      <input
                        className="inputBox"
                        placeholder="Rear (Feet)"
                        value={rear}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            setRear(e.target.value);
                          }
                        }}
                      />
                    </div>
                    {(!front || !side || !rear) && (
                      <span className="errorText">Setbacks are Required</span>
                    )}

                    {/* Height */}
                    <label>Building Height*</label>
                    <div className="inputWithUnit">
                      <input
                        className="inputBox"
                        value={height}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            setHeight(e.target.value);
                          }
                        }}
                        placeholder="0"
                      />
                      <span>Meters</span>
                    </div>
                    {!height && <span className="errorText">Building Height is Required</span>}

                    {/* Usage */}
                    <label>Usage Type*</label>
                    <select
                      className="inputBox"
                      value={usage}
                      onChange={(e) => setUsage(e.target.value)}
                    >
                      <option value="">Select</option>
                      <option>Residential</option>
                      <option>Commercial</option>
                    </select>
                    {!usage && <span className="errorText">Usage Type is Required</span>}

                  </div>

                  {/* RIGHT SIDE */}
                  <div className="plotRight">
                    <div className="mapBoxReal">
                      <MapComponent />
                    </div>
                  </div>

                </div>

                {/* BUTTONS */}
                <div className="bottomActions">
                  <button className="backBtn" onClick={() => setStep(2)}>‹ Back</button>

                  <button
                    className="nextBtn"
                    onClick={() => {
                      if (
                        floors &&
                        area &&
                        height &&
                        usage &&
                        front &&
                        side &&
                        rear
                      ) {
                        setStep(4);
                      }
                    }}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}


            {/* STEP 4 - CAD UPLOAD */}
            {step === 4 && (
              <>
                <h2 className="sectionTitle">Upload CAD Designs</h2>

                <div className="plotWrapper">

                  {/* LEFT SIDE */}
                  <div className="plotLeft">

                    <div
                      className="uploadBox large"
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = Array.from(e.dataTransfer.files);
                        setCadFiles(files);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <input
                        type="file"
                        multiple
                        accept=".dwg,.dxf,.pdf,.png,.jpg"
                        id="cadUpload"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setCadFiles(files);
                        }}
                      />

                      <label htmlFor="cadUpload" style={{ cursor: "pointer" }}>
                        📐 Drag & drop CAD files here, or <span>Browse</span>
                      </label>

                      <small>
                        Allowed: DWG, DXF, PDF, JPG, PNG (Max 10MB each)
                      </small>

                      {/* FILE LIST */}
                      {cadFiles.length > 0 && (
                        <div className="fileList">
                          {cadFiles.map((file, index) => (
                            <p key={index} style={{ color: "green" }}>
                              ✅ {file.name}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* RIGHT SIDE MAP */}
                  <div className="plotRight">
                    <div className="mapBoxReal">
                      <MapComponent />
                    </div>
                  </div>

                </div>

                {/* BUTTONS */}
                <div className="bottomActions">
                  <button className="backBtn" onClick={() => setStep(3)}>
                    ‹ Back
                  </button>

<button
  className="nextBtn"
  onClick={() => {
    if (cadFiles.length > 0) {
      validateBuilding();   // ✅ your new validation function
      setStep(5);
    }
  }}
>
  Next →
</button>
                </div>
              </>
            )}



            {/* STEP 5 - REVIEW & SUBMIT */}
            {step === 5 && (
              <>
                <h2 className="sectionTitle">Review & Submit</h2>

                <div className="plotWrapper">

                  {/* LEFT SIDE */}
                  <div className="plotLeft">

                    {/* Applicant */}
                    <div className="reviewCard">
                      <div className="reviewHeader">
                        <h4>Applicant Details</h4>
                        <span className="editBtn" onClick={() => setStep(1)}>✏ Edit</span>
                      </div>

                      <p><strong>Applicant Full Name:</strong> ---</p>
                      <p><strong>Relationship:</strong> ---</p>
                      <p><strong>Aadhaar Number:</strong> ---</p>
                    </div>



                    {/* Plot */}
                    <div className="reviewCard">
                      <div className="reviewHeader">
                        <h4>Plot Details</h4>
                        <span className="editBtn" onClick={() => setStep(2)}>✏ Edit</span>
                      </div>

                      <p><strong>Survey Number:</strong> {survey || "-"}</p>
                      <p><strong>Plot Area:</strong> {plotArea || "-"} Sq.Yards</p>
                      <p><strong>Road Width:</strong> {roadWidth || "-"}</p>
                      <p><strong>Land Type:</strong> {landType || "-"}</p>
                    </div>

                    {/* Building */}
                    <div className="reviewCard">
                      <div className="reviewHeader">
                        <h4>Building Details</h4>
                        <span className="editBtn" onClick={() => setStep(3)}>✏ Edit</span>
                      </div>

                      <p><strong>Number of Floors:</strong> {floors || "-"}</p>
                      <p><strong>Built-up Area:</strong> {area || "-"} Sq.Yards</p>
                      <p>
                        <strong>Setbacks:</strong>{" "}
                        Front: {front || "-"} ft, Side: {side || "-"} ft, Rear: {rear || "-"} ft
                      </p>
                      <p><strong>Building Height:</strong> {height || "-"} m</p>
                      <p><strong>Usage Type:</strong> {usage || "-"}</p>
                    </div>

                  </div>

                  {/* RIGHT SIDE */}
                  <div className="plotRight">

                    {/* MAP */}
                    <div className="mapBoxReal">
                      <MapComponent />
                    </div>
                    {/* FILE UPLOAD */}
                    <div
                      className="uploadBox"
                      onDrop={(e) => {
                        e.preventDefault();
                        setFile(e.dataTransfer.files[0]);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <input
                        type="file"
                        id="fileUpload"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) {
                            setFile(selectedFile);
                          }
                        }} />
                      <label htmlFor="fileUpload" style={{ cursor: "pointer" }}>
                        📎 Drag & drop files here, or <span>Browse</span>
                      </label>

                      <small>Allowed PDF, JPG, PNG up to 5MB</small>

                      {file && (
                        <p style={{ marginTop: "10px", color: "green" }}>
                          ✅ {file.name}
                        </p>
                      )}
                    </div>

                  </div>

                </div>


                

                {/* BUTTONS */}
                <div className="bottomActions">
                  <button className="backBtn" onClick={() => setStep(3)}>‹ Back</button>
                  <button
                    className="nextBtn"
                    onClick={() => setStep(6)}
                  >
                    Submit
                  </button>                </div>
              </>
            )}


            {/* STEP 6 - RESULT */}
{step === 6 && (
  <>
    <h2 className="sectionTitle">Result</h2>

    <div className="reviewCard" style={{ textAlign: "center" }}>

     {result === "" ? (
  <>
    <h3 style={{ color: "gray" }}>⚠ No Result Found</h3>
    <p>Please upload CAD files and submit to see result.</p>
  </>
) : result === "success" ? (
  <>
    <h3 style={{ color: "green" }}>✅ Building Permission Approved</h3>
    <p>All CAD validations passed successfully.</p>
  </>
) : (
  <>
    <h3 style={{ color: "red" }}>❌ Building Permission Failed</h3>
    <p>Some rules are not satisfied.</p>
  </>
)}

      {/* DOWNLOAD BUTTON */}
      <button
  className="nextBtn"
  style={{ marginTop: "20px" }}
  disabled={result === ""}
  onClick={() => {
    const link = document.createElement("a");

    if (result === "success") {
      link.href = "/AP-VAASTU-20260327062006 - VAASTU.pdf";
      link.download = "AP-Vaastu-2006.pdf";
    } else {
      link.href = "/AP-VAASTU-20260327062016 - VAASTU.pdf";
      link.download = "AP-Vaastu-2016.pdf";
    }

    link.click();
  }}
>
  📥 Download Compliance Report
</button>

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