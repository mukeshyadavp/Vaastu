import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import "./Navbar.css";
import "leaflet/dist/leaflet.css";
 
/// ✅ FIXED MAP COMPONENT (Vercel-safe)
const MapComponent = () => {
  const [Leaflet, setLeaflet] = useState<any>(null);
  const position: [number, number] = [17.385, 78.4867];

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      setLeaflet(mod);
    });
  }, []);

  if (!Leaflet) return <div>Loading map...</div>;

  const { MapContainer, TileLayer, Marker, Popup } = Leaflet;

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={position}>
        <Popup>Selected Location</Popup>
      </Marker>
    </MapContainer>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [bpOpen, setBpOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
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

  return (
    <div>
      {/* HEADER */}
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

      {/* MENU */}
      <div className="menuBar">
        <div className="menuItems">
          <button className="navBtn">🏠</button>
          <button className="navBtn">ABOUT AP-bPASS</button>
          <button className="navBtn">INFORMATION ▼</button>
          <button className="navBtn">RESOURCES ▼</button>
          <button className="navBtn">DCR PORTAL</button>
          <button className="navBtn">SEARCH ▼</button>
          <button className="navBtn">COMPLAINTS ▼</button>
          <button className="navBtn">LOGIN ▼</button>
        </div>

        <button className="applyBtn" onClick={() => setOpen(true)}>
          APPLY NOW ▼
        </button>
      </div>

      <hr />

      {/* APPLY MODAL */}
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

      {/* BUILDING PERMISSION */}
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
                <label><input type="radio" onChange={() => setType("new")} /> New</label>
                <label><input type="radio" onChange={() => setType("additional")} /> Additional</label>
                <label><input type="radio" onChange={() => setType("revision")} /> Revision</label>
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

      {/* FORM */}
      {formOpen && (
        <div className="modalOverlay" onClick={() => setFormOpen(false)}>
          <div className="formPage" onClick={(e) => e.stopPropagation()}>

            <button className="closeFormBtn" onClick={() => setFormOpen(false)}>✖</button>

            {/* STEPPER */}
            <div className="stepper">
              {["Applicant Details", "Plot Details", "Building Details", "Review & Submit"].map((label, i) => (
                <div
                  key={i}
                  className={`step ${step >= i + 1 ? "active" : ""}`}
                  onClick={() => setStep(i + 1)}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* STEP 2 (map visible example) */}
            {step === 2 && (
              <>
                <h2>Plot Details</h2>

                <div className="plotWrapper">
                  <div className="plotLeft">
                    <input
                      value={survey}
                      onChange={(e) => setSurvey(e.target.value)}
                      placeholder="Survey Number"
                    />
                  </div>

                  <div className="plotRight">
                    <div className="mapBoxReal">
                      <MapComponent />
                    </div>
                  </div>
                </div>

                <button onClick={() => setStep(3)}>Next →</button>
              </>
            )}

            {/* STEP 4 FILE UPLOAD FIX */}
            {step === 4 && (
              <>
                <h2>Review & Submit</h2>

                <div
                  className="uploadBox"
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length > 0) {
                      setFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />

                  <p>Upload file</p>

                  {file && <p>{file.name}</p>}
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