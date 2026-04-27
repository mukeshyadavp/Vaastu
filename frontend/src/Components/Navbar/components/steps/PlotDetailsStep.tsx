import LocationMap from "../../../../Map/LocationMap";
import type { BuildingPermissionForm } from "../hooks/useBuildingPermissionForm";
import { FaSearch } from "react-icons/fa";

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

      {/* 🔍 SEARCH SECTION */}
      <div className="searchContainer">
        <input
          className="inputBox searchInput"
          placeholder="Search Location"
          value={form.searchLocation}
          onChange={(event) => {
            form.setSearchLocation(event.target.value);
            form.fetchSuggestions(event.target.value);
          }}
        />

        <button
          className="searchBtn"
          onClick={form.searchMapLocation}
        >
          <FaSearch />
        </button>

        {/* 📋 SUGGESTIONS */}
        {form.suggestions.length > 0 && (
          <div className="suggestionsBox">
            {form.suggestions.map((item: any, index: number) => (
              <div
                key={index}
                className="suggestionItem"
                onClick={() => {
                  form.setSearchLocation(item.display_name);

                  const lat = parseFloat(item.lat);
                  const lon = parseFloat(item.lon);

                  form.setLatitude(item.lat);
                  form.setLongitude(item.lon);

                  window.dispatchEvent(
                    new CustomEvent("moveMap", {
                      detail: { lat, lon },
                    })
                  );

                  form.setSuggestions([]);
                }}
              >
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📍 LAT LNG */}
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

      {/* 🗺 MAP */}
      <div className="mapBoxReal">
        <LocationMap
          setLatitude={form.setLatitude}
          setLongitude={form.setLongitude}
        />
      </div>

      {/* 🔘 BUTTONS */}
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