import ApplicationsTable from "../Components/ApplicationsTable";
import map1 from "../assets/map1.png";
import map2 from "../assets/ds-image2.png";
import map3 from "../assets/ds-image3.png";
import map4 from "../assets/ds-image4.jpg";
import "./GovernanceDashboard.css";

type GovernanceDashboardProps = {
  applications: any[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onUpdate?: (id: number, payload: FormData) => Promise<void> | void;
};

const GovernanceDashboard = ({
  applications,
  onApprove,
  onReject,
  onUpdate,
}: GovernanceDashboardProps) => {
  return (
    <div className="map">
      <h2>Governance Dashboard</h2>

      <div className="map-grid">
        <img src={map1} alt="Map1" />
        <img src={map2} alt="Map2" />
        <img src={map3} alt="Map3" />
        <img src={map4} alt="Map4" />
      </div>

      <ApplicationsTable
        data={applications}
        onApprove={onApprove}
        onReject={onReject}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default GovernanceDashboard;