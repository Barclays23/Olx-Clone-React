import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './Wishlist.css';
import Navbar from '../../Components/Navbar/Navbar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { PostContext } from '../../contexts/PostContext';
import PostCard from '../../Components/PostCard/PostCard';
import Footer from '../../Components/Footer/Footer';



function Wishlist() {
   const { currentUser } = useContext(AuthContext);
   const { setPostDetails } = useContext(PostContext);
   const [wishlistItems, setWishlistItems] = useState([]);
   const navigate = useNavigate();




   useEffect(() => {
      if (!currentUser) {
         setWishlistItems([]);
         return;
      }

      const fetchWishlistItems = async () => {
         try {
            const wishlistQuery = query(
               collection(db, 'wishlist'),
               where('userId', '==', currentUser.uid)
            );
            const wishlistSnapshot = await getDocs(wishlistQuery);
            const productIds = wishlistSnapshot.docs.map((doc) => ({
               wishlistDocId: doc.id,
               productId: doc.data().productId,
            }));

            const productPromises = productIds.map(async (item) => {
               const productDoc = await getDocs(
                  query(collection(db, 'products'), where('__name__', '==', item.productId))
               );
               if (!productDoc.empty) {
                  const doc = productDoc.docs[0];
                  const data = doc.data();
                  return {
                     wishlistDocId: item.wishlistDocId,
                     id: doc.id,
                     ...data, // Spread all document data
                     createdAt: data.createdAt.toDate().toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                     }),
                  };
               }
               return null;
            });

            const products = (await Promise.all(productPromises)).filter((item) => item !== null);
            setWishlistItems(products);
            
         } catch (error) {
            console.error('Error fetching wishlist items:', error);
            if (error.code === 'permission-denied') {
               toast.error('You do not have permission to access your wishlist.', {
                  position: 'top-center',
                  theme: 'colored',
               });
            } else {
               toast.error('Failed to load wishlist. Please try again.', {
                  position: 'top-center',
                  theme: 'colored',
               });
            }
         }
      };

      fetchWishlistItems();
   }, [currentUser]);

   const handleWishlistToggle = (productId, isAdded) => {
      if (!isAdded) {
         // Remove item from wishlistItems when un-wishlisted
         setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
         // NO NEED TO SHOW THE TOAST. BECOZ THE TOAST FROM 'PostCard' WILL TRIGGER IT AND WILL SHOW.
         // toast.success('Removed from wishlist!', {
         //    position: 'top-center',
         //    theme: 'dark',
         //    autoClose: 3000,
         // });
      }
   };

   const handleCardClick = (product) => {
      setPostDetails(product);
      navigate('/view-product');
   };

if (!currentUser) {
   return (
      <>
         <Navbar />
         <div className="wishlist-container">
            <h1>My Wishlist</h1>
            <div className="wishlist-content">
               <p>Please log in to view your wishlist.</p>
            </div>
         </div>
      </>
   );
}

return (
   <>
      <Navbar />
      <div className="wishlist-container">
         <h1>My Wishlist</h1>
         <div className="wishlist-content">
            {wishlistItems.length === 0 ? (
               <p>
                  No items in your wishlist yet. Start adding items by clicking the heart icon on
                  listings!
               </p>
            ) : (
               <div className="wishlist-items">
                  {wishlistItems.map((item) => (
                     <PostCard
                        key={item.id}
                        product={item}
                        onClick={() => handleCardClick(item)}
                        isWishlisted={true}
                        onWishlistToggle={handleWishlistToggle}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
      <Footer/>
   </>
);
}

export default Wishlist;
