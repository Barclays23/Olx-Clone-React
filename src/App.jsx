import React from 'react';
// import './App.css';
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { PostContextProvider } from './contexts/PostContext';


import Home from './Pages/Home';
import SignupPage from './Pages/Signup';
import LoginPage from './Pages/Login';
import CreatePage from './Pages/Create';
import ViewPost from './Pages/ViewPost';
import Profile from './Pages/Profile/Profile';
import Wishlist from './Pages/Wishlist/Wishlist';
import Navbar from './Components/Navbar/Navbar';
import UserAds from './Pages/UserAds/UserAds';
// import Review from './Pages/Review';





function App() {

  return (
      <div>
         <ToastContainer />
         <PostContextProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
               <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/signup' element={<SignupPage />} />
                  <Route path='/login' element={<LoginPage />} />
                  <Route path='/create' element={<CreatePage />} />
                  <Route path='/view-product' element={<ViewPost />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/my-ads" element={<UserAds />} />
               </Routes>
            </Router>
         </PostContextProvider>
      </div>
  )
}

export default App
