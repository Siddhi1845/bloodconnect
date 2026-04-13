import { useContext, useRef, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaCamera } from "react-icons/fa";
import "../styles/profile.css";
import { API_BASE_URL } from "../config";

export default function Profile() {
  const { user, profilePhoto, updateProfilePhoto, updateUserDetails } =
    useContext(AuthContext);

  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    isDonor: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        city: user.city || "",
        address: user.address || "",
        isDonor: user.isDonor || false
      });
    }
  }, [user]);

  if (!user) return <p>No profile data</p>;

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("phone", user.phone);
    formData.append("profilePhoto", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/api/users/me`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update context and local storage with new photo URL (if backend returns it)
      // Wait, backend returns "user" object which has "profilePhoto" filename.
      // We need to construct full URL or store filename.
      // AuthContext expects full URL or base64? 
      // Navbar uses it directly. Ideally store full URL or consistent path.

      let photoUrl = null;
      if (res.data.profilePhoto) {
        photoUrl = `${API_BASE_URL}/uploads/${res.data.profilePhoto}`;
      }
      updateProfilePhoto(photoUrl);
      alert("Profile photo updated!");

    } catch (err) {
      console.error(err);
      alert("Failed to upload photo");
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("deletePhoto", "true");
      // Preserve existing details
      formData.append("name", user.name || "");
      formData.append("phone", user.phone || "");

      await axios.put(
        `${API_BASE_URL}/api/users/me`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      updateProfilePhoto(null);
      alert("Profile photo removed!");
    } catch (err) {
      console.error(err);
      alert("Failed to remove photo");
    }
  };

  const [isEditing, setIsEditing] = useState(false);


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const updateData = new FormData();
      updateData.append("name", formData.name);
      updateData.append("phone", formData.phone);
      updateData.append("city", formData.city);
      updateData.append("address", formData.address);
      updateData.append("isDonor", formData.isDonor);

      const res = await axios.put(
        `${API_BASE_URL}/api/users/me`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Profile updated successfully!");
      setIsEditing(false);
      updateUserDetails({
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        isDonor: formData.isDonor
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="profile-page">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-card">
        {/* PROFILE PHOTO */}
        <div className="profile-photo-section">
          <div
            className="profile-photo-wrapper"
            onClick={() => fileInputRef.current.click()}
            title="Click to Change Photo"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="profile-avatar"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                className="profile-avatar"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  color: "#c62828",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {user.name ? user.name.charAt(0) : "U"}
              </div>
            )}

            <div className="photo-overlay">
              <FaCamera />
              <span>Edit</span>
            </div>
          </div>

          <div className="photo-actions" style={{ marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={() => fileInputRef.current.click()} style={{ cursor: "pointer", padding: "5px 10px" }}>Change</button>
            {profilePhoto && (
              <button onClick={handleDeletePhoto} style={{ cursor: "pointer", padding: "5px 10px", background: "#d32f2f", color: "white", border: "none", borderRadius: "3px" }}>Remove</button>
            )}
          </div>
        </div>

        <input
          type="file"
          name="profilePhoto"
          id="profilePhoto"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handlePhotoChange}
        />

        {/* USER INFO */}
        {!isEditing ? (
          <div className="profile-details">
            <h3>{user.name}</h3>
            <p className="profile-email">{user.email}</p>

            <div className="detail-item">
              <strong>Phone:</strong> {user.phone || "Not added"}
            </div>
            <div className="detail-item">
              <strong>Blood Group:</strong> {user.bloodGroup || "N/A"}
            </div>
            <div className="detail-item">
              <strong>City:</strong> {user.city || "Not added"}
            </div>
            <div className="detail-item">
              <strong>Address:</strong> {user.address || "Not added"}
            </div>

            <button
              onClick={() => setIsEditing(true)}
              style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form className="profile-edit-form" onSubmit={handleUpdateProfile} style={{ textAlign: 'left', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
            <div style={{ marginBottom: 10 }}>
              <label htmlFor="name">Name</label>
              <input name="name" id="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label htmlFor="phone">Phone</label>
              <input name="phone" id="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label htmlFor="city">City</label>
              <input name="city" id="city" value={formData.city} onChange={handleInputChange} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label htmlFor="address">Address</label>
              <input name="address" id="address" value={formData.address} onChange={handleInputChange} style={{ width: '100%', padding: 8 }} />
            </div>

            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                name="isDonor" 
                id="isDonor" 
                checked={formData.isDonor} 
                onChange={(e) => setFormData({ ...formData, isDonor: e.target.checked })} 
                style={{ width: 'auto', marginRight: 10 }} 
              />
              <label htmlFor="isDonor">Available as Donor</label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" style={{ flex: 1, padding: 10, background: '#2e7d32', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Save</button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: 10, background: '#ccc', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
