import MapView from "../Components/MapView";

const GISMonitoring = ({ applications, onAdd,}: any) => {
  return (
    <div className="table-section">
      <h2>GIS & Satellite Monitoring</h2>
<MapView data={applications} onAdd={onAdd} />
    </div>
  );
};

export default GISMonitoring;