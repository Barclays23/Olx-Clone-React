import React, { useContext, useEffect, useState } from 'react';

import Heart from '../../assets/Heart';
import './Post.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { PostContext } from '../../contexts/PostContext';
import { useNavigate } from 'react-router-dom';




function Posts() {
   const [products, setProducts] = useState([]);

   const {setPostDetails} = useContext(PostContext);
   const navigate = useNavigate(); 

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const querySnapshot = await getDocs(collection(db, "products"));
            
            const allProducts = [];

            querySnapshot.forEach((doc) => {
               allProducts.push({ 
                  id: doc.id,
                  // ...doc.data()
                  category: doc.data().category,
                  productName: doc.data().productName,
                  price: doc.data().price,
                  imageUrl: doc.data().imageUrl,
                  createdAt: doc.data().createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                  userId: doc.data().userId,
               });
            });
            setProducts(allProducts);
            
         } catch (error) {
            console.error("Error fetching posts:", error);
         }
      };

      fetchProducts();
   }, []);


   const handleCardClick = (product) => {
      setPostDetails(product);
      navigate('/view-product');
   };


   return (
      <div className="postParentDiv">
         
         <div className="recommendations">
            <div className="heading">
               <span>Fresh Recommendations</span>
            </div>

            <div className="cards products">
               {products.map((product) => (
                  <div
                     className="product-card"
                     onClick={() => handleCardClick(product)}
                     key={product.id}>
                     <div className="image">
                        <div className="favorite">
                           <Heart />
                        </div>
                        <img src={product.imageUrl} alt={product.productName} />
                     </div>
                     <div className="content">
                        <p className="price">&#x20B9; {product.price}</p>
                        <p className="product-name"> {product.productName} </p>
                        <span className="category"> {product.category} </span>
                     </div>
                     <div className="date">
                        <span> {product.createdAt} </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}

export default Posts;
