import "./Footer.css";



const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>DEPARTMENTS</h4>
       
          <ul>
           
            <li>AP-bPASS Portal</li>
            <li>GAMC</li>
            <li>DTCP</li>
            <li>AMDA</li>
          </ul>
         
        </div>

        <div className="footer-section">
          <h4>SUPPORT</h4>
         
          <ul>
            <li>Help</li>
            <li>FAQs</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-section social">
          <h4>Follow Us</h4>
          <div className="social-icons">
           
            <img src="/whatsapp.png" alt="WhatsApp" />
            <img src="/instagram.jpg" alt="Instagram" />
            <img src="/twitter.png" alt="Twitter" />
            <div className="social">
            <img src="/facebook.jpg" alt="Facebook" />
            <img src="/youtube.png" alt="YouTube" /></div>
            
          </div>
        </div>

        <div className="footer-section contact">
          <h4>AP-bPASS</h4>
          <p>
            5th Floor, ENC (PH) Building, <br />
            MA&UD Campus, Kashana Building Complex, <br />
            Opp: PTI Building, AC Guards, Vijayawada – 500004.
          </p>
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