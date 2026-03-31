import house1 from "../assets/villa.webp";
import house2 from "../assets/buildings.jpeg";
import house3 from "../assets/house.webp";
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
    <button className="button">Instant Registration</button>
  </div>

  <div className="card">
    <img src={house2} className="image" />
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
    <button className="button">Single Window</button>
  </div>
</div>
  );
};

export default HeroCards;