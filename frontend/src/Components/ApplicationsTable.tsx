import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  Eye,
  FileText,
  MapPin,
  Pencil,
  User,
  X,
} from "lucide-react";
import { getReportDownloadUrl } from "../Services";
import "./ApplicationsTable.css";

export type Application = {
  id: number;

  name?: string;
  applicantName?: string;
  fatherName?: string | null;
  mobile?: string | null;
  email?: string | null;

  location?: string;
  address?: string | null;
  surveyNo?: string;
  plotSize?: string;
  plotArea?: string;
  landType?: string;

  buildingType?: string;
  floors?: string | number;
  builtupArea?: string;
  height?: string | number;

  roadWidth?: string;
  frontSetback?: string;
  sideSetback?: string;
  rearSetback?: string;

  latitude?: number | string | null;
  longitude?: number | string | null;

  status?: string;
  remarks?: string | null;

  file?: string;
  fileName?: string;
  filename?: string;
  fileUrl?: string;
  documentUrl?: string;
  uploadedFile?: string;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: any;
};

type Props = {
  data: Application[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onUpdate?: (id: number, payload: FormData) => Promise<void> | void;
};

type ModalTab = "applicant" | "plot" | "building" | "review";

const getAppName = (app: Application) =>
  app.applicantName || app.name || `Application ${app.id}`;

const getFileName = (app: Application) =>
  app.fileName || app.filename || app.file || app.uploadedFile || "";

const getRawFileUrl = (app: Application) =>
  app.fileUrl || app.documentUrl || app.uploadedFile || app.file || "";

const getFileUrl = (app: Application) => {
  const rawUrl = getRawFileUrl(app);

  if (!rawUrl) return "";

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  return getReportDownloadUrl(rawUrl);
};

const normalizeValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const ApplicationsTable = ({
  data = [],
  onApprove,
  onReject,
  onUpdate,
}: Props) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [viewTab, setViewTab] = useState<ModalTab>("applicant");
  const [editTab, setEditTab] = useState<ModalTab>("applicant");

  const itemsPerPage = 4;

  const filteredData = useMemo(() => {
    return data.filter((app) => {
      const value = search.toLowerCase();

      return (
        getAppName(app).toLowerCase().includes(value) ||
        normalizeValue(app.location).toLowerCase().includes(value) ||
        normalizeValue(app.status).toLowerCase().includes(value) ||
        normalizeValue(app.surveyNo).toLowerCase().includes(value) ||
        normalizeValue(app.buildingType).toLowerCase().includes(value) ||
        String(app.id).includes(value)
      );
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  const getStatusClass = (status = "") => {
    const value = status.toLowerCase();

    if (value === "approved") return "approved";
    if (value === "pending") return "pending";
    if (value === "rejected" || value === "violation") return "rejected";

    return "default";
  };

  const handleEditChange = (field: keyof Application, value: string) => {
    if (!editApp) return;

    setEditApp({
      ...editApp,
      [field]: value,
    });
  };

  const appendValue = (formData: FormData, key: string, value: unknown) => {
    formData.append(
      key,
      value === null || value === undefined ? "" : String(value)
    );
  };

  const handleSave = async () => {
    if (!editApp) return;

    const formData = new FormData();

    appendValue(
      formData,
      "applicantName",
      editApp.applicantName || editApp.name || ""
    );
    appendValue(formData, "name", editApp.name || editApp.applicantName || "");

    appendValue(formData, "fatherName", editApp.fatherName || "");
    appendValue(formData, "mobile", editApp.mobile || "");
    appendValue(formData, "email", editApp.email || "");

    appendValue(formData, "location", editApp.location || "");
    appendValue(formData, "address", editApp.address || "");
    appendValue(formData, "surveyNo", editApp.surveyNo || "");
    appendValue(formData, "plotSize", editApp.plotSize || "");
    appendValue(formData, "plotArea", editApp.plotArea || "");
    appendValue(formData, "landType", editApp.landType || "");

    appendValue(formData, "buildingType", editApp.buildingType || "");
    appendValue(formData, "floors", editApp.floors || "");
    appendValue(formData, "builtupArea", editApp.builtupArea || "");
    appendValue(formData, "height", editApp.height || "");

    appendValue(formData, "roadWidth", editApp.roadWidth || "");
    appendValue(formData, "frontSetback", editApp.frontSetback || "");
    appendValue(formData, "sideSetback", editApp.sideSetback || "");
    appendValue(formData, "rearSetback", editApp.rearSetback || "");

    appendValue(formData, "latitude", editApp.latitude || "");
    appendValue(formData, "longitude", editApp.longitude || "");

    appendValue(formData, "status", editApp.status || "Pending");
    appendValue(formData, "remarks", editApp.remarks || "");

    if (editFile) {
      formData.append("file", editFile);
    }

    try {
      setSaving(true);

      if (onUpdate) {
        await onUpdate(editApp.id, formData);
      } else {
        console.warn("onUpdate prop missing. Connect update API in parent.");
      }

      setEditApp(null);
      setEditFile(null);
    } catch (error) {
      console.error("Application update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const openView = (app: Application) => {
    setSelectedApp(app);
    setViewTab("applicant");
  };

  const openEdit = (app: Application) => {
    setEditApp({ ...app });
    setEditFile(null);
    setEditTab("applicant");
  };

  const getTabHeading = (tab: ModalTab) => {
    switch (tab) {
      case "applicant":
        return "Personal Information";
      case "plot":
        return "Plot Information";
      case "building":
        return "Building Information";
      case "review":
        return "Review & File Information";
      default:
        return "";
    }
  };

  return (
    <div className="applications-card">
      <div className="table-topbar">
        <div>
          <h2 className="table-title">Applications</h2>
          <p className="table-subtitle">
            Manage application reviews, uploaded files, and building details
          </p>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search name, location, survey no, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Applicant</th>
              <th>Location</th>
              <th>Survey No</th>
              <th>Plot Area</th>
              <th>Building</th>
              <th>Status</th>
              <th>File</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((app) => {
                const appName = getAppName(app);

                return (
                  <tr key={app.id}>
                    <td>
                      <span className="id-badge">#{app.id}</span>
                    </td>

                    <td>
                      <div className="name-cell">
                        <div className="avatar-circle">
                          {appName.charAt(0).toUpperCase()}
                        </div>

                        <div className="name-stack">
                          <strong>{appName}</strong>
                          <small>{normalizeValue(app.email)}</small>
                        </div>
                      </div>
                    </td>

                    <td>{normalizeValue(app.location)}</td>
                    <td>{normalizeValue(app.surveyNo)}</td>
                    <td>{normalizeValue(app.plotArea || app.plotSize)}</td>

                    <td>
                      <div className="mini-stack">
                        <span>{normalizeValue(app.buildingType)}</span>
                        <small>{normalizeValue(app.floors)} floors</small>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(app.status)}`}
                      >
                        {app.status || "Pending"}
                      </span>
                    </td>

                    <td>
                      {getFileUrl(app) ? (
                        <a
                          href={getFileUrl(app)}
                          target="_blank"
                          rel="noreferrer"
                          className="table-file-link"
                          title={getFileName(app)}
                        >
                          <FileText size={15} />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-btn approve"
                          onClick={() => onApprove(app.id)}
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>

                        <button
                          className="icon-btn reject"
                          onClick={() => onReject(app.id)}
                          title="Reject"
                        >
                          <X size={16} />
                        </button>

                        <button
                          className="icon-btn view"
                          onClick={() => openView(app)}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="icon-btn edit"
                          onClick={() => openEdit(app)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">No applications found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="page-btn"
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <div className="page-info">
          Page <span>{currentPage}</span> of <span>{totalPages}</span>
        </div>

        <button
          className="page-btn"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* VIEW MODAL */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div
            className="modal modal-approval-style"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-topbar">
              <div className="modal-meta">
                <div className="modal-app-id">Application #{selectedApp.id}</div>

                <div className="modal-app-name">{getAppName(selectedApp)}</div>

                <div className="modal-app-subtext">
                  {normalizeValue(selectedApp.location)} ·{" "}
                  {normalizeValue(selectedApp.latitude)},{" "}
                  {normalizeValue(selectedApp.longitude)}
                </div>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedApp(null)}
              >
                <X size={24} />
              </button>
            </div>

            <ModalTabs activeTab={viewTab} setActiveTab={setViewTab} />

            <div className="modal-content-area">
              <div className="section-heading-row">
                <h3 className="section-heading">{getTabHeading(viewTab)}</h3>

                <span
                  className={`status-badge ${getStatusClass(
                    selectedApp.status
                  )}`}
                >
                  {selectedApp.status || "Pending"}
                </span>
              </div>

              {viewTab === "applicant" && (
                <div className="details-grid">
                  <Info
                    label="Applicant Full Name"
                    value={getAppName(selectedApp)}
                  />
                  <Info
                    label="Relationship / Father Name"
                    value={selectedApp.fatherName}
                  />
                  <Info label="Mobile Number" value={selectedApp.mobile} />
                  <Info label="E-mail ID" value={selectedApp.email} />
                  <Info
                    label="Application Status"
                    value={selectedApp.status || "Pending"}
                  />
                </div>
              )}

              {viewTab === "plot" && (
                <div className="details-grid">
                  <Info label="Location" value={selectedApp.location} />
                  <Info label="Land Type" value={selectedApp.landType} />
                  <Info label="Survey Number" value={selectedApp.surveyNo} />
                  <Info label="Plot Size" value={selectedApp.plotSize} />
                  <Info label="Plot Area" value={selectedApp.plotArea} />
                  <Info label="Latitude" value={selectedApp.latitude} />
                  <Info label="Longitude" value={selectedApp.longitude} />
                  <Info label="Address" value={selectedApp.address} full />
                </div>
              )}

              {viewTab === "building" && (
                <div className="details-grid">
                  <Info label="Building Type" value={selectedApp.buildingType} />
                  <Info label="Floors" value={selectedApp.floors} />
                  <Info label="Built-up Area" value={selectedApp.builtupArea} />
                  <Info label="Height" value={selectedApp.height} />
                  <Info label="Road Width" value={selectedApp.roadWidth} />
                  <Info
                    label="Front Setback"
                    value={selectedApp.frontSetback}
                  />
                  <Info label="Side Setback" value={selectedApp.sideSetback} />
                  <Info label="Rear Setback" value={selectedApp.rearSetback} />
                </div>
              )}

              {viewTab === "review" && (
                <div className="details-grid">
                  <Info label="Remarks" value={selectedApp.remarks} full />

                  <div className="info-card info-card-full">
                    <span>Uploaded CAD Designs / File</span>

                    {getFileUrl(selectedApp) ? (
                      <a
                        href={getFileUrl(selectedApp)}
                        target="_blank"
                        rel="noreferrer"
                        className="file-preview-card"
                      >
                        <FileText size={20} />

                        <div>
                          <strong>
                            {getFileName(selectedApp) || "View uploaded file"}
                          </strong>
                          <small>Open file in new tab</small>
                        </div>
                      </a>
                    ) : (
                      <strong>-</strong>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="footer-btn footer-btn-secondary"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editApp && (
        <div className="modal-overlay" onClick={() => setEditApp(null)}>
          <div
            className="modal modal-approval-style"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-topbar">
              <div className="modal-meta">
                <div className="modal-app-id">Edit Application #{editApp.id}</div>

                <div className="modal-app-name">{getAppName(editApp)}</div>

                <div className="modal-app-subtext">
                  Update application, plot, building and file details
                </div>
              </div>

              <button className="modal-close" onClick={() => setEditApp(null)}>
                <X size={24} />
              </button>
            </div>

            <ModalTabs activeTab={editTab} setActiveTab={setEditTab} />

            <div className="modal-content-area">
              <div className="section-heading-row">
                <h3 className="section-heading">{getTabHeading(editTab)}</h3>

                <div className="edit-status-select-wrap">
                  <label>Status</label>

                  <select
                    value={editApp.status || "Pending"}
                    onChange={(e) => handleEditChange("status", e.target.value)}
                    className="mini-status-select"
                  >
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>Violation</option>
                  </select>
                </div>
              </div>

              {editTab === "applicant" && (
                <div className="form-grid">
                  <Field
                    label="Applicant Full Name"
                    value={editApp.applicantName || editApp.name || ""}
                    onChange={(value) => {
                      handleEditChange("applicantName", value);
                      handleEditChange("name", value);
                    }}
                  />

                  <Field
                    label="Relationship / Father Name"
                    value={editApp.fatherName || ""}
                    onChange={(value) => handleEditChange("fatherName", value)}
                  />

                  <Field
                    label="Mobile Number"
                    value={editApp.mobile || ""}
                    onChange={(value) => handleEditChange("mobile", value)}
                  />

                  <Field
                    label="E-mail ID"
                    type="email"
                    value={editApp.email || ""}
                    onChange={(value) => handleEditChange("email", value)}
                  />
                </div>
              )}

              {editTab === "plot" && (
                <div className="form-grid">
                  <Field
                    label="Location"
                    value={editApp.location || ""}
                    onChange={(value) => handleEditChange("location", value)}
                  />

                  <Field
                    label="Land Type"
                    value={editApp.landType || ""}
                    onChange={(value) => handleEditChange("landType", value)}
                  />

                  <Field
                    label="Survey Number"
                    value={editApp.surveyNo || ""}
                    onChange={(value) => handleEditChange("surveyNo", value)}
                  />

                  <Field
                    label="Plot Size"
                    value={editApp.plotSize || ""}
                    onChange={(value) => handleEditChange("plotSize", value)}
                  />

                  <Field
                    label="Plot Area"
                    value={editApp.plotArea || ""}
                    onChange={(value) => handleEditChange("plotArea", value)}
                  />

                  <Field
                    label="Latitude"
                    type="number"
                    value={editApp.latitude || ""}
                    onChange={(value) => handleEditChange("latitude", value)}
                  />

                  <Field
                    label="Longitude"
                    type="number"
                    value={editApp.longitude || ""}
                    onChange={(value) => handleEditChange("longitude", value)}
                  />

                  <Field
                    label="Address"
                    value={editApp.address || ""}
                    onChange={(value) => handleEditChange("address", value)}
                    full
                  />
                </div>
              )}

              {editTab === "building" && (
                <div className="form-grid">
                  <Field
                    label="Building Type"
                    value={editApp.buildingType || ""}
                    onChange={(value) => handleEditChange("buildingType", value)}
                  />

                  <Field
                    label="Floors"
                    type="number"
                    value={editApp.floors || ""}
                    onChange={(value) => handleEditChange("floors", value)}
                  />

                  <Field
                    label="Built-up Area"
                    value={editApp.builtupArea || ""}
                    onChange={(value) => handleEditChange("builtupArea", value)}
                  />

                  <Field
                    label="Height"
                    type="number"
                    value={editApp.height || ""}
                    onChange={(value) => handleEditChange("height", value)}
                  />

                  <Field
                    label="Road Width"
                    value={editApp.roadWidth || ""}
                    onChange={(value) => handleEditChange("roadWidth", value)}
                  />

                  <Field
                    label="Front Setback"
                    value={editApp.frontSetback || ""}
                    onChange={(value) => handleEditChange("frontSetback", value)}
                  />

                  <Field
                    label="Side Setback"
                    value={editApp.sideSetback || ""}
                    onChange={(value) => handleEditChange("sideSetback", value)}
                  />

                  <Field
                    label="Rear Setback"
                    value={editApp.rearSetback || ""}
                    onChange={(value) => handleEditChange("rearSetback", value)}
                  />
                </div>
              )}

              {editTab === "review" && (
                <div className="form-grid">
                  <Field
                    label="Remarks"
                    value={editApp.remarks || ""}
                    onChange={(value) => handleEditChange("remarks", value)}
                    full
                  />

                  <div className="form-group form-group-full">
                    <label>Uploaded CAD Designs / File</label>

                    {getFileUrl(editApp) && (
                      <a
                        href={getFileUrl(editApp)}
                        target="_blank"
                        rel="noreferrer"
                        className="existing-file"
                      >
                        <FileText size={16} />
                        {getFileName(editApp) || "View current file"}
                      </a>
                    )}

                    <label className="file-upload-box">
                      <FileText size={18} />
                      <span>
                        {editFile
                          ? editFile.name
                          : "Choose a new file to replace current file"}
                      </span>

                      <input
                        type="file"
                        onChange={(e) =>
                          setEditFile(e.target.files?.[0] || null)
                        }
                      />
                    </label>

                    {editFile && (
                      <small className="selected-file-name">
                        New file selected: {editFile.name}
                      </small>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="footer-btn footer-btn-secondary"
                onClick={() => {
                  setEditApp(null);
                  setEditFile(null);
                }}
              >
                Cancel
              </button>

              <button
                className="footer-btn footer-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type ModalTabsProps = {
  activeTab: ModalTab;
  setActiveTab: (tab: ModalTab) => void;
};

const ModalTabs = ({ activeTab, setActiveTab }: ModalTabsProps) => {
  const tabs = [
    {
      key: "applicant" as ModalTab,
      label: "Applicant Details",
      icon: <User size={15} />,
    },
    {
      key: "plot" as ModalTab,
      label: "Plot Details",
      icon: <MapPin size={15} />,
    },
    {
      key: "building" as ModalTab,
      label: "Building Details",
      icon: <Building2 size={15} />,
    },
    {
      key: "review" as ModalTab,
      label: "Review & Submit",
      icon: <FileText size={15} />,
    },
  ];

  return (
    <div className="approval-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`approval-tab ${activeTab === tab.key ? "active" : ""}`}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

type InfoProps = {
  label: string;
  value: unknown;
  full?: boolean;
};

const Info = ({ label, value, full }: InfoProps) => {
  return (
    <div className={`info-card ${full ? "info-card-full" : ""}`}>
      <span>{label}</span>
      <strong>{normalizeValue(value)}</strong>
    </div>
  );
};

type FieldProps = {
  label: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  type?: string;
  full?: boolean;
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  full,
}: FieldProps) => {
  const isTextarea = label.toLowerCase().includes("address");

  return (
    <div className={`form-group ${full ? "form-group-full" : ""}`}>
      <label>{label}</label>

      {isTextarea ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default ApplicationsTable;