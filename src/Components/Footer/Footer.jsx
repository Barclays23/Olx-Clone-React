import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

import './Footer.css';





function Footer() {

   return (
      <div className="footerParentDiv">
         <div className="content">
            <div>
               <div className="heading">
                  <p>POPULAR LOCATIONS</p>
               </div>
               <div className="list">
                  <ul>
                  <li>Kolkata</li>
                  <li>Mumbai</li>
                  <li>Chennai</li>
                  <li>Pune</li>
                  </ul>
               </div>
            </div>
            <div>
               <div className="heading">
                  <p>POPULAR LOCATIONS</p>
               </div>
               <div className="list">
                  <ul>
                  <li>Bhuvaneshwar</li>
                  <li>Hyderabad</li>
                  <li>Chandigarh</li>
                  <li>Nashik</li>
                  </ul>
               </div>
            </div>
            <div>
               <div className="heading">
                  <p>ABOUT US</p>
               </div>
               <div className="list">
                  <ul>
                  <li>About OLX Group</li>
                  <li>Careers</li>
                  <li>Contact Us</li>
                  <li>OLXPeople</li>
                  </ul>
               </div>
            </div>
            <div>
               <div className="heading">
                  <p>OLX</p>
               </div>
               <div className="list">
                  <ul>
                  <li>Help</li>
                  <li>Sitemap</li>
                  <li>Legal & Privacy information</li>
                  </ul>
               </div>
            </div>

            <div className="followUs">
               <div className="heading">
                  <p>FOLLOW US</p>
               </div>
               <div className="socialIcons">
                  <a
                     href="https://facebook.com"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     <i className="fab fa-facebook-f"></i>
                  </a>
                  <a
                     href="https://instagram.com"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     <i className="fab fa-instagram"></i>
                  </a>
                  <a
                     href="https://twitter.com"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     <i className="fab fa-twitter"></i>
                  </a>
                  <a
                     href="https://youtube.com"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     <i className="fab fa-youtube"></i>
                  </a>
               </div>
               <div className="appButtons">
                  <a
                     href="https://play.google.com/store"
                     target="_blank"
                     rel="noopener noreferrer">
                     <img
                     src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                     alt="Get it on Google Play"
                     />
                  </a>
                  <br />
                  <a
                     href="https://www.apple.com/app-store/"
                     target="_blank"
                     rel="noopener noreferrer">
                     <img
                     src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                     alt="Download on the App Store"
                     />
                  </a>
               </div>
            </div>
         </div>

         <div className="footer">
         <p>All Rights Reserved © 2006-2025 OLX</p>
         </div>
      </div>
   );
}

export default Footer;
