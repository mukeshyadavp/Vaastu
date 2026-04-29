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
  onApprove: (id: number) => Promise<void> | void;
  onReject: (id: number) => Promise<void> | void;
  onUpdate?: (id: number, payload: FormData) => Promise<void> | void;
};

type ModalTab = "applicant" | "plot" | "building" | "review";
type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string;
  type: ToastType;
} | null;

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

const truncateText = (value: unknown, limit = 34) => {
  const text = normalizeValue(value);

  if (text === "-") return text;

  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
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
  const [toast, setToast] = useState<ToastState>(null);

  const itemsPerPage = 5;

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });

    window.setTimeout(() => {
      setToast(null);
    }, 2800);
  };

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

  const handleApprove = async (id: number) => {
    try {
      await Promise.resolve(onApprove(id));
      showToast(`Application #${id} approved successfully.`, "success");
    } catch (error) {
      console.error("Approve failed:", error);
      showToast(`Failed to approve Application #${id}.`, "error");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await Promise.resolve(onReject(id));
      showToast(`Application #${id} rejected successfully.`, "success");
    } catch (error) {
      console.error("Reject failed:", error);
      showToast(`Failed to reject Application #${id}.`, "error");
    }
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
        showToast(`Application #${editApp.id} updated successfully.`, "success");
      } else {
        showToast("Update API is not connected.", "error");
        return;
      }

      setEditApp(null);
      setEditFile(null);
    } catch (error) {
      console.error("Application update failed:", error);
      showToast(`Failed to update Application #${editApp.id}.`, "error");
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
                      <span className="id-badge">{app.id}</span>
                    </td>

                    <td>
                      <div className="name-cell">
                        <div className="avatar-circle">
                          {appName.charAt(0).toUpperCase()}
                        </div>

                        <div className="name-stack">
                          <strong>
                            <TruncatedCell value={appName} limit={22} inline />
                          </strong>
                          <small>
                            <TruncatedCell value={app.email} limit={24} inline />
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <TruncatedCell value={app.location} limit={25} />
                    </td>

                    <td>
                      <TruncatedCell value={app.surveyNo} limit={18} />
                    </td>

                    <td>
                      <TruncatedCell
                        value={app.plotArea || app.plotSize}
                        limit={18}
                      />
                    </td>

                    <td>
                      <div className="mini-stack">
                        <TruncatedCell
                          value={app.buildingType}
                          limit={18}
                          inline
                        />
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
                          onClick={() => handleApprove(app.id)}
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>

                        <button
                          className="icon-btn reject"
                          onClick={() => handleReject(app.id)}
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
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <div className="page-info">
          Page <span>{currentPage}</span> of <span>{totalPages}</span>
        </div>

        <button
          className="page-btn"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {selectedApp && (
        <ApplicationViewModal
          app={selectedApp}
          tab={viewTab}
          setTab={setViewTab}
          getStatusClass={getStatusClass}
          getTabHeading={getTabHeading}
          onClose={() => setSelectedApp(null)}
        />
      )}

      {editApp && (
        <ApplicationEditModal
          app={editApp}
          tab={editTab}
          setTab={setEditTab}
          editFile={editFile}
          saving={saving}
          getTabHeading={getTabHeading}
          onChange={handleEditChange}
          onFileChange={setEditFile}
          onSave={handleSave}
          onClose={() => {
            setEditApp(null);
            setEditFile(null);
          }}
        />
      )}

      {toast && (
        <div className={`toast-popup ${toast.type}`} role="status">
          <span className="toast-dot" />
          <p>{toast.message}</p>
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

type FieldInputProps = {
  label: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  type?: string;
  full?: boolean;
};

const FieldInput = ({
  label,
  value,
  onChange,
  type = "text",
  full,
}: FieldInputProps) => {
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

type TruncatedCellProps = {
  value: unknown;
  limit?: number;
  inline?: boolean;
};

const TruncatedCell = ({ value, limit = 34, inline }: TruncatedCellProps) => {
  const text = normalizeValue(value);
  const isLong = text.length > limit;

  return (
    <span className={`cell-tooltip-wrap ${inline ? "cell-tooltip-inline" : ""}`}>
      <span className="cell-ellipsis">{truncateText(text, limit)}</span>

      {isLong && <span className="cell-tooltip">{text}</span>}
    </span>
  );
};

type ApplicationViewModalProps = {
  app: Application;
  tab: ModalTab;
  setTab: (tab: ModalTab) => void;
  getStatusClass: (status?: string) => string;
  getTabHeading: (tab: ModalTab) => string;
  onClose: () => void;
};

const ApplicationViewModal = ({
  app,
  tab,
  setTab,
  getStatusClass,
  getTabHeading,
  onClose,
}: ApplicationViewModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-approval-style"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-topbar">
          <div className="modal-meta">
            <div className="modal-app-id">Application #{app.id}</div>
            <div className="modal-app-name">{getAppName(app)}</div>

            <div className="modal-app-subtext">
              {normalizeValue(app.location)} | {normalizeValue(app.latitude)},{" "}
              {normalizeValue(app.longitude)}
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <ModalTabs activeTab={tab} setActiveTab={setTab} />

        <div className="modal-content-area">
          <div className="section-heading-row">
            <h3 className="section-heading">{getTabHeading(tab)}</h3>

            <span className={`status-badge ${getStatusClass(app.status)}`}>
              {app.status || "Pending"}
            </span>
          </div>

          {tab === "applicant" && (
            <div className="details-grid">
              <Info label="Applicant Full Name" value={getAppName(app)} />
              <Info label="Relationship / Father Name" value={app.fatherName} />
              <Info label="Mobile Number" value={app.mobile} />
              <Info label="E-mail ID" value={app.email} />
              <Info label="Application Status" value={app.status || "Pending"} />
            </div>
          )}

          {tab === "plot" && (
            <div className="details-grid">
              <Info label="Location" value={app.location} />
              <Info label="Land Type" value={app.landType} />
              <Info label="Survey Number" value={app.surveyNo} />
              <Info label="Plot Size" value={app.plotSize} />
              <Info label="Plot Area" value={app.plotArea} />
              <Info label="Latitude" value={app.latitude} />
              <Info label="Longitude" value={app.longitude} />
              <Info label="Address" value={app.address} full />
            </div>
          )}

          {tab === "building" && (
            <div className="details-grid">
              <Info label="Building Type" value={app.buildingType} />
              <Info label="Floors" value={app.floors} />
              <Info label="Built-up Area" value={app.builtupArea} />
              <Info label="Height" value={app.height} />
              <Info label="Road Width" value={app.roadWidth} />
              <Info label="Front Setback" value={app.frontSetback} />
              <Info label="Side Setback" value={app.sideSetback} />
              <Info label="Rear Setback" value={app.rearSetback} />
            </div>
          )}

          {tab === "review" && (
            <div className="details-grid">
              <Info label="Remarks" value={app.remarks} full />

              <div className="info-card info-card-full">
                <span>Uploaded CAD Designs / File</span>

                {getFileUrl(app) ? (
                  <a
                    href={getFileUrl(app)}
                    target="_blank"
                    rel="noreferrer"
                    className="file-preview-card"
                  >
                    <FileText size={20} />

                    <div>
                      <strong>{getFileName(app) || "View uploaded file"}</strong>
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
          <button className="footer-btn footer-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

type ApplicationEditModalProps = {
  app: Application;
  tab: ModalTab;
  setTab: (tab: ModalTab) => void;
  editFile: File | null;
  saving: boolean;
  getTabHeading: (tab: ModalTab) => string;
  onChange: (field: keyof Application, value: string) => void;
  onFileChange: (file: File | null) => void;
  onSave: () => void;
  onClose: () => void;
};

const ApplicationEditModal = ({
  app,
  tab,
  setTab,
  editFile,
  saving,
  getTabHeading,
  onChange,
  onFileChange,
  onSave,
  onClose,
}: ApplicationEditModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-approval-style"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-topbar">
          <div className="modal-meta">
            <div className="modal-app-id">Edit Application #{app.id}</div>
            <div className="modal-app-name">{getAppName(app)}</div>

            <div className="modal-app-subtext">
              Update application, plot, building and file details
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <ModalTabs activeTab={tab} setActiveTab={setTab} />

        <div className="modal-content-area">
          <div className="section-heading-row">
            <h3 className="section-heading">{getTabHeading(tab)}</h3>

            <div className="edit-status-select-wrap">
              <label>Status</label>

              <select
                value={app.status || "Pending"}
                onChange={(e) => onChange("status", e.target.value)}
                className="mini-status-select"
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Violation</option>
              </select>
            </div>
          </div>

          {tab === "applicant" && (
            <div className="form-grid">
              <FieldInput
                label="Applicant Full Name"
                value={app.applicantName || app.name || ""}
                onChange={(value) => {
                  onChange("applicantName", value);
                  onChange("name", value);
                }}
              />

              <FieldInput
                label="Relationship / Father Name"
                value={app.fatherName || ""}
                onChange={(value) => onChange("fatherName", value)}
              />

              <FieldInput
                label="Mobile Number"
                value={app.mobile || ""}
                onChange={(value) => onChange("mobile", value)}
              />

              <FieldInput
                label="E-mail ID"
                type="email"
                value={app.email || ""}
                onChange={(value) => onChange("email", value)}
              />
            </div>
          )}

          {tab === "plot" && (
            <div className="form-grid">
              <FieldInput
                label="Location"
                value={app.location || ""}
                onChange={(value) => onChange("location", value)}
              />

              <FieldInput
                label="Land Type"
                value={app.landType || ""}
                onChange={(value) => onChange("landType", value)}
              />

              <FieldInput
                label="Survey Number"
                value={app.surveyNo || ""}
                onChange={(value) => onChange("surveyNo", value)}
              />

              <FieldInput
                label="Plot Size"
                value={app.plotSize || ""}
                onChange={(value) => onChange("plotSize", value)}
              />

              <FieldInput
                label="Plot Area"
                value={app.plotArea || ""}
                onChange={(value) => onChange("plotArea", value)}
              />

              <FieldInput
                label="Latitude"
                type="number"
                value={app.latitude || ""}
                onChange={(value) => onChange("latitude", value)}
              />

              <FieldInput
                label="Longitude"
                type="number"
                value={app.longitude || ""}
                onChange={(value) => onChange("longitude", value)}
              />

              <FieldInput
                label="Address"
                value={app.address || ""}
                onChange={(value) => onChange("address", value)}
                full
              />
            </div>
          )}

          {tab === "building" && (
            <div className="form-grid">
              <FieldInput
                label="Building Type"
                value={app.buildingType || ""}
                onChange={(value) => onChange("buildingType", value)}
              />

              <FieldInput
                label="Floors"
                type="number"
                value={app.floors || ""}
                onChange={(value) => onChange("floors", value)}
              />

              <FieldInput
                label="Built-up Area"
                value={app.builtupArea || ""}
                onChange={(value) => onChange("builtupArea", value)}
              />

              <FieldInput
                label="Height"
                type="number"
                value={app.height || ""}
                onChange={(value) => onChange("height", value)}
              />

              <FieldInput
                label="Road Width"
                value={app.roadWidth || ""}
                onChange={(value) => onChange("roadWidth", value)}
              />

              <FieldInput
                label="Front Setback"
                value={app.frontSetback || ""}
                onChange={(value) => onChange("frontSetback", value)}
              />

              <FieldInput
                label="Side Setback"
                value={app.sideSetback || ""}
                onChange={(value) => onChange("sideSetback", value)}
              />

              <FieldInput
                label="Rear Setback"
                value={app.rearSetback || ""}
                onChange={(value) => onChange("rearSetback", value)}
              />
            </div>
          )}

          {tab === "review" && (
            <div className="form-grid">
              <FieldInput
                label="Remarks"
                value={app.remarks || ""}
                onChange={(value) => onChange("remarks", value)}
                full
              />

              <div className="form-group form-group-full">
                <label>Uploaded CAD Designs / File</label>

                {getFileUrl(app) && (
                  <a
                    href={getFileUrl(app)}
                    target="_blank"
                    rel="noreferrer"
                    className="existing-file"
                  >
                    <FileText size={16} />
                    {getFileName(app) || "View current file"}
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
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
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
          <button className="footer-btn footer-btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="footer-btn footer-btn-primary"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTable;