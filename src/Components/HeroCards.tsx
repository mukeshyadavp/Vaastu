import house1 from "../assets/charming-yellow-house-with-wooden-windows-green-grassy-garden.jpg";
import house2 from "../assets/3d-rendering-house-model.jpg";
import house3 from "../assets/modern-district-aerial-panorama-urban-style.jpg";
import "./HeroCards.css";

type HeroCardsProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBpOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const HeroCards: React.FC<HeroCardsProps> = ({ setOpen }) => {
  return (
<div className="container">
<div className="card">
  <img src={house1} className="image" />

  {/* 🔥 HOVER CONTENT */}
  <div className="overlay">
    <h4>Instant Registration</h4>
    <p>
      Individual Residential Building Permission upto 75 Sq.Yards &
      upto 7 meters Height
    </p>
  </div>

  <button className="button">Instant Registration</button>
</div>

<div className="card">
  <img src={house2} className="image" />

  {/* 🔥 HOVER CONTENT */}
  <div className="overlay">
    <h4>Instant Approval</h4>
    <p>
      Individual Residential Building Permission above 75 Sq.Yards 
      (63 Sq. Meters) to 500 Sq. Meters & upto 10 meters Height
    </p>
  </div>

  <button
    className="button"
    onClick={() => {
      setOpen(true); 
    }}
  >
    Instant Approval
  </button>
</div>

 <div className="card">
  <img src={house3} className="image" />

  {/* 🔥 HOVER CONTENT */}
  <div className="overlay">
    <h4>Single Window</h4>
    <p>
      All Individual residential buildings above 500 Sq. Meters above 10 meters height. 
      All Non-residential categories, Master Plan / SRDP / Road widening cases.
    </p>
  </div>

  <button className="button">Single Window</button>
</div>
</div>
  );
};

export default HeroCards;


