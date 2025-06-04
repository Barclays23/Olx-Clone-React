import React, { useContext, useEffect, useState } from 'react';
import './Posts.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { PostContext } from '../../contexts/PostContext';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostCard from '../PostCard/PostCard';

function Posts() {
   const [products, setProducts] = useState([]);
   const [wishlist, setWishlist] = useState([]);
   const { setPostDetails } = useContext(PostContext);
   const { currentUser } = useContext(AuthContext);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const allProducts = querySnapshot.docs.map((doc) => {
               const data = doc.data();
               return {
                  id: doc.id,
                  ...data, // Spread all document data
                  createdAt: data.createdAt.toDate().toLocaleDateString('en-IN', {
                     day: '2-digit',
                     month: 'short',
                     year: 'numeric',
                  }),
               };
            });
            setProducts(allProducts);
            
         } catch (error) {
            console.error('Error fetching posts:', error);
         }
      };

      const fetchWishlist = async () => {
         if (!currentUser) {
            setWishlist([]);
            return;
         }
         try {
            const q = query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            const wishlistIds = querySnapshot.docs.map((doc) => doc.data().productId);
            setWishlist(wishlistIds);
         } catch (error) {
            console.error('Error fetching wishlist:', error);
         }
      };

      fetchProducts();
      fetchWishlist();
   }, [currentUser]);

   const handleCardClick = (product) => {
      setPostDetails(product);
      navigate('/view-product');
   };

   const handleWishlistToggle = (productId, isAdded) => {
      setWishlist((prev) =>
         isAdded ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
   };

   return (
      <div className="postParentDiv">
         <div className="recommendations">
            <div className="heading">
               <span>Fresh Recommendations</span>
            </div>
            <div className="cards products">
               {products.map((product) => (
                  <PostCard
                     key={product.id}
                     product={product}
                     onClick={() => handleCardClick(product)}
                     isWishlisted={wishlist.includes(product.id)}
                     onWishlistToggle={handleWishlistToggle}
                  />
               ))}
            </div>
         </div>
      </div>
   );
}

export default Posts;