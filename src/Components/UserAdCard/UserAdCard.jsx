import React from 'react';
import './UserAdCard.css';




function UserAdCard({ product, onEdit, onDelete }) {
   return (
      <div className="product-card">
         <div className="image">
            <img src={product.imageUrl} alt={product.productName} />
         </div>
         <div className="content">
            <p className="price">₹ {product.price}</p>
            <p className="product-name">{product.productName}</p>
            <span className="category">{product.category}</span>
         </div>
         <div className="date">
            <span className="location">{product.location?.address || 'Location not provided'}</span>
            <br />
            <span>{product.createdAt}</span>
         </div>
         <div className="actions">
            <button className="edit-button" onClick={onEdit}>
               Edit
            </button>
            <button className="delete-button" onClick={onDelete}>
               Delete
            </button>
         </div>
      </div>
   );
}

export default UserAdCard;