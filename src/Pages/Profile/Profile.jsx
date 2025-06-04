import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FiEdit, FiCamera, FiSave, FiX, FiUser } from 'react-icons/fi';
import './Profile.css';
import Navbar from '../../Components/Navbar/Navbar';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../services/firebase';
import Footer from '../../Components/Footer/Footer';

function Profile() {
  const { currentUser } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userData, setUserData] = useState({
    displayName: '',
    username: '',
    email: '',
    phone: '',
    photoURL: null,
    uid: '',
  });
  
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    phone: '',
  });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              displayName: data.displayName || currentUser.displayName || '',
              username: data.username || '',
              email: data.email || currentUser.email || '',
              phone: data.phone || '',
              photoURL: data.photoURL || currentUser.photoURL || null,
              uid: currentUser.uid,
            });
            
            setFormData({
              displayName: data.displayName || currentUser.displayName || '',
              username: data.username || '',
              email: data.email || currentUser.email || '',
              phone: data.phone || '',
            });
          } else {
            setUserData({
              displayName: currentUser.displayName || '',
              username: '',
              email: currentUser.email || '',
              phone: '',
              photoURL: currentUser.photoURL || null,
              uid: currentUser.uid
            });
            
            setFormData({
              displayName: currentUser.displayName || '',
              username: '',
              email: currentUser.email || '',
              phone: '',
            });
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) {
    return <div className="profile-container">Please log in to view your profile.</div>;
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  const handleEditClick = (field) => {
    setEditingField(field);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setFormData({
      displayName: userData.displayName,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (field) => {
    try {
      setLoading(true);
      
      if (field === 'displayName' || field === 'photoURL') {
        await updateProfile(auth.currentUser, {
          [field]: formData[field]
        });
      }
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        [field]: formData[field]
      });
      
      setUserData(prev => ({
        ...prev,
        [field]: formData[field]
      }));
      
      setEditingField(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      setError(null);
      
      const storage = getStorage();
      const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);
      const uploadTask = uploadBytes(storageRef, file);
      
      await uploadTask;
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });
      
      setUserData(prev => ({ ...prev, photoURL: downloadURL }));
      
    } catch (error) {
      console.error("Error updating profile picture:", error);
      if (error.code === 'storage/unauthorized') {
        setError("You don't have permission to upload images");
      } else {
        setError("Failed to update profile picture. Please try again.");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <button 
            className={`edit-profile-btn ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
            disabled={loading}
          >
            {editMode ? (
              <>
                <FiX className="edit-icon" /> Cancel
              </>
            ) : (
              <>
                <FiEdit className="edit-icon" /> Edit Profile
              </>
            )}
          </button>
        </div>
        
        <div className="profile-content">
          <div className="profile-picture-section">
            <div className="profile-pic-wrapper">
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt="Profile" 
                  className="profile-pic"
                />
              ) : (
                <div className="default-profile-pic">
                  <FiUser className="default-icon" />
                </div>
              )}
              {editMode && (
                <>
                  <button 
                    className="edit-pic-btn" 
                    onClick={triggerFileInput} 
                    disabled={loading}
                  >
                    <FiCamera className="camera-icon" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePicChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                </>
              )}
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
          
          <div className="profile-details">
            <div className="detail-group">
              <label>Full Name</label>
              {editingField === 'displayName' ? (
                <div className="edit-field-container">
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="edit-input"
                    disabled={loading}
                  />
                  <div className="edit-actions">
                    <button 
                      className="save-btn" 
                      onClick={() => handleSave('displayName')}
                      disabled={loading}
                    >
                      <FiSave className="action-icon" />
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      <FiX className="action-icon" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="detail-with-edit">
                  <p>{userData.displayName || 'Not provided'}</p>
                  {editMode && (
                    <button 
                      className="edit-field-btn"
                      onClick={() => handleEditClick('displayName')}
                      disabled={loading}
                    >
                      <FiEdit className="edit-icon" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="detail-group">
              <label>Email</label>
              <div className="detail-with-edit">
                <p>{userData.email}</p>
              </div>
            </div>
            
            <div className="detail-group">
              <label>Phone Number</label>
              {editingField === 'phone' ? (
                <div className="edit-field-container">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="edit-input"
                    disabled={loading}
                  />
                  <div className="edit-actions">
                    <button 
                      className="save-btn" 
                      onClick={() => handleSave('phone')}
                      disabled={loading}
                    >
                      <FiSave className="action-icon" />
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      <FiX className="action-icon" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="detail-with-edit">
                  <p>{userData.phone || 'Not provided'}</p>
                  {editMode && (
                    <button 
                      className="edit-field-btn"
                      onClick={() => handleEditClick('phone')}
                      disabled={loading}
                    >
                      <FiEdit className="edit-icon" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="detail-group">
              <label>Username</label>
              {editingField === 'username' ? (
                <div className="edit-field-container">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="edit-input"
                    disabled={loading}
                  />
                  <div className="edit-actions">
                    <button 
                      className="save-btn" 
                      onClick={() => handleSave('username')}
                      disabled={loading}
                    >
                      <FiSave className="action-icon" />
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      <FiX className="action-icon" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="detail-with-edit">
                  <p>{userData.username || 'Not set'}</p>
                  {editMode && (
                    <button 
                      className="edit-field-btn"
                      onClick={() => handleEditClick('username')}
                      disabled={loading}
                    >
                      <FiEdit className="edit-icon" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="detail-group">
              <label>User ID</label>
              <p className="user-id">{userData.uid}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;