import "./Dashboard.css";
import React, { useState, useEffect } from "react";

type CardType = "completed" | "progress" | "overdue" | "percentage";

type Application = {
  id: number;
  name?: string;
  applicantName?: string;
  status?: string;
  displayStatus?: string;
  [key: string]: any;
};

const getDisplayStatus = (status?: string) => {
  const normalized = String(status || "Pending")
    .trim()
    .toLowerCase();

  if (normalized === "pending") return "In progress";
  if (normalized === "approved") return "Completed";
  if (normalized === "rejected") return "Overdue";

  return "In progress";
};

const Dashboard: React.FC<{ applications: Application[] }> = ({
  applications,
}) => {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  useEffect(() => {
    if (selectedCard) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    };
  }, [selectedCard]);

  const getTitle = () => {
    switch (selectedCard) {
      case "completed":
        return "Applications Completed";
      case "progress":
        return "Applications In Progress";
      case "overdue":
        return "Applications Overdue";
      case "percentage":
        return "All Applications Summary";
      default:
        return "";
    }
  };

  const completed = applications.filter(
    (app) => app.status?.toLowerCase() === "approved"
  );

  const progress = applications.filter(
    (app) => app.status?.toLowerCase() === "pending"
  );

  const overdue = applications.filter(
    (app) => app.status?.toLowerCase() === "rejected"
  );

  const getData = () => {
    if (selectedCard === "completed") return completed;
    if (selectedCard === "progress") return progress;
    if (selectedCard === "overdue") return overdue;
    if (selectedCard === "percentage") return applications;
    return [];
  };

  const total = applications.length;

  const percentage =
    total > 0 ? Math.round((completed.length / total) * 100) : 0;

  return (
    <div className="db-dashboard-container">
      {/* ===== TOP CARDS ===== */}
      <div className="db-stats-grid">
        <div
          className="db-card db-blue"
          onClick={() => setSelectedCard("completed")}
          style={{ cursor: "pointer" }}
        >
          <div className="db-card-content">
            <p className="db-title">Applications Completed</p>
            <h2 className="db-value">{completed.length}</h2>
          </div>
        </div>

        <div
          className="db-card db-pink"
          onClick={() => setSelectedCard("progress")}
          style={{ cursor: "pointer" }}
        >
          <div className="db-card-content">
            <p className="db-title">Applications In Progress</p>
            <h2 className="db-value">{progress.length}</h2>
          </div>
        </div>

        <div
          className="db-card db-yellow"
          onClick={() => setSelectedCard("overdue")}
          style={{ cursor: "pointer" }}
        >
          <div className="db-card-content">
            <p className="db-title">Applications Overdue</p>
            <h2 className="db-value">{overdue.length}</h2>
          </div>
        </div>

        <div
          className="db-card db-green"
          onClick={() => setSelectedCard("percentage")}
          style={{ cursor: "pointer" }}
        >
          <div className="db-card-content">
            <p className="db-title">Completed Applications</p>
            <h2 className="db-value">{percentage}%</h2>
          </div>
        </div>
      </div>

      {/* ===== CHARTS ===== */}
      <div className="db-charts-grid">
        <div className="db-chart-box">
          <h4>Application management</h4>

          <div className="db-timesheet-wrapper">
            <div className="db-y-axis">
              <span>12</span>
              <span>10</span>
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>

            <div className="db-bars">
              <div className="db-bar db-blue-bar" style={{ height: "35%" }} />
              <div className="db-bar db-pink-bar" style={{ height: "90%" }} />
              <div className="db-bar db-green-bar" style={{ height: "55%" }} />
            </div>
          </div>

          <div className="db-x-labels">
            <span className="ML1">Multi-Level </span>
            <span className="BL1">Deadline-Based </span>
            <span className="BL2">Deadline-Based </span>
          </div>
        </div>

        <div className="db-chart-box">
          <h4>Application Management</h4>
          <div className="db-donut" />

          <div className="db-legend">
            <p>
              <span className="db-dot db-blue" /> 69% Completed
            </p>
            <p>
              <span className="db-dot db-green" /> 24% In-Progress
            </p>
            <p>
              <span className="db-dot db-yellow" /> 7% Rejected
            </p>
          </div>
        </div>

        <div className="db-chart-box">
          <h4>Audit Trail Process</h4>
          <div className="db-pie" />

          <div className="db-legend">
            <p>
              <span className="db-dot audit1" /> 45% Completed
            </p>
            <p>
              <span className="db-dot audit2" /> 30% In Progress
            </p>
            <p>
              <span className="db-dot audit3" /> 25% Pending
            </p>
          </div>
        </div>

        <div className="db-chart-box">
          <h4>Application Tracking</h4>

          <div className="db-progress-item">
            <span>1-30 Days</span>
            <div className="db-progress">
              <div style={{ width: "70%", height: "250%" }} />
            </div>
          </div>

          <div className="db-progress-item">
            <span>31-60 Days</span>
            <div className="db-progress">
              <div style={{ width: "60%", height: "250%" }} />
            </div>
          </div>

          <div className="db-progress-item">
            <span>61-90 Days</span>
            <div className="db-progress">
              <div style={{ width: "40%", height: "250%" }} />
            </div>
          </div>

          <div className="db-progress-item">
            <span>90+ Days</span>
            <div className="db-progress">
              <div style={{ width: "20%", height: "250%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== POPUP MODAL ===== */}
      {selectedCard && (
        <div
          className="db-modal-overlay"
          onClick={() => setSelectedCard(null)}
        >
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{getTitle()}</h3>

              <button
                className="db-close-btn"
                onClick={() => setSelectedCard(null)}
              >
                ×
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>S No</th>
                  <th>Application</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {getData().length > 0 ? (
                  getData().map((item: Application, index: number) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        {item.applicantName ||
                          item.name ||
                          `Application ${item.id}`}
                      </td>
                      <td>
                        {item.displayStatus || getDisplayStatus(item.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;