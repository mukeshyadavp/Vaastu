import { useState } from "react";
import Navbar from "../Navbar";
import HeroCards from "../HeroCards";

const Home = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [bpOpen, setBpOpen] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);

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
        setBpOpen={setBpOpen}
      />
    </div>
  );
};

export default Home;