import { useState } from "react";
import Navbar from "../Navbar";
import HeroCards from "../HeroCards";
import Footer from "../Footer";
import MonitorPopup from "../MonitorPopup"; //

const Home = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [bpOpen, setBpOpen] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [monitorOpen, setMonitorOpen] = useState(false);

  return (
    <div>
      <Navbar
        open={open}
        setOpen={setOpen}
        bpOpen={bpOpen}
        setBpOpen={setBpOpen}
        formOpen={formOpen}
        setFormOpen={setFormOpen}
      />

      <HeroCards
        setOpen={setOpen}
       setBpOpen={setMonitorOpen} 
      />
      {monitorOpen && (
  <MonitorPopup setBpOpen={setMonitorOpen} />
)}
      <Footer />
    </div>
  );
};

export default Home;

