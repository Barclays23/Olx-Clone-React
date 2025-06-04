import React, { useContext, useEffect, useState } from 'react';
import './ProductDetails.css';
import { PostContext } from '../../contexts/PostContext';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';





function ProductDetails() {
   const [ownerDetails, setOwnerDetails] = useState(null);

   const {postDetails} = useContext(PostContext);

   const navigate = useNavigate()



   useEffect(() => {
      const fetchUserDetails = async () => {
         if (postDetails && postDetails.userId) {
            try {
               const userRef = doc(db, 'users', postDetails.userId);
               const userSnap = await getDoc(userRef);
      
               if (userSnap.exists()) {
                  setOwnerDetails(userSnap.data());
               } else {
                  console.log('No such user!');
               }
            } catch (error) {
               console.error('Error fetching user details :', error);
            }
         } else {
            setTimeout(() => {
               navigate('/');
            }, 500);
         }
      };
    
      fetchUserDetails();
   }, [postDetails]);
    


   if (!postDetails || !ownerDetails) {
      return <div className="loading-spinner">Loading...</div>;
   }
  


   return (
      <div className="productContainer">

         <div className="imageSection">
            <img src={postDetails.imageUrl} alt={postDetails.productName} />
         </div>
         
         <div className="detailsSection">
            <div className="productCard">
               <p className="price"> ₹{postDetails.price} </p>
               <span className="title"> {postDetails.productName} </span>
               <p className="category"> {postDetails.category} </p>
               <span className="date"> {postDetails.createdAt} </span>
               {/* <p className="location"> Location info not provided </p> */}
               <p className="location">{postDetails.location?.address || 'Location not available'}</p>
            </div>

            <div className="sellerCard">
               <p className="sellerTitle">Posted by</p>
               <div className="sellerInfo">
                  <div className="avatar"></div>
                  <div>
                     <p className="sellerName"> {ownerDetails.username} </p>
                     <p className="sellerPhone"> {ownerDetails.phone} </p>
                  </div>
               </div>
               <button className="chatButton">Chat with seller</button>
            </div>
         </div>
      </div>
   );
}

export default ProductDetails;
