import React, { useState, useEffect, useRef } from 'react';
import './EditAdModal.css';
import { toast } from 'react-toastify';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage, db } from '../../services/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Loader } from '@googlemaps/js-api-loader';

function EditAdModal({ product, onClose, onSubmit }) {
   const [category, setCategory] = useState(product.category);
   const [productName, setProductName] = useState(product.productName);
   const [price, setPrice] = useState(product.price.toString());
   const [image, setImage] = useState(null);
   const [imagePreview, setImagePreview] = useState(product.imageUrl);
   const [location, setLocation] = useState(product.location || null);
   const [locationError, setLocationError] = useState('');
   const [showMap, setShowMap] = useState(false);
   const [mapsLoaded, setMapsLoaded] = useState(false);
   const [mapsLoadError, setMapsLoadError] = useState(null);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [smoothProgress, setSmoothProgress] = useState(0);
   const [loading, setLoading] = useState(false);
   const [categoryError, setCategoryError] = useState('');
   const [productError, setProductError] = useState('');
   const [priceError, setPriceError] = useState('');
   const [imageError, setImageError] = useState('');
   const modalRef = useRef(null);
   const mapModalRef = useRef(null);
   const fileInputRef = useRef(null);
   const mapRef = useRef(null);
   const markerRef = useRef(null);
   const googleMapsRef = useRef(null);

   // Load Google Maps API
   useEffect(() => {
      const loadGoogleMaps = async () => {
         try {
            const loader = new Loader({
               apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
               version: "weekly",
               libraries: ["places", "marker"],
               mapIds: [import.meta.env.VITE_GOOGLE_MAP_ID]
            });

            const google = await loader.load();
            googleMapsRef.current = google;
            setMapsLoaded(true);
            setMapsLoadError(null);
         } catch (error) {
            console.error("Error loading Google Maps:", error);
            setMapsLoadError('Failed to load Google Maps. Please check your API key or network connection.');
            toast.error('Failed to load Google Maps. Please check your API key or network.', {
               position: 'top-center',
               theme: 'colored',
               autoClose: 5000,
            });
         }
      };

      if (!window.google) {
         loadGoogleMaps();
      } else {
         setMapsLoaded(true);
         setMapsLoadError(null);
      }
   }, []);

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      setImage(file);
      if (file) {
         const previewUrl = URL.createObjectURL(file);
         setImagePreview(previewUrl);
      }
   };

   const handleFileButtonClick = () => {
      fileInputRef.current.click();
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

   const initMap = async () => {
      if (!mapsLoaded || !googleMapsRef.current) {
         setMapsLoadError('Google Maps is not loaded yet. Please try again later.');
         toast.error('Google Maps is not loaded yet. Please try again later.', {
            position: 'top-center',
            theme: 'colored',
            autoClose: 5000,
         });
         return;
      }

      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
         console.error('Map container not found');
         setMapsLoadError('Map container not found. Please try again.');
         toast.error('Map container not found. Please try again.', {
            position: 'top-center',
            theme: 'colored',
            autoClose: 5000,
         });
         return;
      }

      if (mapRef.current) {
         return;
      }

      try {
         const { Map } = await googleMapsRef.current.maps.importLibrary("maps");
         const { AdvancedMarkerElement } = await googleMapsRef.current.maps.importLibrary("marker");
         const { Geocoder } = googleMapsRef.current.maps;

         const map = new Map(mapContainer, {
            center: location ? { lat: location.latitude, lng: location.longitude } : { lat: 20.5937, lng: 78.9629 },
            zoom: location ? 15 : 5,
            mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
         });

         mapRef.current = map;

         // If there's an existing location, set a marker
         if (location) {
            const markerElement = document.createElement('div');
            markerElement.style.width = '32px';
            markerElement.style.height = '32px';
            markerElement.style.backgroundImage = 'url("https://maps.google.com/mapfiles/kml/paddle/red-circle.png")';
            markerElement.style.backgroundSize = 'cover';

            const marker = new AdvancedMarkerElement({
               position: { lat: location.latitude, lng: location.longitude },
               map: map,
               content: markerElement,
            });

            markerRef.current = marker;
         }

         map.addListener('click', async (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            if (markerRef.current) {
               markerRef.current.map = null;
            }

            const markerElement = document.createElement('div');
            markerElement.style.width = '32px';
            markerElement.style.height = '32px';
            markerElement.style.backgroundImage = 'url("https://maps.google.com/mapfiles/kml/paddle/red-circle.png")';
            markerElement.style.backgroundSize = 'cover';

            const marker = new AdvancedMarkerElement({
               position: { lat, lng },
               map: map,
               content: markerElement,
            });

            markerRef.current = marker;

            const geocoder = new Geocoder();
            try {
               const response = await geocoder.geocode({ location: { lat, lng } });
               if (response.results[0]) {
                  const address = response.results[0].formatted_address;
                  setLocation({ lat, lng, address });
               } else {
                  setLocation({ lat, lng, address: 'Unknown location' });
               }
            } catch (error) {
               console.error('Geocoding failed:', error);
               setLocation({ lat, lng, address: 'Unknown location' });
               toast.error('Failed to retrieve location details. Using coordinates only.', {
                  position: 'top-center',
                  theme: 'colored',
                  autoClose: 5000,
               });
            }
         });
      } catch (error) {
         console.error('Error initializing map:', error);
         setMapsLoadError('Failed to initialize map. Please try again.');
         toast.error('Failed to initialize map. Please try again.', {
            position: 'top-center',
            theme: 'colored',
            autoClose: 5000,
         });
      }
   };

   const handleShowMap = () => {
      setShowMap(true);
      setMapsLoadError(null); // Reset error state when opening map
      setTimeout(() => {
         initMap();
      }, 100);
   };

   const handleCloseMap = () => {
      setShowMap(false);
      setMapsLoadError(null); // Clear error when closing map
      if (mapRef.current) {
         mapRef.current = null;
      }
      if (markerRef.current) {
         markerRef.current.map = null;
         markerRef.current = null;
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (loading) return;

      let hasInputError = false;
      setCategoryError('');
      setProductError('');
      setPriceError('');
      setImageError('');
      setLocationError('');

      if (category === 'Select Category') {
         setCategoryError('Please choose a category');
         hasInputError = true;
      }

      if (!productName.trim()) {
         setProductError("Product name is required");
         hasInputError = true;
      } else if (productName.trim().length > 25) {
         setProductError("Product name should not exceed 25 characters");
         hasInputError = true;
      } else if (!/^[a-zA-Z0-9][a-zA-Z0-9\s\-&.",']*$/.test(productName.trim())) {
         setProductError("Product name must start with a letter or number and contain only allowed characters.");
         hasInputError = true;
      } else if (!/^[a-zA-Z0-9\s\-&.",']+$/.test(productName.trim())) {
         setProductError("Product name can only contain letters, numbers, spaces, and selected symbols (-, &, ., ,, ').");
         hasInputError = true;
      } else if (!/[a-zA-Z]/.test(productName.trim())) {
         setProductError("Product name must include at least one letter.");
         hasInputError = true;
      } else if (productName.trim().length < 5) {
         setProductError("Product name must be at least 5 characters long");
         hasInputError = true;
      }

      const priceNumber = Number(price);
      if (!price.trim()) {
         setPriceError('Price is required');
         hasInputError = true;
      } else if (isNaN(priceNumber) || priceNumber <= 0) {
         setPriceError('Price should be a valid positive number');
         hasInputError = true;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!image && !imagePreview) {
         setImageError('Please select an image');
         hasInputError = true;
      } else if (image && !allowedTypes.includes(image.type)) {
         setImageError('Please upload a valid image file (jpg, png, webp)');
         hasInputError = true;
      }

      if (!location) {
         setLocationError("Please select a location");
         hasInputError = true;
      }

      if (hasInputError) {
         setLoading(false);
         return;
      }

      try {
         setLoading(true);
         let imageUrl = imagePreview;

         if (image) {
            const storageRef = ref(storage, `product-images/${product.userId}/${image.name}_${Date.now()}`);
            const uploadTask = uploadBytesResumable(storageRef, image);

            await new Promise((resolve, reject) => {
               uploadTask.on(
                  'state_changed',
                  (snapshot) => {
                     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                     setUploadProgress(progress);
                     animateProgress(progress);
                  },
                  (error) => {
                     reject(error);
                  },
                  async () => {
                     imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                     resolve();
                  }
               );
            });
         }

         const timestamp = Timestamp.now();
         const updatedProduct = {
            id: product.id,
            category,
            productName,
            price: priceNumber,
            imageUrl,
            location: {
               latitude: location.lat,
               longitude: location.lng,
               address: location.address,
            },
            createdAt: timestamp.toDate().toISOString(),
            userId: product.userId,
         };

         await updateDoc(doc(db, 'products', product.id), {
            category,
            productName,
            price: priceNumber,
            imageUrl,
            location: {
               latitude: location.lat,
               longitude: location.lng,
               address: location.address,
            },
            createdAt: timestamp,
         });
         await animateProgress(100);
         toast.success('Ad updated successfully!', { position: 'top-center', theme: 'dark', autoClose: 3000 });

         setLoading(false);
         onSubmit(updatedProduct);
         onClose();
      } catch (error) {
         console.error('Error updating product:', error.code);
         const errorMessage = getErrorMessage(error.code);
         toast.error(`Failed to update ad: ${errorMessage}`, { position: 'top-center', theme: 'colored' });
         setLoading(false);
      }
   };

   const getErrorMessage = (errorCode) => {
      if (!errorCode) return 'An unknown error occurred. Please try again.';
      const errorMap = {
         'storage/unauthorized': 'You do not have permission to upload files.',
         'storage/canceled': 'Upload was canceled.',
         'storage/unknown': 'An unknown storage error occurred.',
         'permission-denied': 'You do not have permission for this operation.',
         'unavailable': 'Firestore service is temporarily unavailable.',
      };
      return errorMap[errorCode] || 'An unexpected error occurred. Please try again.';
   };

   useEffect(() => {
      const handleOutsideClick = (e) => {
         if (showMap && mapModalRef.current && mapModalRef.current.contains(e.target)) {
            return; // Don't close if clicking inside map modal
         }
         if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
         }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
         document.removeEventListener('mousedown', handleOutsideClick);
         if (imagePreview && image) {
            URL.revokeObjectURL(imagePreview);
         }
      };
   }, [imagePreview, image, onClose, showMap]);

   return (
      <div className="modal-overlay">
         <div className="modal-container">
            <div className="createParentDiv" ref={modalRef}>
               <button className="close-button" onClick={onClose} aria-label="Close modal">
                  ×
               </button>
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
                     onChange={(e) => setProductName(e.target.value)}
                     className="input"
                     type="text"
                     id="fname"
                     name="Name"
                     placeholder="HP Elite Book Laptop, Apple iPhone 16 ...."
                     value={productName}
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

                  <div className="imageRow">
                     <div className="imagePreview">
                        {imagePreview && (
                           <img
                              alt="Preview"
                              width="150px"
                              height="auto"
                              src={imagePreview}
                           />
                        )}
                     </div>
                     <div className="imageUploadContainer">
                        <input
                           type="file"
                           ref={fileInputRef}
                           onChange={handleImageChange}
                           style={{ display: 'none' }}
                           accept="image/jpeg,image/png,image/jpg,image/webp"
                        />
                        <button
                           type="button"
                           className="imageUploadBtn"
                           onClick={handleFileButtonClick}
                        >
                           {imagePreview ? 'Change Image' : 'Choose File'}
                        </button>
                        {imageError && <p className="input-error">{imageError}</p>}
                     </div>
                  </div>

                  <label>Location</label>
                  <div className="location-field">
                     <input
                        type="text"
                        className="input"
                        value={location ? location.address : ''}
                        readOnly
                        placeholder="Select a location on the map"
                     />
                     <button type="button" className="choose-location-btn" onClick={handleShowMap}>
                        Choose Location
                     </button>
                  </div>
                  {locationError && <p className="input-error">{locationError}</p>}
                  {mapsLoadError && <p className="input-error">{mapsLoadError}</p>}

                  <button className="uploadBtn" type="submit" disabled={loading}>
                     {loading ? (
                        <>
                           <div
                              className="upload-progress-fill"
                              style={{ width: `${Math.round(smoothProgress)}%` }}
                           ></div>
                           <span className="upload-progress-text">
                              Updating... {Math.round(smoothProgress)}%
                           </span>
                        </>
                     ) : (
                        'Update Ad'
                     )}
                  </button>
               </form>
            </div>
         </div>

         {showMap && (
            <div className="map-modal" ref={mapModalRef}>
               <div className="map-modal-content">
                  <button className="map-modal-close" onClick={handleCloseMap}>
                     ×
                  </button>
                  <h3>Select Location</h3>
                  {mapsLoadError ? (
                     <p className="map-error">{mapsLoadError}</p>
                  ) : (
                     <div id="map" className="map-container"></div>
                  )}
                  {location && (
                     <div className="location-info">
                        <p><strong>Selected Location:</strong> {location.address}</p>
                        <p><strong>Latitude:</strong> {location.lat.toFixed(6)}</p>
                        <p><strong>Longitude:</strong> {location.lng.toFixed(6)}</p>
                     </div>
                  )}
                  <button className="map-modal-confirm" onClick={handleCloseMap}>
                     Confirm Location
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}

export default EditAdModal;