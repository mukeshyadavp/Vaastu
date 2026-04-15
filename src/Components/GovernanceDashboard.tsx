import ApplicationsTable from "../Components/ApplicationsTable";
import mapHeader from "../assets/map1.png";

const GovernanceDashboard = ({ applications,  onApprove, onReject }: any) => {
  return (
    <div className="map">
      <h2>Governance Dashboard</h2>

      
        <img src={mapHeader} alt="Map Header" className="map-header-img" />
      
      <ApplicationsTable
        data={applications}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
};

export default GovernanceDashboard;