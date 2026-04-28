import { useEffect, useMemo, useState } from "react";
import { Check, Eye, FileText, Pencil, X } from "lucide-react";
import "./ApplicationsTable.css";

export type Application = {
  id: number;

  name?: string;
  applicantName?: string;
  fatherName?: string;
  mobile?: string;
  email?: string;

  location?: string;
  address?: string;
  surveyNo?: string;
  plotSize?: string;
  plotArea?: string;
  buildingType?: string;
  floors?: string | number;
  height?: string | number;

  latitude?: number | string | null;
  longitude?: number | string | null;

  status?: string;
  remarks?: string;

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

const getAppName = (app: Application) =>
  app.applicantName || app.name || `Application ${app.id}`;

const getFileName = (app: Application) =>
  app.fileName || app.filename || app.file || app.uploadedFile || "";

const getFileUrl = (app: Application) =>
  app.fileUrl || app.documentUrl || app.uploadedFile || app.file || "";

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

  const itemsPerPage = 4;

  const filteredData = useMemo(() => {
    return data.filter((app) => {
      const value = search.toLowerCase();

      return (
        getAppName(app).toLowerCase().includes(value) ||
        normalizeValue(app.location).toLowerCase().includes(value) ||
        normalizeValue(app.status).toLowerCase().includes(value) ||
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

  const handleSave = async () => {
    if (!editApp) return;

    const formData = new FormData();

    formData.append("applicantName", editApp.applicantName || editApp.name || "");
    formData.append("name", editApp.name || editApp.applicantName || "");
    formData.append("fatherName", editApp.fatherName || "");
    formData.append("mobile", editApp.mobile || "");
    formData.append("email", editApp.email || "");

    formData.append("location", editApp.location || "");
    formData.append("address", editApp.address || "");
    formData.append("surveyNo", editApp.surveyNo || "");
    formData.append("plotSize", editApp.plotSize || "");
    formData.append("plotArea", editApp.plotArea || "");
    formData.append("buildingType", editApp.buildingType || "");
    formData.append("floors", String(editApp.floors || ""));
    formData.append("height", String(editApp.height || ""));

    formData.append("latitude", String(editApp.latitude || ""));
    formData.append("longitude", String(editApp.longitude || ""));

    formData.append("status", editApp.status || "Pending");
    formData.append("remarks", editApp.remarks || "");

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

  return (
    <div className="applications-card">
      <div className="table-topbar">
        <div>
          <h2 className="table-title">Applications</h2>
          <p className="table-subtitle">
            Manage user requests and review complete application details
          </p>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, location, status or ID..."
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
              <th style={{ width: "90px" }}>ID</th>
              <th>Applicant</th>
              <th>Location</th>
              <th>Plot Size</th>
              <th style={{ width: "150px" }}>Status</th>
              <th style={{ width: "220px" }}>Action</th>
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
                        <span>{appName}</span>
                      </div>
                    </td>

                    <td>{normalizeValue(app.location)}</td>

                    <td>{normalizeValue(app.plotSize || app.plotArea)}</td>

                    <td>
                      <span className={`status-badge ${getStatusClass(app.status)}`}>
                        {app.status || "Pending"}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-btn approve"
                          onClick={() => onApprove(app.id)}
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>

                        <button
                          className="icon-btn reject"
                          onClick={() => onReject(app.id)}
                          title="Reject"
                        >
                          <X size={18} />
                        </button>

                        <button
                          className="icon-btn view"
                          onClick={() => setSelectedApp(app)}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          className="icon-btn edit"
                          onClick={() => {
                            setEditApp(app);
                            setEditFile(null);
                          }}
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
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

      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Application Details</h3>

              <button
                className="modal-close-icon"
                onClick={() => setSelectedApp(null)}
              >
                ✕
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-row">
                <span>ID</span>
                <strong>{selectedApp.id}</strong>
              </div>

              <div className="detail-row">
                <span>Applicant Name</span>
                <strong>{getAppName(selectedApp)}</strong>
              </div>

              <div className="detail-row">
                <span>Father Name</span>
                <strong>{normalizeValue(selectedApp.fatherName)}</strong>
              </div>

              <div className="detail-row">
                <span>Mobile</span>
                <strong>{normalizeValue(selectedApp.mobile)}</strong>
              </div>

              <div className="detail-row">
                <span>Email</span>
                <strong>{normalizeValue(selectedApp.email)}</strong>
              </div>

              <div className="detail-row">
                <span>Status</span>
                <strong>{selectedApp.status || "Pending"}</strong>
              </div>

              <div className="detail-row">
                <span>Location</span>
                <strong>{normalizeValue(selectedApp.location)}</strong>
              </div>

              <div className="detail-row">
                <span>Address</span>
                <strong>{normalizeValue(selectedApp.address)}</strong>
              </div>

              <div className="detail-row">
                <span>Survey No</span>
                <strong>{normalizeValue(selectedApp.surveyNo)}</strong>
              </div>

              <div className="detail-row">
                <span>Plot Size</span>
                <strong>{normalizeValue(selectedApp.plotSize)}</strong>
              </div>

              <div className="detail-row">
                <span>Plot Area</span>
                <strong>{normalizeValue(selectedApp.plotArea)}</strong>
              </div>

              <div className="detail-row">
                <span>Building Type</span>
                <strong>{normalizeValue(selectedApp.buildingType)}</strong>
              </div>

              <div className="detail-row">
                <span>Floors</span>
                <strong>{normalizeValue(selectedApp.floors)}</strong>
              </div>

              <div className="detail-row">
                <span>Height</span>
                <strong>{normalizeValue(selectedApp.height)}</strong>
              </div>

              <div className="detail-row">
                <span>Latitude</span>
                <strong>{normalizeValue(selectedApp.latitude)}</strong>
              </div>

              <div className="detail-row">
                <span>Longitude</span>
                <strong>{normalizeValue(selectedApp.longitude)}</strong>
              </div>

              <div className="detail-row detail-row-full">
                <span>Remarks</span>
                <strong>{normalizeValue(selectedApp.remarks)}</strong>
              </div>

              <div className="detail-row detail-row-full">
                <span>File</span>
                <strong>
                  {getFileUrl(selectedApp) ? (
                    <a
                      href={getFileUrl(selectedApp)}
                      target="_blank"
                      rel="noreferrer"
                      className="file-link"
                    >
                      <FileText size={16} />
                      {getFileName(selectedApp) || "View uploaded file"}
                    </a>
                  ) : (
                    "-"
                  )}
                </strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn secondary"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editApp && (
        <div className="modal-overlay" onClick={() => setEditApp(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Application</h3>

              <button className="modal-close-icon" onClick={() => setEditApp(null)}>
                ✕
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Applicant Name</label>
                <input
                  type="text"
                  value={editApp.applicantName || editApp.name || ""}
                  onChange={(e) => {
                    handleEditChange("applicantName", e.target.value);
                    handleEditChange("name", e.target.value);
                  }}
                />
              </div>

              <div className="form-group">
                <label>Father Name</label>
                <input
                  type="text"
                  value={editApp.fatherName || ""}
                  onChange={(e) => handleEditChange("fatherName", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Mobile</label>
                <input
                  type="text"
                  value={editApp.mobile || ""}
                  onChange={(e) => handleEditChange("mobile", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editApp.email || ""}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editApp.status || "Pending"}
                  onChange={(e) => handleEditChange("status", e.target.value)}
                >
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Violation</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editApp.location || ""}
                  onChange={(e) => handleEditChange("location", e.target.value)}
                />
              </div>

              <div className="form-group form-group-full">
                <label>Address</label>
                <input
                  type="text"
                  value={editApp.address || ""}
                  onChange={(e) => handleEditChange("address", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Survey No</label>
                <input
                  type="text"
                  value={editApp.surveyNo || ""}
                  onChange={(e) => handleEditChange("surveyNo", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Plot Size</label>
                <input
                  type="text"
                  value={editApp.plotSize || ""}
                  onChange={(e) => handleEditChange("plotSize", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Plot Area</label>
                <input
                  type="text"
                  value={editApp.plotArea || ""}
                  onChange={(e) => handleEditChange("plotArea", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Building Type</label>
                <input
                  type="text"
                  value={editApp.buildingType || ""}
                  onChange={(e) => handleEditChange("buildingType", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Floors</label>
                <input
                  type="number"
                  value={editApp.floors || ""}
                  onChange={(e) => handleEditChange("floors", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Height</label>
                <input
                  type="number"
                  value={editApp.height || ""}
                  onChange={(e) => handleEditChange("height", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  value={editApp.latitude || ""}
                  onChange={(e) => handleEditChange("latitude", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  value={editApp.longitude || ""}
                  onChange={(e) => handleEditChange("longitude", e.target.value)}
                />
              </div>

              <div className="form-group form-group-full">
                <label>Remarks</label>
                <input
                  type="text"
                  value={editApp.remarks || ""}
                  onChange={(e) => handleEditChange("remarks", e.target.value)}
                />
              </div>

              <div className="form-group form-group-full">
                <label>Uploaded File</label>

                {getFileUrl(editApp) && (
                  <a
                    href={getFileUrl(editApp)}
                    target="_blank"
                    rel="noreferrer"
                    className="file-link existing-file"
                  >
                    <FileText size={16} />
                    {getFileName(editApp) || "View current file"}
                  </a>
                )}

                <input
                  type="file"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                />

                {editFile && (
                  <small className="selected-file-name">
                    New file selected: {editFile.name}
                  </small>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn secondary"
                onClick={() => {
                  setEditApp(null);
                  setEditFile(null);
                }}
              >
                Cancel
              </button>

              <button
                className="modal-btn primary"
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

export default ApplicationsTable;