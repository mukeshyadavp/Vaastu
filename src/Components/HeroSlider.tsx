import { useEffect, useState } from "react";
import "./HeroSlider.css";

const slides = [
  {
    title: "Smart Building Permission System",
    desc: "A modern digital platform designed to simplify and accelerate the building approval process for citizens and authorities.",
    sub: "Apply for building permissions, track approvals in real-time, and ensure compliance with government regulations through an efficient and transparent system. Designed to reduce manual delays and provide a seamless user experience.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    title: "Fast & Transparent Approvals",
    desc: "Get instant approvals with minimal documentation and automated validation checks.",
    sub: "Our system ensures faster processing of applications with reduced human intervention. Experience quick verification, instant approvals, and a fully digital workflow from submission to completion.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
  },
  {
    title: "Real-Time Monitoring & Compliance",
    desc: "Monitor construction progress and ensure adherence to building regulations.",
    sub: "Integrated monitoring tools provide real-time updates, alerts, and compliance tracking. Stay informed about every stage of your building process with complete transparency and control.",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  },
];

const HeroSlider = () => {
  const [index, setIndex] = useState(0);

  // 🔥 auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="heroSlider">

      {/* LEFT CONTENT */}
      <div className="heroContent">
        <h1>{slides[index].title}</h1>
        <div className="line"></div>
        <p className="desc">{slides[index].desc}</p>
        <p className="sub">{slides[index].sub}</p>
      </div>

      {/* RIGHT IMAGE */}
      <div className="heroImage">
        <img src={slides[index].image} />
      </div>

    </div>
  );
};

export default HeroSlider;