import { useState } from "react";
import { Pencil } from "lucide-react";

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

  /* 🔍 SEARCH */
  const [search, setSearch] = useState("");

  /* 📄 PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  /* 🧾 MODAL */
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editApp, setEditApp] = useState<Application | null>(null);

  /* FILTER */
  const filteredData = data.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  /* PAGINATION LOGIC */
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  return (
    <div>
<div className="table-section">
      {/* 🔍 SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
<div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {currentData.map((app) => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.name}</td>

              <td>
                <span className={`status ${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </td>

              <td>
                <div className="action-buttons">

                  <button className="approve-btn" onClick={() => onApprove(app.id)}>✔</button>

                  <button className="reject-btn" onClick={() => onReject(app.id)}>✖</button>

                  {/* 👁 VIEW */}
                  <button className="view-btn" onClick={() => setSelectedApp(app)}>
                    👁
                  </button>

                  {/* ✏️ EDIT */}
             <button className="edit-btn" onClick={() => setEditApp(app)}>
  <Pencil size={18} />
</button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
</div>
      {/* 📄 PAGINATION */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <span>Page {currentPage}</span>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLast >= filteredData.length}
        >
          Next
        </button>
      </div>
</div>
      {/* 🧾 MODAL */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Application Details</h3>

            <p><b>ID:</b> {selectedApp.id}</p>
            <p><b>Name:</b> {selectedApp.name}</p>
            <p><b>Status:</b> {selectedApp.status}</p>

            <button onClick={() => setSelectedApp(null)}>Close</button>
          </div>
        </div>
      )}
      {editApp && (
  <div className="modal-overlay" onClick={() => setEditApp(null)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>

      <h3>Edit Application</h3>

      <input
        type="text"
        value={editApp.name}
        onChange={(e) =>
          setEditApp({ ...editApp, name: e.target.value })
        }
      />

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

      <button
        onClick={() => {
          // update data
        //   const updated = data.map((item) =>
        //     item.id === editApp.id ? editApp : item
        //   );

          // hack: reload (temporary)
          window.location.reload();
        }}
      >
        Save
      </button>

    </div>
  </div>
)}

    </div>
  );
};

export default ApplicationsTable;