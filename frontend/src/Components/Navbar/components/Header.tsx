import logo from "../../../assets/logo.png";

const Header = () => {
  return (
    <div className="header">
      <img src={logo} className="logo" alt="logo" />

      <div>
        <h2 className="title">
          Andhra Pradesh Building Permission Approval & Self Certification
          System
        </h2>

        <h3 className="subtitle">(AP-bPASS) GOVERNMENT OF ANDHRA PRADESH</h3>
      </div>
    </div>
  );
};

export default Header;