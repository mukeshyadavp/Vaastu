import "./Footer.css";



const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>DEPARTMENTS</h4>
          <h5>
          <ul>
           
            <li>AP-bPASS Portal</li>
            <li>GAMC</li>
            <li>DTCP</li>
            <li>AMDA</li>
          </ul>
          </h5>
        </div>

        <div className="footer-section">
          <h4>SUPPORT</h4>
          <h5>
          <ul>
            <li>Help</li>
            <li>FAQs</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
          </ul></h5>
        </div>

        <div className="footer-section social">
          <h4>Follow Us</h4>
          <div className="social-icons">
           
            <img src="/images/whatsapp.png" alt="WhatsApp" />
            <img src="/images/instagram.jpg" alt="Instagram" />
            <img src="/images/twitter.jpg" alt="Twitter" />
            <img src="/images/facebook.jpg" alt="Facebook" />
            <img src="/images/youtube.jpg" alt="YouTube" />
            
          </div>
        </div>

        <div className="footer-section contact">
          <h4>AP-bPASS</h4>
          <h5><p>
            5th Floor, ENC (PH) Building, <br />
            MA&UD Campus, Kashana Building Complex, <br />
            Opp: PTI Building, AC Guards, Vijayawada – 500004.
          </p></h5>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          ©2022 ANDHRA PRADESH BUILDING PERMISSION APPROVAL AND SELF CERTIFICATION
          SYSTEM. ALL RIGHTS RESERVED.
        </p>
        <p>
          Designed & Developed by: <strong>Hyno Technologies LLP</strong>
        </p>
      </div>
    </footer>
  );
};

export default Footer;