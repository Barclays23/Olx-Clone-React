import React, { Fragment, useContext, useEffect, useState, useRef } from 'react';
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
import { Loader } from '@googlemaps/js-api-loader';

const CreateForm = () => {
   const [category, setCategory] = useState('Select Category');
   const [product, setProduct] = useState('');
   const [price, setPrice] = useState('');
   const [image, setImage] = useState(null);
   const [imagePreview, setImagePreview] = useState('');
   const [location, setLocation] = useState(null);
   const [locationError, setLocationError] = useState('');
   const [showMap, setShowMap] = useState(false);
   const [mapsLoaded, setMapsLoaded] = useState(false);
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
         } catch (error) {
            console.error("Error loading Google Maps:", error);
            toast.error('Failed to load Google Maps. Please check your API key or network.', {
               position: 'top-center',
               theme: 'colored',
            });
         }
      };

      if (!window.google) {
         loadGoogleMaps();
      } else {
         setMapsLoaded(true);
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
         toast.error('Google Maps failed to load. Please try again later.', {
            position: 'top-center',
            theme: 'colored',
         });
         return;
      }

      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
         console.error('Map container not found');
         return;
      }

      if (mapRef.current) {
         return;
      }

      const { Map } = await googleMapsRef.current.maps.importLibrary("maps");
      const { AdvancedMarkerElement } = await googleMapsRef.current.maps.importLibrary("marker");
      const { Geocoder } = googleMapsRef.current.maps;

      const map = new Map(mapContainer, {
         center: { lat: 20.5937, lng: 78.9629 },
         zoom: 5,
         mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
      });

      mapRef.current = map;

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
         }
      });
   };

   const handleShowMap = () => {
      if (!mapsLoaded) {
         toast.error('Google Maps is not loaded yet. Please wait or check your API key.', {
            position: 'top-center',
            theme: 'colored',
         });
         return;
      }
      setShowMap(true);
      setTimeout(() => {
         initMap();
      }, 100);
   };

   const handleCloseMap = () => {
      setShowMap(false);
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
      setLoading(true);

      let hasInputError = false;
      setCategoryError('');
      setProductError('');
      setPriceError('');
      setImageError('');
      setLocationError('');

      if (category === 'Select Category') {
         setCategoryError("Please choose a category");
         hasInputError = true;
      }

      if (!product.trim()) {
         setProductError("Product name is required");
         hasInputError = true;
      } else if (product.trim().length > 25) {
         setProductError("Product name should not exceed 25 characters");
         hasInputError = true;
      } else if (!/^[a-zA-Z0-9][a-zA-Z0-9\s\-&.",']*$/.test(product.trim())) {
         setProductError("Product name must start with a letter or number and contain only allowed characters.");
         hasInputError = true;
      } else if (!/^[a-zA-Z0-9\s\-&.",']+$/.test(product.trim())) {
         setProductError("Product name can only contain letters, numbers, spaces, and selected symbols (-, &, ., ,, ').");
         hasInputError = true;
      } else if (!/[a-zA-Z]/.test(product.trim())) {
         setProductError("Product name must include at least one letter.");
         hasInputError = true;
      } else if (product.trim().length < 5) {
         setProductError("Product name must be at least 5 characters long");
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

      if (!location) {
         setLocationError("Please select a location");
         hasInputError = true;
      }

      if (hasInputError) {
         setLoading(false);
         return;
      }

      try {
         const { uid } = currentUser;
         const storageRef = ref(storage, `product-images/${uid}/${image.name}_${Date.now()}`);
         const uploadTask = uploadBytesResumable(storageRef, image);

         uploadTask.on(
            'state_changed',
            (snapshot) => {
               const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
               setUploadProgress(progress);
               animateProgress(progress);
            },
            (error) => {
               console.error("Upload failed:", error.code);
               const errorMessage = getErrorMessage(error.code);
               toast.error(`Image upload failed: ${errorMessage}`, { position: "top-center", theme: "colored" });
               setLoading(false);
            },
            async () => {
               const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
               await addDoc(collection(db, "products"), {
                  category: category,
                  productName: product,
                  price: Number(price),
                  imageUrl: downloadURL,
                  location: {
                     latitude: location.lat,
                     longitude: location.lng,
                     address: location.address,
                  },
                  createdAt: Timestamp.now(),
                  userId: currentUser.uid,
               });

               await animateProgress(100);
               toast.success('Product uploaded successfully!', { position: "top-center", theme: "dark", autoClose: 3000 });

               setTimeout(() => {
                  setCategory('Select Category');
                  setProduct('');
                  setPrice('');
                  setImage(null);
                  setImagePreview('');
                  setLocation(null);
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
         console.error("Error saving product:", error.code);
         const errorMessage = getErrorMessage(error.code);
         toast.error(`Failed to add product: ${errorMessage}`, { position: "top-center", theme: "colored" });
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
                     name="category">
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
                  <div className="image-upload-container">
                     <input
                        type="file"
                        id="image-upload"
                        onChange={handleImageChange}
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        style={{ display: 'none' }}
                     />
                     <label htmlFor="image-upload" className="image-upload-btn">
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                     </label>
                  </div>
                  {imageError && <p className="input-error">{imageError}</p>}


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

         {showMap && (
            <div className="map-modal">
               <div className="map-modal-content">
                  <button className="map-modal-close" onClick={handleCloseMap}>
                     ×
                  </button>
                  <h3>Select Location</h3>
                  <div id="map" className="map-container"></div>
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

         <Footer />
      </Fragment>
   );
};

export default CreateForm;