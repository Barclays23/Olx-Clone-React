import React, { useState, useRef } from 'react';
import './DeleteAdModal.css';
import { toast } from 'react-toastify';
import { doc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../services/firebase';




function DeleteAdModal({ productId, userId, onClose, onDelete }) {
   const [password, setPassword] = useState('');
   const [passwordError, setPasswordError] = useState('');
   const [loading, setLoading] = useState(false);
   const modalRef = useRef(null);

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (loading) return;

      setPasswordError('');

      if (!password.trim()) {
         setPasswordError('Password is required');
         return;
      }

      try {
         setLoading(true);
         const user = auth.currentUser;
         if (!user) {
            setPasswordError('No user is signed in');
            setLoading(false);
            return;
         }

         // Re-authenticate the user
         await signInWithEmailAndPassword(auth, user.email, password);

         // Verify userId matches
         if (user.uid !== userId) {
            setPasswordError('You are not authorized to delete this ad');
            setLoading(false);
            return;
         }

         // Delete the product from Firestore
         await deleteDoc(doc(db, 'products', productId));
         toast.success('Your Ad has been deleted successfully!', { position: 'top-center', theme: 'dark', autoClose: 3000 });
         
         setLoading(false);
         onDelete();
      } catch (error) {
         console.error('Error deleting product:', error.code);
         const errorMessage = getErrorMessage(error.code);
         setPasswordError(errorMessage);
         toast.error(errorMessage, { position: 'top-center', theme: 'dark', autoClose: 3000 });
         setLoading(false);
      }
   };

   const getErrorMessage = (errorCode) => {
      if (!errorCode) return 'An unknown error occurred. Please try again.';
      const errorMap = {
         'auth/wrong-password': 'Incorrect password. Please try again.',
         'auth/too-many-requests': 'Too many attempts. Please try again later.',
         'auth/invalid-credential': 'Invalid credentials. Please check your password.',
         'permission-denied': 'You do not have permission to delete this ad.',
         'unavailable': 'Firestore service is temporarily unavailable.',
      };
      return errorMap[errorCode] || 'An unexpected error occurred. Please try again.';
   };

   const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
         onClose();
      }
   };

   React.useEffect(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
         document.removeEventListener('mousedown', handleOutsideClick);
      };
   }, []);

   return (
      <div className="modal-overlay">
         <div className="modal-container">
            <div className="deleteModal" ref={modalRef}>
               <button className="close-button" onClick={onClose} aria-label="Close modal">
                  ×
               </button>
               <h2>Confirm Deletion</h2>
               <p>Enter your password to confirm the deletion of this ad.</p>
               <form onSubmit={handleSubmit}>
                  <label htmlFor="password">Password</label>
                  <input
                     type="password"
                     id="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="input"
                     placeholder="Enter your password"
                  />
                  {passwordError && <p className="input-error">{passwordError}</p>}
                  <div className="buttonRow">
                     <button
                        type="button"
                        className="cancelBtn"
                        onClick={onClose}
                        disabled={loading} >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        className="deleteConfirmBtn"
                        disabled={loading} >
                        {loading ? 'Deleting...' : 'Delete Ad'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}

export default DeleteAdModal;