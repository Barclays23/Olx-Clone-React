import React from 'react';
import { Link } from 'react-router-dom';
import './PageNotFound.css'; // Import the CSS file

const PageNotFound = () => {
  return (
    <div className="notFoundContainer">
      {/* You can use an SVG or an image here */}
      {/* Replace with your own asset or an SVG icon */}
      <img
        src="https://i.imgur.com/qIufhof.png" // Placeholder: Sad magnifying glass or empty box
        alt="Not Found Illustration"
        className="notFoundImage"
      />
      <h1 className="errorCode">404</h1>
      <h2 className="title">Oops! Page Not Found.</h2>
      <p className="message">
        We're sorry, but the page you are looking for doesn't exist, has been removed,
        name changed, or is temporarily unavailable.
      </p>
      <div className="actionsContainer">
        <Link to="/" className="actionButton">
          Go to Homepage
        </Link>
        {/* Optional: Add a search button or other relevant actions.
          If you have a global search or want to redirect to a search page:
        */}
        {/*
        <Link to="/search" className="actionButton">
          Search Ads
        </Link>
        */}
      </div>
    </div>
  );
};

export default PageNotFound;