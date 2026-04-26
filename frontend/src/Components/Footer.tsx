import "./Footer.css";
import {
  FaWhatsapp,
  FaInstagram,
  FaTwitter,
  FaFacebookF,
  FaYoutube
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wrapper">

        <div className="footer-grid">

          {/* Departments */}
          <div className="footer-col">
            <h3>Departments</h3>
            <ul>
              <li><a href="#">AP-bPASS Portal</a></li>
              <li><a href="#">GAMC</a></li>
              <li><a href="#">DTCP</a></li>
              <li><a href="#">AMDA</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h3>Support</h3>
            <ul>
              <li><a href="#">Help</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Social */}
          <div className="footer-col">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#"><FaWhatsapp /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaYoutube /></a>
            </div>
          </div>

          {/* Address */}
          <div className="footer-col address">
            <h3>AP-bPASS</h3>
            <p>
              5th Floor, ENC (PH) Building <br />
              MA&UD Campus, Kashana Building Complex <br />
              Opp: PTI Building, AC Guards <br />
              Vijayawada – 500004
            </p>
          </div>

        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© 2022 AP-bPASS. All rights reserved.</p>
          <p>Designed & Developed by Hyno Technologies LLP</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;