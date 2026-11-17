import { Link } from "react-router-dom";

import logoImg from "../../assets/logo.png";

import "./footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          {/* BRAND */}
          <div className="footer-brand">
            {/* <Link to="/" className="footer-logo">
              <img src={logoImg} alt="FiTrack" />
            </Link> */}
              <h3><a href="/" className='text-white' style={{textDecoration: 'none'}}>FiTrack</a></h3>
            <p>
              All rights reserved. This website and its software are proprietary
              and protected by applicable copyright, trademark, and intellectual
              property laws.{" "}
              {/* <Link className="info" to="/info">
                Info.
              </Link> */}
            </p>
            <Link className="info" to="/info">
                Info & Updates
              </Link>
          </div>

          {/* NAVIGATE */}
          <div className="footer-column">
            <h4>Navigate</h4>

            <Link to="/help">Help Page</Link>
          </div>

          {/* LEGAL */}
          <div className="footer-column">
            <h4>Legal</h4>

            <Link to="/terms">Terms of Use</Link>
            <Link to="/privacy">Privacy & Cookie</Link>
            {/* <Link to="/info">Info</Link> */}
          </div>

          {/* CONTACT */}
          <div className="footer-column footer-contact">
            <h4>Contact</h4>

            <a href="mailto:support@fitrack.info">support@fitrack.info</a>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FiTrack</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
