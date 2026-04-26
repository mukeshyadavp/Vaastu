import "./Features.css";

const features = [
  {
    title: "Easy Online Application",
    desc: "Submit your building application online with a smooth and hassle-free digital process.",
    icon: "📝",
  },
  {
    title: "Fast Approval System",
    desc: "Automated checks ensure quicker approvals without unnecessary delays.",
    icon: "⚡",
  },
  {
    title: "Secure & Reliable",
    desc: "Your data is protected with secure systems and encrypted transactions.",
    icon: "🔒",
  },
  {
    title: "Step-by-Step Process",
    desc: "Follow a simple guided workflow from application to final approval.",
    icon: "📊",
  },
  {
    title: "Modern Infrastructure",
    desc: "Built with latest technology to ensure performance and scalability.",
    icon: "🏗️",
  },
  {
    title: "Mobile Friendly",
    desc: "Access services anytime from mobile, tablet, or desktop devices.",
    icon: "📱",
  },
];

const Features = () => {
  return (
    <div className="featuresWrapper">

      <h2 className="featuresTitle">Why Choose Our System</h2>

      <div className="featuresGrid">
        {features.map((item, index) => (
          <div className="featureCard" key={index}>
            <div className="icon">{item.icon}</div>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Features;