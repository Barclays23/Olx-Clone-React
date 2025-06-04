import React, { useContext, useState, useEffect } from 'react';
import './PostCard.css';
import { AuthContext } from '../../contexts/AuthContext';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from "react-icons/fa6";

function PostCard({ product, onClick, isWishlisted, onWishlistToggle }) {
   const { currentUser } = useContext(AuthContext);
   const [wishlisted, setWishlisted] = useState(isWishlisted);

   useEffect(() => {
      setWishlisted(isWishlisted);
   }, [isWishlisted]);

   const handleWishlistClick = async (e) => {
      e.stopPropagation(); // Prevent triggering the card's onClick
      if (!currentUser) {
         toast.error('Please log in to add items to your wishlist.', {
            position: 'top-center',
            theme: 'dark',
            autoClose: 3000,
         });
         return;
      }

      try {
         const wishlistRef = collection(db, 'wishlist');
         const wishlistDocRef = doc(wishlistRef, `${currentUser.uid}_${product.id}`);

         if (wishlisted) {
            // Remove from wishlist
            await deleteDoc(wishlistDocRef);
            setWishlisted(false);
            toast.success('Removed from wishlist!', {
               position: 'top-center',
               theme: 'dark',
               autoClose: 3000,
            });
         } else {
            // Add to wishlist
            await setDoc(wishlistDocRef, {
               userId: currentUser.uid,
               productId: product.id,
               addedAt: new Date(),
            });
            setWishlisted(true);
            toast.success('Added to wishlist!', {
               position: 'top-center',
               theme: 'dark',
               autoClose: 3000,
            });
         }
         onWishlistToggle(product.id, !wishlisted);
      } catch (error) {
         console.error('Error updating wishlist:', error);
         toast.error('Failed to update wishlist. Please try again.', {
            position: 'top-center',
            theme: 'colored',
         });
      }
   };



   return (
      
      <div className="product-card" onClick={onClick}>
         <div className="image">
            <div className="favorite" onClick={handleWishlistClick}>
               {wishlisted ? <FaHeart /> : <FaRegHeart />}
            </div>
            <img src={product.imageUrl} alt={product.productName} />
         </div>
         <div className="content">
            <p className="price">₹ {product.price}</p>
            <p className="product-name">{product.productName}</p>
            <span className="category">{product.category}</span>
         </div>
         <div className="date and location">
            <p className="location">{product.location?.address || 'Location not available'}</p>
            <span>{product.createdAt}</span>
         </div>
      </div>
   );
}

export default PostCard;