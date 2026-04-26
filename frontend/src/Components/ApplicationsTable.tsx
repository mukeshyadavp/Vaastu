import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Pencil, X } from "lucide-react";
import "./ApplicationsTable.css";
type Application = {
  id: number;
  name: string;
  status: string;
};

type Props = {
  data: Application[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
};

const ApplicationsTable = ({ data, onApprove, onReject }: Props) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editApp, setEditApp] = useState<Application | null>(null);

  const itemsPerPage = 4;

  const filteredData = useMemo(() => {
    return data.filter((app) =>
      app.name.toLowerCase().includes(search.toLowerCase())
    );
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

  const getStatusClass = (status: string) => {
    const value = status.toLowerCase();
    if (value === "approved") return "approved";
    if (value === "pending") return "pending";
    if (value === "rejected" || value === "violation") return "rejected";
    return "default";
  };

  return (
    <div className="applications-card">
      <div className="table-topbar">
        <div>
          <h2 className="table-title">Applications</h2>
          <p className="table-subtitle">Manage user requests and review status</p>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name..."
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
              <th style={{ width: "120px" }}>ID</th>
              <th>Name</th>
              <th style={{ width: "180px" }}>Status</th>
              <th style={{ width: "220px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((app) => (
                <tr key={app.id}>
                  <td>
                    <span className="id-badge">#{app.id}</span>
                  </td>

                  <td>
                    <div className="name-cell">
                      <div className="avatar-circle">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{app.name}</span>
                    </div>
                  </td>

                  <td>
                    <span className={`status-badge ${getStatusClass(app.status)}`}>
                      {app.status}
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
                        onClick={() => setEditApp(app)}
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
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
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Application Details</h3>

        <button
          className="modal-close-icon"
          onClick={() => setSelectedApp(null)}
        >
          ✕
        </button>
      </div>

      <div className="detail-row">
        <span>ID</span>
        <strong>{selectedApp.id}</strong>
      </div>

      <div className="detail-row">
        <span>Name</span>
        <strong>{selectedApp.name}</strong>
      </div>

      <div className="detail-row">
        <span>Status</span>
        <strong>{selectedApp.status}</strong>
      </div>
       <button
    className="modal-btn secondary"
    onClick={() => setSelectedApp(null)}
  >
    Close
  </button>
    </div>
  </div>
)}

      {editApp && (
        <div className="modal-overlay" onClick={() => setEditApp(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Application</h3>
              <button
                className="modal-close-icon"
                onClick={() => setEditApp(null)}
              >
                ✕
              </button>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={editApp.name}
                onChange={(e) =>
                  setEditApp({ ...editApp, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={editApp.status}
                onChange={(e) =>
                  setEditApp({ ...editApp, status: e.target.value })
                }
              >
                <option>Approved</option>
                <option>Pending</option>
                <option>Violation</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setEditApp(null)}>
                Cancel
              </button>

              <button
                className="modal-btn primary"
                onClick={() => {
                  // replace this with real update logic from parent
                  window.location.reload();
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTable;