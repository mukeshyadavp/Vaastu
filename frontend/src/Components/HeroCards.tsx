import house1 from "../assets/charming-yellow-house-with-wooden-windows-green-grassy-garden.jpg";
import house2 from "../assets/3d-rendering-house-model.jpg";
import house3 from "../assets/Satellite.jpg";
import "./HeroCards.css";

type HeroCardsProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBpOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const HeroCards: React.FC<HeroCardsProps> = ({ setOpen, setBpOpen }) => {
  return (
<div className="container">
<div className="card">
  <img src={house1} className="image" />

  {/* 🔥 HOVER CONTENT */}
  <div className="overlay">
    <h4>Instant Registration</h4>
    <p>
     Register your individual residential building quickly for plots up to 
  75 Sq. Yards and up to 7 meters height. No detailed approval process required.
    </p>
  </div>

  <button className="button"
     onClick={() => {
      setOpen(true); 
    }}
  
  >Instant Registration</button>
</div>

<div className="card">
  <img src={house2} className="image" />

  {/* 🔥 HOVER CONTENT */}
  <div className="overlay">
    <h4>Instant Approval</h4>
    <p>
   Get instant building approval for individual residential buildings 
  between 75 Sq. Yards (63 Sq. Meters) and 500 Sq. Meters up to 10 meters height.
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
    <h4>Monitor</h4>
    <p>
The satellite tracks construction progress and ensures compliance with building regulations, providing real-time updates and alerts for any deviations.
    </p>
  </div>

  <button className="button"
   onClick={() => {
  setBpOpen(true);
}}
  
  >Monitor</button>
</div>
</div>
  );
};

export default HeroCards;


