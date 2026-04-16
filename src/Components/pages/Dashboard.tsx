import React from "react";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  return (
    <div className="db-dashboard-container">

      {/* ===== TOP CARDS ===== */}
{/* ===== TOP CARDS ===== */}
<div className="db-stats-grid">

  <div className="db-card db-blue">
    <div className="db-card-content">
      <div>
       
        <p  className="db-title">Applications Completed</p>
         <h2  className="db-value">146</h2>
      </div>
    </div>
  </div>

  <div className="db-card db-pink">
    <div className="db-card-content">
      <div>
        <p  className="db-title">Applications In Progress</p>
         <h2  className="db-value">38</h2>
      </div>
    </div>
  </div>

  <div className="db-card db-yellow">
    <div className="db-card-content">
      <div>
       
        <p  className="db-title">Applications Overdue</p>
         <h2  className="db-value">11</h2>
      </div>
    </div>
  </div>

  <div className="db-card db-green">
    <div className="db-card-content">
      <div>
      
        <p  className="db-title">Completed Applications</p>
          <h2  className="db-value">87%</h2>
      </div>
    </div>
  </div>

</div>
      {/* ===== CHARTS ===== */}
      <div className="db-charts-grid">

        {/* Timesheet Bar Chart */}
     
<div className="db-chart-box">
  <h4>Application management</h4>

  <div className="db-timesheet-wrapper">
    
    {/* Y AXIS */}
    <div className="db-y-axis">
      <span>12</span>
      <span>10</span>
      <span>8</span>
      <span>6</span>
      <span>4</span>
      <span>2</span>
      <span>0</span>
    </div>

    {/* BARS */}
    <div className="db-bars">
      <div className="db-bar db-blue-bar" style={{ height: "35%" }}></div>
<div className="db-bar db-pink-bar" style={{ height: "90%" }}></div>
<div className="db-bar db-green-bar" style={{ height: "55%" }}></div>
    </div>
  </div>

  {/* X LABELS */}
  <div className="db-x-labels">
    <span>Multi-Level </span>
    <span>Deadline-Based </span>
    <span>Deadline-Based </span>
  </div>
</div>

        {/* Donut Chart */}
        <div className="db-chart-box">
          <h4>Application Management</h4>
          <div className="db-donut"></div>

          <div className="db-legend">
            <p><span className="db-dot db-blue"></span> 69% Completed</p>
            <p><span className="db-dot db-green"></span> 24% In-Progress</p>
            <p><span className="db-dot db-yellow"></span> 7% Rejected</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="db-chart-box">
          <h4>Audit Trail Process</h4>
          <div className="db-pie"></div>

     <div className="db-legend">
  <p><span className="db-dot audit1"></span> 45% Completed</p>
  <p><span className="db-dot audit2"></span> 30% In Progress</p>
  <p><span className="db-dot audit3"></span> 25% Pending</p>
</div>
        </div>

        {/* Progress Bars */}
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
    </div>
  );
};

export default Dashboard;
