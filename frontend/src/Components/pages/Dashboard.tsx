import "./Dashboard.css";
import React, { useState, useEffect } from "react";

type CardType = "completed" | "progress" | "overdue" | "percentage";

type Application = {
  id: number;
  name?: string;
  applicantName?: string;
  status?: string;
  displayStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};

const getDisplayStatus = (status?: string) => {
  const normalized = String(status || "Pending").trim().toLowerCase();

  if (normalized === "pending") return "In progress";
  if (normalized === "approved") return "Completed";
  if (normalized === "rejected") return "Overdue";

  return "In progress";
};

const getPercentage = (value: number, total: number) => {
  if (!total || total <= 0) return 0;
  return Math.round((value / total) * 100);
};

const getSafeChartValue = (value: number) => {
  if (!value || value <= 0) return 0;
  return Math.max(value, 4);
};

const getApplicationDate = (app: Application) => {
  const rawDate =
    app.createdAt ||
    app.created_at ||
    app.submittedAt ||
    app.submitted_at ||
    app.updatedAt ||
    app.updated_at;

  if (!rawDate) return null;

  const parsedDate = new Date(rawDate);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate;
};

const getDaysOld = (app: Application) => {
  const date = getApplicationDate(app);

  if (!date) return 0;

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(diffDays, 0);
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

  const total = applications.length;

  const completedPercent = getPercentage(completed.length, total);
  const progressPercent = getPercentage(progress.length, total);
  const overduePercent = getPercentage(overdue.length, total);

  const percentage = completedPercent;

  const donutCompletedEnd = completedPercent;
  const donutProgressEnd = completedPercent + progressPercent;
  const donutRejectedEnd = completedPercent + progressPercent + overduePercent;

  const maxBarValue = Math.max(
    completed.length,
    progress.length,
    overdue.length,
    1
  );

  const completedBarHeight = getSafeChartValue(
    Math.round((completed.length / maxBarValue) * 100)
  );

  const progressBarHeight = getSafeChartValue(
    Math.round((progress.length / maxBarValue) * 100)
  );

  const overdueBarHeight = getSafeChartValue(
    Math.round((overdue.length / maxBarValue) * 100)
  );

  const tracking1To30 = applications.filter((app) => {
    const days = getDaysOld(app);
    return days >= 0 && days <= 30;
  });

  const tracking31To60 = applications.filter((app) => {
    const days = getDaysOld(app);
    return days >= 31 && days <= 60;
  });

  const tracking61To90 = applications.filter((app) => {
    const days = getDaysOld(app);
    return days >= 61 && days <= 90;
  });

  const tracking90Plus = applications.filter((app) => {
    const days = getDaysOld(app);
    return days > 90;
  });

  const tracking1To30Percent = getPercentage(tracking1To30.length, total);
  const tracking31To60Percent = getPercentage(tracking31To60.length, total);
  const tracking61To90Percent = getPercentage(tracking61To90.length, total);
  const tracking90PlusPercent = getPercentage(tracking90Plus.length, total);

  const auditCompleted = completed.length;
  const auditInProgress = progress.length;
  const auditPending = overdue.length;

  const auditCompletedPercent = getPercentage(auditCompleted, total);
  const auditInProgressPercent = getPercentage(auditInProgress, total);
  const auditPendingPercent = getPercentage(auditPending, total);

  const auditCompletedEnd = auditCompletedPercent;
  const auditInProgressEnd = auditCompletedPercent + auditInProgressPercent;
  const auditPendingEnd =
    auditCompletedPercent + auditInProgressPercent + auditPendingPercent;

  const getData = () => {
    if (selectedCard === "completed") return completed;
    if (selectedCard === "progress") return progress;
    if (selectedCard === "overdue") return overdue;
    if (selectedCard === "percentage") return applications;
    return [];
  };

  return (
    <div className="db-dashboard-container">
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

      <div className="db-charts-grid">
        <div className="db-chart-box">
          <h4>Application Management</h4>

          <div className="db-timesheet-wrapper">
            <div className="db-y-axis">
              <span>{maxBarValue}</span>
              <span>{Math.round(maxBarValue * 0.8)}</span>
              <span>{Math.round(maxBarValue * 0.6)}</span>
              <span>{Math.round(maxBarValue * 0.4)}</span>
              <span>{Math.round(maxBarValue * 0.2)}</span>
              <span>0</span>
            </div>

            <div className="db-bars">
              <div className="db-bar-wrap">
                <div
                  className="db-bar db-blue-bar"
                  style={{ height: `${completedBarHeight}%` }}
                  title={`${completed.length} Completed`}
                />
                <strong>{completed.length}</strong>
              </div>

              <div className="db-bar-wrap">
                <div
                  className="db-bar db-pink-bar"
                  style={{ height: `${progressBarHeight}%` }}
                  title={`${progress.length} In Progress`}
                />
                <strong>{progress.length}</strong>
              </div>

              <div className="db-bar-wrap">
                <div
                  className="db-bar db-green-bar"
                  style={{ height: `${overdueBarHeight}%` }}
                  title={`${overdue.length} Overdue`}
                />
                <strong>{overdue.length}</strong>
              </div>
            </div>
          </div>

          <div className="db-x-labels">
            <span>Completed</span>
            <span>In Progress</span>
            <span>Overdue</span>
          </div>
        </div>

        <div className="db-chart-box">
          <h4>Application Management</h4>

          <div
            className="db-donut"
            style={{
              background:
                total > 0
                  ? `conic-gradient(
                      #3b82f6 0% ${donutCompletedEnd}%,
                      #22c55e ${donutCompletedEnd}% ${donutProgressEnd}%,
                      #facc15 ${donutProgressEnd}% ${donutRejectedEnd}%,
                      #e5e7eb ${donutRejectedEnd}% 100%
                    )`
                  : "#e5e7eb",
            }}
          >
            <div className="db-donut-center">
              <strong>{total}</strong>
              <span>Total</span>
            </div>
          </div>

          <div className="db-legend">
            <p>
              <span className="db-dot db-blue" /> {completedPercent}% Completed
            </p>
            <p>
              <span className="db-dot db-green" /> {progressPercent}% In-Progress
            </p>
            <p>
              <span className="db-dot db-yellow" /> {overduePercent}% Overdue
            </p>
          </div>
        </div>

        <div className="db-chart-box">
          <h4>Audit Trail Process</h4>

          <div
            className="db-pie"
            style={{
              background:
                total > 0
                  ? `conic-gradient(
                      #ec4899 0% ${auditCompletedEnd}%,
                      #c084fc ${auditCompletedEnd}% ${auditInProgressEnd}%,
                      #f9a8d4 ${auditInProgressEnd}% ${auditPendingEnd}%,
                      #e5e7eb ${auditPendingEnd}% 100%
                    )`
                  : "#e5e7eb",
            }}
          />

          <div className="db-legend">
            <p>
              <span className="db-dot audit1" /> {auditCompletedPercent}% Completed
            </p>
            <p>
              <span className="db-dot audit2" /> {auditInProgressPercent}% In Progress
            </p>
            <p>
              <span className="db-dot audit3" /> {auditPendingPercent}% Overdue
            </p>
          </div>
        </div>

        <div className="db-chart-box">
          <h4>Application Tracking</h4>

          <div className="db-progress-item">
            <div className="db-progress-label">
              <span>1-30 Days</span>
              <strong>
                {tracking1To30.length} ({tracking1To30Percent}%)
              </strong>
            </div>
            <div className="db-progress">
              <div style={{ width: `${tracking1To30Percent}%` }} />
            </div>
          </div>

          <div className="db-progress-item">
            <div className="db-progress-label">
              <span>31-60 Days</span>
              <strong>
                {tracking31To60.length} ({tracking31To60Percent}%)
              </strong>
            </div>
            <div className="db-progress">
              <div style={{ width: `${tracking31To60Percent}%` }} />
            </div>
          </div>

          <div className="db-progress-item">
            <div className="db-progress-label">
              <span>61-90 Days</span>
              <strong>
                {tracking61To90.length} ({tracking61To90Percent}%)
              </strong>
            </div>
            <div className="db-progress">
              <div style={{ width: `${tracking61To90Percent}%` }} />
            </div>
          </div>

          <div className="db-progress-item">
            <div className="db-progress-label">
              <span>90+ Days</span>
              <strong>
                {tracking90Plus.length} ({tracking90PlusPercent}%)
              </strong>
            </div>
            <div className="db-progress">
              <div style={{ width: `${tracking90PlusPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

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