import React from 'react';

import Banner from '../Components/Banner/Banner';

import Posts from '../Components/Posts/Posts';
import Footer from '../Components/Footer/Footer';
import Navbar from '../Components/Navbar/Navbar';



function Home() {
  return (
    <div className="homeParentDiv">
      <Navbar/>
      <Banner />
      <Posts />
      <Footer />
    </div>
  );
}

export default Home;
 
