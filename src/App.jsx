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
               </Routes>
            </Router>
         </PostContextProvider>
      </div>
  )
}

export default App
