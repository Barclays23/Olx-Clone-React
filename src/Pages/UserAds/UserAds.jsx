import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './UserAds.css';
import Navbar from '../../Components/Navbar/Navbar';
import UserAdCard from '../../Components/UserAdCard/UserAdCard';
import EditAdModal from '../../Components/EditAdModal/EditAdModal';
import DeleteAdModal from '../../Components/DeleteAdModal/DeleteAdModal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';




function UserAds() {
   const { currentUser } = useContext(AuthContext);
   const [products, setPosts] = useState([]);
   const [isEditModalOpen, setEditModalOpen] = useState(false);
   const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState(null);



   useEffect(() => {
      if (!currentUser) return;

      const fetchAds = async () => {
         try {
            const q = query(collection(db, 'products'), where('userId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            
            const userAds = querySnapshot.docs.map((doc) => {
               const data = doc.data();
               return {
                  id: doc.id,
                  ...data, // This includes ALL fields from the document
                  createdAt: data.createdAt.toDate().toLocaleDateString('en-IN', {
                     day: '2-digit',
                     month: 'short',
                     year: 'numeric',
                  }),
               };
            });
            
            setPosts(userAds);
            
         } catch (error) {
            console.error('Error fetching user ads:', error);
         }
      };

      fetchAds();
   }, [currentUser]);

   const handleEdit = (product) => {
      setSelectedProduct(product);
      setEditModalOpen(true);
   };

   const handleDelete = (product) => {
      setSelectedProduct(product);
      setDeleteModalOpen(true);
   };

   const handleUpdate = (updatedProduct) => {
      setPosts((prev) =>
         prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
      );
   };

   const handleDeleteSuccess = (productId) => {
      setPosts((prev) => prev.filter((p) => p.id !== productId));
      setDeleteModalOpen(false);
      setSelectedProduct(null);
   };

   const handleCloseEditModal = () => {
      setEditModalOpen(false);
      setSelectedProduct(null);
   };

   const handleCloseDeleteModal = () => {
      setDeleteModalOpen(false);
      setSelectedProduct(null);
   };

   if (!currentUser) {
      return (
         <>
            <Navbar />
            <div className="myads-container">
               <h1>My Ads</h1>
               <div className="myads-content">
                  <p>Please log in to view your ads.</p>
               </div>
            </div>
         </>
      );
   }

   return (
      <>
         <Navbar />
         <div className="myads-container">
            <h1>My Ads</h1>
            <div className="myads-content">
               {products.length === 0 ? (
                  <p>No ads posted yet. Start selling by clicking the "SELL" button!</p>
               ) : (
                  <div className="cards">
                     {products.map((product) => (
                        <UserAdCard
                           key={product.id}
                           product={product}
                           onEdit={() => handleEdit(product)}
                           onDelete={() => handleDelete(product)}
                        />
                     ))}
                  </div>
               )}
            </div>
         </div>
         {isEditModalOpen && (
            <EditAdModal
               product={selectedProduct}
               onClose={handleCloseEditModal}
               onSubmit={handleUpdate}
            />
         )}
         {isDeleteModalOpen && (
            <DeleteAdModal
               productId={selectedProduct.id}
               userId={selectedProduct.userId}
               onClose={handleCloseDeleteModal}
               onDelete={() => handleDeleteSuccess(selectedProduct.id)}
            />
         )}
      </>
   );
}

export default UserAds;