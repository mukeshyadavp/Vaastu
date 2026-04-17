import { useState } from "react";
import Navbar from "../Navbar";
import HeroCards from "../HeroCards";
import Footer from "../Footer";
import MonitorPopup from "../MonitorPopup"; //
import SliderCards from "../SliderCards";
import HeroSlider from "../HeroSlider";
import Features from "../Features";

const Home = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [bpOpen, setBpOpen] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [monitorOpen, setMonitorOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div>
      <Navbar
        open={open}
        setOpen={setOpen}
        bpOpen={bpOpen}
        setBpOpen={setBpOpen}
        formOpen={formOpen}
        setFormOpen={setFormOpen}
          applyOpen={applyOpen}         // ✅ ADD
  setApplyOpen={setApplyOpen}   // ✅ ADD
      />
      <HeroSlider /> 

      <HeroCards
        setOpen={setApplyOpen} 
       setBpOpen={setMonitorOpen} 
      />
      {monitorOpen && (
  <MonitorPopup setBpOpen={setMonitorOpen} />
)}
<Features /> 
<SliderCards />

      <Footer />
    </div>
  );
};

export default Home;

