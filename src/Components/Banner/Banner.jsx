import React from 'react';
import './Banner.css';
import Arrow from '../../assets/Arrow';

function Banner() {
   return (
      <div className="bannerParentDiv">
         <div className="bannerChildDiv">
            <div className="menuBar">
               <div className="categoryMenu">
                  <span>ALL CATEGORIES</span>
                  <Arrow />
               </div>
               <div className="otherQuickOptions">
                  <span>Accessories</span>
                  <span>Agriculture</span>
                  <span>Bicycles</span>
                  <span>Books</span>
                  <span>Electronics</span>
                  <span>Fashion</span>
                  <span>Furniture</span>
                  <span>Gaming</span>
                  <span>Hobbies</span>
                  <span>Home Appliances</span>
                  <span>Industrial Equipment</span>
                  <span>Jobs</span>
                  <span>Kids & Babies</span>
                  <span>Mobiles</span>
                  <span>Musical Instruments</span>
                  <span>Pets</span>
                  <span>Real Estate</span>
                  <span>Services</span>
                  <span>Sports & Fitness</span>
                  <span>Vehicles</span>
               </div>
            </div>
            <div className="banner">
               <img src="../../../Images/banner copy.png" alt="Banner Image" />
            </div>
         </div>
      </div>
   );
}

export default Banner;