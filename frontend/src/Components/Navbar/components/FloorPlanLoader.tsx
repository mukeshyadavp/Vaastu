const FloorPlanLoader = () => {
  return (
    <div className="floorplan-loader">
      <div className="floorplan-card">
        <div className="floorplan-grid"></div>

        <div className="floorplan-boundary">
          <div className="floorplan-garden"></div>

          <div className="floorplan-room living"></div>
          <div className="floorplan-room kitchen"></div>
          <div className="floorplan-room bedroom-one"></div>
          <div className="floorplan-room bedroom-two"></div>
          <div className="floorplan-room toilet-one"></div>
          <div className="floorplan-room toilet-two"></div>
          <div className="floorplan-room lobby"></div>
          <div className="floorplan-room stairs"></div>

          <div className="floorplan-door door-one"></div>
          <div className="floorplan-door door-two"></div>
          <div className="floorplan-door door-three"></div>

          <span className="scan-target target-one"></span>
          <span className="scan-target target-two"></span>
          <span className="scan-target target-three"></span>
        </div>

        <div className="floorplan-scan-band"></div>
        <div className="floorplan-scan-line"></div>
      </div>
    </div>
  );
};

export default FloorPlanLoader;