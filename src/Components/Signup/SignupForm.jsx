import React, { useContext, useEffect, useState } from 'react';
import './SignupForm.css';
import { Link, useNavigate } from 'react-router-dom'; // optional if using React Router

import { AuthContext } from '../../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from "../../services/firebase";
import { doc, setDoc } from 'firebase/firestore';

import { toast } from 'react-toastify';
import LoadingSpinner1 from '../LoadingSpinner/LoadingSpinner1/LoadingSpinner1';




export default function SignupForm() {
   const [username, setUsername] = useState('')
   const [email, setEmail] = useState('')
   const [phone, setPhone] = useState('')
   const [password, setPassword] = useState('')
   const [confirmPassword, setConfirmPassword] = useState('');

   const [usernameError, setUsernameError] = useState('');
   const [emailError, setEmailError] = useState('');
   const [phoneError, setPhoneError] = useState('');
   const [passwordError, setPasswordError] = useState('');
   const [confirmPasswordError, setConfirmPasswordError] = useState('');



   // local loading state for form submission, another loading below for authLoading
   const [loading, setLoading] = useState(false);

   const [errorMessage, setErrorMessage] = useState('');

   const { signUp, currentUser, loading: authLoading } = useContext(AuthContext);


   const navigate = useNavigate();
   

   
   const handleSubmit = async (e) => {
      e.preventDefault();
      setErrorMessage('');

      setUsernameError('');
      setEmailError('');
      setPhoneError('');
      setPasswordError('');

      let hasInputError = false;

      if (!username.trim()) {
         setUsernameError('Username is required');
         hasInputError = true;
      }

      if (!email.trim()) {
         setEmailError('Email is required');
         hasInputError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         setEmailError('Please enter a valid email address');
         hasInputError = true;
      }

      if (!phone.trim()) {
         setPhoneError('Phone number is required');
         hasInputError = true;
      } else if (!/^\d{10}$/.test(phone)) {
         setPhoneError('Please enter a valid 10-digit phone number');
         hasInputError = true;
      }

      if (!password.trim()) {
         setPasswordError('Password is required');
         hasInputError = true;
      } else if (password.length < 6) {
         setPasswordError('Password must be at least 6 characters');
         hasInputError = true;
      }

      if (!confirmPassword.trim()) {
         setConfirmPasswordError('Please confirm your password');
         hasInputError = true;
      } else if (confirmPassword !== password) {
         setConfirmPasswordError('Passwords do not match');
         hasInputError = true;
      }



      if (hasInputError) {
         setLoading(false);
         return;
      }


      setLoading(true);
      console.log(username, email, phone, password);

      try {
         setLoading(true);
         const userCredentials = await signUp(email, password); // passing to AuthContext
         setLoading(false);
         // console.log('userCredentials : ', userCredentials)
         const user = userCredentials.user;
         
         await updateProfile(user, { displayName: username });
         
         await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username,
            phone: phone,
         });
         console.log('Data written to Firestore : ', { id: user.uid, username, phone });
         
         toast.success('Account created successfully!', { position: "top-center", theme:"dark", autoClose: 3000 });
         setTimeout(() => {
            navigate("/login");
         }, 1000);
         
      } catch (error) {
         setLoading(false);
         const message = getErrorMessage(error.code);
         console.log('errorMessage :', message);
         setErrorMessage(message);
         toast.error(message, { position: "top-center", theme:"dark", autoClose: 3000 });
      }
   
   };


   const getErrorMessage = (errorCode) => {
      switch (errorCode) {
      case 'auth/email-already-in-use':
         return 'This email address is already in use.';
      case 'auth/invalid-email':
         return 'The email address is invalid.';
      case 'auth/weak-password':
         return 'The password is too weak. It should be at least 6 characters.';
      case 'auth/missing-email':
         return 'Please enter an email address.';
      case 'auth/missing-password':
         return 'Please enter a password.';
      case 'auth/operation-not-allowed':
         return 'Email/password accounts are not enabled.';
      case 'auth/invalid-phone-number':
         return 'The phone number is invalid.';
      default:
         return 'An unknown error occurred. Please try again.';
      }
   }

   // redirect if already logged in
   useEffect(() => {
      if (!authLoading && currentUser) {
         navigate("/");
      }
   }, [currentUser, authLoading, navigate]);
    

   // Show spinner while checking auth || form submission
   if (authLoading || loading) {
      return <LoadingSpinner1 />
   }

   return (
      <div className='container'>
         <div className="signupParentDiv">
            <img src="../../../Images/olx-logo.png" alt="Banner" width="150px" height="auto" />
            <form onSubmit={handleSubmit}>
               <label htmlFor="username">Username</label>
               <input
                  value={username}
                  onChange={(e)=>{setUsername(e.target.value)}}
                  className="input"
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter username"
               />
               {usernameError && <p className="input-error">{usernameError}</p>}
               
               <label htmlFor="email">Email</label>
               <input
                  value={email}
                  onChange={(e)=>{setEmail(e.target.value)}}
                  className="input"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email"
               />
               {emailError && <p className="input-error">{emailError}</p>}

               <label htmlFor="phone">Phone</label>
               <input
                  value={phone}
                  onChange={(e)=>{setPhone(e.target.value)}}
                  className="input"
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
               />
               {phoneError && <p className="input-error">{phoneError}</p>}

               <label htmlFor="password">Password</label>
               <input
                  value={password}
                  onChange={(e)=>{setPassword(e.target.value)}}
                  className="input"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
               />
               {passwordError && <p className="input-error">{passwordError}</p>}

               <label htmlFor="confirmPassword">Confirm Password</label>
               <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm password"
               />
               {confirmPasswordError && <p className="input-error">{confirmPasswordError}</p>}

               <button type="submit" disabled={loading}>
                  {loading ? 'Signing Up...' : 'Signup'}
               </button>
            </form>

            <div className='login-link'>
               <span>Already have an account?</span>
               <Link to="/login">Login</Link>
            </div>
            <div className='home-link'>
               <Link to="/">Back to Home</Link>
            </div>
         </div>
      </div>
   );
}
