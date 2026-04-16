// import React, { useState } from "react";
import "./Dashboard.css";
type CardType = "completed" | "progress" | "overdue" | "percentage";
import React, { useState, useEffect } from "react";
const Dashboard: React.FC = () => {
const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
useEffect(() => {
  if (selectedCard) {
    document.body.style.overflow = "hidden";  // 🔒 lock scroll
  } else {
    document.body.style.overflow = "auto";    // 🔓 unlock
  }

  return () => {
    document.body.style.overflow = "auto";    // cleanup
  };
}, [selectedCard]);
// ✅ ADD BELOW THIS
const getTitle = () => {
  switch (selectedCard) {
    case "completed": return "Applications Completed";
    case "progress": return "Applications In Progress";
    case "overdue": return "Applications Overdue";
    case "percentage": return "All Applications Summary";
    default: return "";
  }
};
const dataMap: Record<
  "completed" | "progress" | "overdue",
  { id: number; name: string; status: string }[]
> = {
  completed: [
    { id: 101, name: "Ramesh", status: "Approved" },
    { id: 102, name: "Suresh", status: "Approved" }
  ],
  progress: [
    { id: 201, name: "Kiran", status: "Pending" }
  ],
  overdue: [
    { id: 301, name: "Naresh", status: "Violation" }
  ]
};
const getData = () => {
  if (selectedCard === "percentage") return allData;
  return dataMap[selectedCard as "completed" | "progress" | "overdue"];
};
const allData = [
  ...dataMap.completed,
  ...dataMap.progress,
  ...dataMap.overdue
];
// ✅ ADD THIS ALSO
const total =
  dataMap.completed.length +
  dataMap.progress.length +
  dataMap.overdue.length;

const percentage = Math.round(
  (dataMap.completed.length / total) * 100
);

  return (
    <div className="db-dashboard-container">

      {/* ===== TOP CARDS ===== */}
  <div className="db-stats-grid">

  <div className="db-card db-blue"
    onClick={() => setSelectedCard("completed")}
    style={{ cursor: "pointer" }}>
    <div className="db-card-content">
      <p className="db-title">Applications Completed</p>
     <h2 className="db-value">{dataMap.completed.length}</h2>
    </div>
  </div>

  <div className="db-card db-pink"
    onClick={() => setSelectedCard("progress")}
    style={{ cursor: "pointer" }}>
    <div className="db-card-content">
      <p className="db-title">Applications In Progress</p>
    <h2 className="db-value">{dataMap.progress.length}</h2>
    </div>
  </div>

  <div className="db-card db-yellow"
    onClick={() => setSelectedCard("overdue")}
    style={{ cursor: "pointer" }}>
    <div className="db-card-content">
      <p className="db-title">Applications Overdue</p>
<h2 className="db-value">{dataMap.overdue.length}</h2>
    </div>
  </div>

  <div className="db-card db-green"
   onClick={() => setSelectedCard("percentage")}
    style={{ cursor: "pointer" }}>
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
              <div className="db-bar db-blue-bar" style={{ height: "35%" }}></div>
              <div className="db-bar db-pink-bar" style={{ height: "90%" }}></div>
              <div className="db-bar db-green-bar" style={{ height: "55%" }}></div>
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
          <div className="db-donut"></div>

          <div className="db-legend">
            <p><span className="db-dot db-blue"></span> 69% Completed</p>
            <p><span className="db-dot db-green"></span> 24% In-Progress</p>
            <p><span className="db-dot db-yellow"></span> 7% Rejected</p>
          </div>
        </div>

        <div className="db-chart-box">
          <h4>Audit Trail Process</h4>
          <div className="db-pie"></div>

          <div className="db-legend">
            <p><span className="db-dot audit1"></span> 45% Completed</p>
            <p><span className="db-dot audit2"></span> 30% In Progress</p>
            <p><span className="db-dot audit3"></span> 25% Pending</p>
          </div>
        </div>

        <div className="db-chart-box">
          <h4>Application Tracking</h4>

          <div className="db-progress-item">
            <span>1-30 Days</span>
            <div className="db-progress">
              <div style={{ width: "70%", height: "250%" }}></div>
            </div>
          </div>

          <div className="db-progress-item">
            <span>31-60 Days</span>
            <div className="db-progress">
              <div style={{ width: "60%", height: "250%" }}></div>
            </div>
          </div>

          <div className="db-progress-item">
            <span>61-90 Days</span>
            <div className="db-progress">
              <div style={{ width: "40%", height: "250%" }}></div>
            </div>
          </div>

          <div className="db-progress-item">
            <span>90+ Days</span>
            <div className="db-progress">
              <div style={{ width: "20%", height: "250%" }}></div>
            </div>
          </div>
        </div>

      </div>

    
{selectedCard && (
  <div className="db-modal-overlay" onClick={() => setSelectedCard(null)}>

    <div className="db-modal" onClick={(e) => e.stopPropagation()}>

      <h3>{getTitle()}</h3>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Application</th>
            <th>Status</th>
          </tr>
        </thead>

<tbody>
  {selectedCard && getData()?.map((item: { id: number; name: string; status: string }) => (
    <tr key={item.id}>
      <td>#{item.id}</td>
      <td>{item.name}</td>
      <td>{item.status}</td>
    </tr>
  ))}
</tbody>
      </table>

      <button onClick={() => setSelectedCard(null)}>Close</button>

    </div>
  </div>
)}
    </div>
  );
};

export default Dashboard;