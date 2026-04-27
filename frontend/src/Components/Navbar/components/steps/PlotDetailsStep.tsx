import LocationMap from "../../../../Map/LocationMap";
import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";

type Props = {
  form: BuildingPermissionForm;
};

const PlotDetailsStep: React.FC<Props> = ({ form }) => {
  return (
    <>
      <h2 className="sectionTitle">Plot Details</h2>

      <input
        className="inputBox"
        value={form.survey}
        onChange={(event) => form.setSurvey(event.target.value)}
        placeholder="Survey Number"
      />

      <input
        className="inputBox"
        value={form.plotArea}
        onChange={(event) => form.setPlotArea(event.target.value)}
        placeholder="Plot Area"
      />

      <input
        className="inputBox"
        value={form.roadWidth}
        onChange={(event) => form.setRoadWidth(event.target.value)}
        placeholder="Road Width"
      />

      <select
        className="inputBox"
        value={form.landType}
        onChange={(event) => form.setLandType(event.target.value)}
      >
        <option value="">Select Land Type</option>
        <option>Residential</option>
        <option>Commercial</option>
      </select>

      <div className="searchContainer">
        <input
          className="inputBox searchInput"
          placeholder="Search Location"
          value={form.searchLocation}
          onChange={(event) => form.setSearchLocation(event.target.value)}
        />

        <button className="searchBtn" onClick={form.searchMapLocation}>
          Search
        </button>
      </div>

      <div className="latLngRow">
        <div className="fieldGroup">
          <label>Latitude</label>
          <input className="inputBox" value={form.latitude} readOnly />
        </div>

        <div className="fieldGroup">
          <label>Longitude</label>
          <input className="inputBox" value={form.longitude} readOnly />
        </div>
      </div>

      <div className="mapBoxReal">
        <LocationMap
          setLatitude={form.setLatitude}
          setLongitude={form.setLongitude}
        />
      </div>

      <div className="bottomActions">
        <button className="backBtn" onClick={() => form.setStep(1)}>
          ‹ Back
        </button>

        <button className="nextBtn" onClick={() => form.setStep(3)}>
          Next →
        </button>
      </div>
    </>
  );
};

export default PlotDetailsStep;