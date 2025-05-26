import React, { Fragment, useContext, useEffect, useState } from 'react';
import './CreateForm.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { db, storage } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner1 from '../LoadingSpinner/LoadingSpinner1/LoadingSpinner1';

const CreateForm = () => {
   const [category, setCategory] = useState('Select Category');
   const [product, setProduct] = useState('');
   const [price, setPrice] = useState('');
   const [image, setImage] = useState(null);
   const [imagePreview, setImagePreview] = useState('');
   const [uploadProgress, setUploadProgress] = useState(0);
   const [smoothProgress, setSmoothProgress] = useState(0);
   const [loading, setLoading] = useState(false);
   const [spinLoading, setSpinLoading] = useState(false);
   const [categoryError, setCategoryError] = useState('');
   const [productError, setProductError] = useState('');
   const [priceError, setPriceError] = useState('');
   const [imageError, setImageError] = useState('');
   const { currentUser, loading: authLoading } = useContext(AuthContext);
   const navigate = useNavigate();

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      setImage(file);
      if (file) {
         const previewUrl = URL.createObjectURL(file);
         setImagePreview(previewUrl);
      }
   };

   const animateProgress = (target) => {
      let current = smoothProgress;
      const duration = 500;
      const steps = 20;
      const stepTime = duration / steps;
      const increment = (target - current) / steps;

      return new Promise((resolve) => {
         const interval = setInterval(() => {
            current += increment;
            if ((increment >= 0 && current >= target) || (increment < 0 && current <= target)) {
               current = target;
               clearInterval(interval);
               resolve();
            }
            setSmoothProgress(current);
         }, stepTime);
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (loading) return;

      let hasInputError = false;
      setCategoryError('');
      setProductError('');
      setPriceError('');
      setImageError('');

      if (category === 'Select Category') {
         setCategoryError("Please choose a category");
         hasInputError = true;
      }

      if (!product.trim()) {
         setProductError("Product name is required");
         hasInputError = true;
      }

      const priceNumber = Number(price);
      if (!price.trim()) {
         setPriceError("Price is required");
         hasInputError = true;
      } else if (isNaN(priceNumber) || priceNumber <= 0) {
         setPriceError("Price should be a valid positive number");
         hasInputError = true;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!image) {
         setImageError("Please select an image first");
         hasInputError = true;
      } else if (image && !allowedTypes.includes(image.type)) {
         setImageError("Please upload a valid image file (jpg, png, webp)");
         hasInputError = true;
      }

      if (hasInputError) return;

      try {
         setLoading(true);
         const {uid} = currentUser;
         console.log('currentUser uid :', uid);

         const storageRef = ref(storage, `product-images/${uid}/${image.name}_${Date.now()}`);
         // const storageRef = ref(storage, `product-images/${image.name}_${Date.now()}`);
         const uploadTask = uploadBytesResumable(storageRef, image);

         uploadTask.on(
            'state_changed',
            (snapshot) => {
               const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
               setUploadProgress(progress);
               animateProgress(progress);
               console.log(`Upload is ${progress}% done`);
            },
            (error) => {
               console.error("Upload failed :", error.code);
               const errorMessage = getErrorMessage(error.code);
               toast.error(`Image upload failed : ${errorMessage}`, { position: "top-center", theme: "colored" });
               setLoading(false);
            },
            async () => {
               const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
               await addDoc(collection(db, "products"), {
                  category: category,
                  productName: product,
                  price: Number(price),
                  imageUrl: downloadURL,
                  createdAt: Timestamp.now(),
                  userId: currentUser.uid
               });

               await animateProgress(100);
               toast.success('Product uploaded successfully!', { position: "top-center", theme: "dark", autoClose: 3000 });

               setTimeout(() => {
                  setCategory('Select Category');
                  setProduct('');
                  setPrice('');
                  setImage(null);
                  setImagePreview('');
                  setUploadProgress(0);
                  setSmoothProgress(0);
                  setLoading(false);
                  setSpinLoading(true);
               }, 500);

               setTimeout(() => {
                  setSpinLoading(false);
               }, 1500);
            }
         );
      } catch (error) {
         console.error("Error saving product :", error.code);
         const errorMessage = getErrorMessage(error.code);
         toast.error(`Failed to add product : ${errorMessage}`, { position: "top-center", theme: "colored" });
         setLoading(false);
      }
   };

   const getErrorMessage = (errorCode) => {
      if (!errorCode) return 'An unknown error occurred. Please try again.';
      const errorMap = {
         'storage/unauthorized': 'You do not have permission to upload files.',
         'storage/canceled': 'Upload was canceled.',
         'storage/unknown': 'An unknown storage error occurred.',
         'storage/retry-limit-exceeded': 'Retry limit exceeded. Please try again.',
         'storage/quota-exceeded': 'Storage quota exceeded. Contact support.',
         'storage/invalid-argument': 'Invalid upload argument.',
         'storage/invalid-checksum': 'File checksum does not match. Please re-upload.',
         'storage/not-found': 'Storage object not found.',
         'storage/server-file-wrong-size': 'File size mismatch on server.',
         'permission-denied': 'You do not have permission for this operation.',
         'unavailable': 'Firestore service is temporarily unavailable.',
         'cancelled': 'Operation cancelled.',
         'resource-exhausted': 'Quota exhausted, try later.',
      };
      return errorMap[errorCode] || 'An unexpected error occurred. Please try again.';
   };

   useEffect(() => {
      return () => {
         if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
         }
      };
   }, [imagePreview]);

   if (spinLoading) {
      return <LoadingSpinner1 />;
   }

   return (
      <Fragment>
         <Navbar />
         <div className="container">
            <div className="createParentDiv">
               <img
                  className="logo"
                  src="../../../Images/olx-logo.png"
                  alt="Banner"
                  width="150px"
                  height="auto"
               />
               <form onSubmit={handleSubmit}>
                  <label htmlFor="category">Category</label>
                  <select
                     onChange={(e) => setCategory(e.target.value)}
                     value={category}
                     className="input"
                     id="category"
                     name="category"
                  >
                     <option value="Select Category">Select Category</option>
                     <option value="Accessories">Accessories</option>
                     <option value="Agriculture">Agriculture</option>
                     <option value="Bicycles">Bicycles</option>
                     <option value="Books">Books</option>
                     <option value="Electronics">Electronics</option>
                     <option value="Fashion">Fashion</option>
                     <option value="Furniture">Furniture</option>
                     <option value="Gaming">Gaming</option>
                     <option value="Hobbies">Hobbies</option>
                     <option value="Home Appliances">Home Appliances</option>
                     <option value="Industrial Equipment">Industrial Equipment</option>
                     <option value="Jobs">Jobs</option>
                     <option value="Kids & Babies">Kids & Babies</option>
                     <option value="Mobiles">Mobiles</option>
                     <option value="Musical Instruments">Musical Instruments</option>
                     <option value="Pets">Pets</option>
                     <option value="Real Estate">Real Estate</option>
                     <option value="Services">Services</option>
                     <option value="Sports & Fitness">Sports & Fitness</option>
                     <option value="Vehicles">Vehicles</option>
                  </select>
                  {categoryError && <p className="input-error">{categoryError}</p>}

                  <label htmlFor="fname">Product Name</label>
                  <input
                     onChange={(e) => setProduct(e.target.value)}
                     className="input"
                     type="text"
                     id="fname"
                     name="Name"
                     placeholder="HP Elite Book Laptop, Apple iPhone 16 ...."
                     value={product}
                  />
                  {productError && <p className="input-error">{productError}</p>}

                  <label htmlFor="price">Price</label>
                  <input
                     onChange={(e) => setPrice(e.target.value)}
                     className="input"
                     type="number"
                     id="price"
                     name="Price"
                     value={price}
                  />
                  {priceError && <p className="input-error">{priceError}</p>}

                  <div className="imagePreview">
                     {imagePreview && (
                        <img
                           alt="Preview"
                           width="200px"
                           height="auto"
                           src={imagePreview}
                        />
                     )}
                  </div>
                  <input type="file" onChange={handleImageChange} />
                  {imageError && <p className="input-error">{imageError}</p>}

                  <button className="uploadBtn" type="submit" disabled={loading}>
                     {loading ? (
                        <>
                           <div
                              className="upload-progress-fill"
                              style={{ width: `${Math.round(smoothProgress)}%` }}
                           ></div>
                           <span className="upload-progress-text">
                              Uploading... {Math.round(smoothProgress)}%
                           </span>
                        </>
                     ) : (
                        "Upload and Submit"
                     )}
                  </button>
               </form>
            </div>
         </div>
         <Footer />
      </Fragment>
   );
};

export default CreateForm;