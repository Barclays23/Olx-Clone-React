import React, { useContext, useEffect, useState } from 'react';
import './LoginForm.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner1 from '../LoadingSpinner/LoadingSpinner1/LoadingSpinner1';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';





export default function LoginForm() {
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')

   const [emailError, setEmailError] = useState('');
   const [passwordError, setPasswordError] = useState('');
   const [generalError, setGeneralError] = useState('');

   // local loading state for form submission, another loading below for authLoading
   const [loading, setLoading] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   
   const [showResetForm, setShowResetForm] = useState(false);



   const { signIn, currentUser, loading: authLoading } = useContext(AuthContext);
   const navigate = useNavigate();


   // redirect if already logged in
   useEffect(() => {
      if (!authLoading && currentUser) {
         navigate('/');
      }
   }, [authLoading, currentUser, navigate]);


   const handleLoginFormSubmit = async (e) => {
      e.preventDefault();
      
      setErrorMessage('');
      setEmailError('');
      setPasswordError('');
      setGeneralError('');

      let hasInputError = false;

      if (!email.trim()) {
         setEmailError("Email is required");
         hasInputError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         setEmailError("Please enter a valid email address");
         hasInputError = true;
      } else {
         setEmailError("");
      }


      if (!password.trim()) {
         setPasswordError("Password is required");
         hasInputError = true;
      } else if (password.length < 6) {
         setPasswordError("Password must be at least 6 characters");
         hasInputError = true;
      } else {
         setPasswordError("");
      }


      if (hasInputError) return;

      
      try {
         setLoading(true);
         await signIn(email, password);  // passing to AuthContext
         setLoading(false);
         toast.success('Signed in successfully!', { position: "top-center", theme:"dark", autoClose: 3000 });
         setTimeout(() => {
            navigate("/");
         }, 1000);

      } catch (error) {
         // console.log('error in login :', err);
         setLoading(false);
         const message = getErrorMessage(error.code);
         console.log('errorMessage :', message);
         setErrorMessage(message);
         toast.error(message, { position: "top-center", theme:"colored", autoClose: 3000 });
      }

   };



   const handleForgotPassword = async (e) => {
      e.preventDefault();
      setEmailError('');

      if (!email.trim()) {
         setEmailError('Email is required');
         return;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         setEmailError('Please enter a valid email address');
         return;
      }

      try {
         setLoading(true);
         await sendPasswordResetEmail(auth, email);
         setLoading(false);
         toast.success('Password reset email has been sent to your mail. Please check inbox!', { position: 'top-center', theme: 'dark', autoClose: 3000 });
         setShowResetForm(false); // go back to login form
      } catch (error) {
         setLoading(false);
         const message = getErrorMessage(error.code);
         toast.error(message, { position: 'top-center', theme: 'colored', autoClose: 3000 });
      }
   };


   // Helper function to map Firebase error codes to user-friendly messages
   const getErrorMessage = (errorCode) => {
      switch (errorCode) {
      case 'auth/invalid-credential':
         return 'Invalid email or password.';
      case 'auth/user-not-found':
         return 'No user found with this email.';
      case 'auth/wrong-password':
         return 'Incorrect password.';
      case 'auth/invalid-email':
         return 'Invalid email format.';
      case 'auth/too-many-requests':
         return 'Too many attempts. Please try again later.';
      default:
         return 'An error occurred. Please try again.';
      }
   };


   

   // Show spinner while checking auth status|| form submission
   if (authLoading || loading) {
      return <LoadingSpinner1 />
   }
   

   return (
      <div className="container">
         <div className="loginParentDiv">
            <img
               src="../../../Images/olx-logo.png"
               alt="Banner"
               width="150px"
               height="auto"
            />

            <form
               onSubmit={
                  showResetForm ? handleForgotPassword : handleLoginFormSubmit
               }>
               
               <label htmlFor="email">Email</label>
               <input
                  value={email}
                  onChange={(e) => {
                     setEmail(e.target.value);
                  }}
                  className="input"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email"
               />
               {emailError && <p className="input-error">{emailError}</p>}

               {!showResetForm && (
                  <>
                     <label htmlFor="password">Password</label>
                     <input
                        value={password}
                        onChange={(e) => {
                           setPassword(e.target.value);
                        }}
                        className="input"
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter password"
                     />
                     {passwordError && <p className="input-error">{passwordError}</p>}
                     <br />

                     <div className="forgot-link-wrapper">
                        <span
                           className="forget-password-link"
                           onClick={() => setShowResetForm(true)}
                        >
                           Forgot Password?
                        </span>
                     </div>
                     <br />
                  </>
               )}

               {showResetForm ? (
                  <button type="submit" disabled={loading}>
                     Send Reset Email
                  </button>
               ) : (
                  <button type="submit" disabled={loading}>
                     {loading ? "Logging in..." : "Login"}
                  </button>
               )}
            </form>

            {showResetForm && (
               <div className='login-link'>
                  <span>← Back to</span>
                  <Link
                     className='cursor-pointer hover:text-red-600'
                     onClick={() => setShowResetForm(false)}>
                     Login
                  </Link>
               </div>
            )}

            <div className="login-link">
               <span>Don't have an account?</span>
               <Link to="/signup">Signup</Link>
            </div>

            <div className="home-link">
               <Link to="/">Back to Home</Link>
            </div>
         </div>
      </div>
   );
}
