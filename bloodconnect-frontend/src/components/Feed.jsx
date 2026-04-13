import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "../styles/feed.css";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

export default function Feed({ onlyRequests }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const [description, setDescription] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [units, setUnits] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // NEW: Donation Form State
  const [postType, setPostType] = useState("request"); // "request" or "donation"
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [hb, setHb] = useState("");
  const [disease, setDisease] = useState("None");
  const [lastDonationDate, setLastDonationDate] = useState("");

  const { user, profilePhoto } = useContext(AuthContext);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setLoading(true);
    setFilterType("all");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/posts`);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUrgentPosts = async () => {
    setFilterType("urgent");
    const res = await axios.get(`${API_BASE_URL}/api/posts/urgent`);
    setRequests(res.data);
  };

  const fetchNearbyPosts = () => {
    setFilterType("nearby");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await axios.get(
        `${API_BASE_URL}/api/posts/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`
      );
      setRequests(res.data);
    });
  };

  const resetForm = () => {
    setShowCreate(false);
    setDescription("");
    setBloodGroup("");
    setUnits("");
    setUrgent(false);
    setSelectedImage(null);
    setImagePreview(null);
    // Reset Donor Fields
    setAge("");
    setWeight("");
    setHb("");
    setDisease("None");
    setLastDonationDate("");
    setPostType("request");
  };

  const handleCreatePost = () => {
    if (!user) {
      alert("Please login to create a post");
      return;
    }

    // VALIDATION
    if (postType === "donation") {
      if (!age || !weight || !hb || !disease) {
        alert("Please fill all donor details (Age, Weight, Hb, Disease)");
        return;
      }
      
      // Strict Disease Rule Frontend
      if (disease !== "None") {
        alert("Sorry, you cannot donate if you have any disease.");
        return;
      }

      if (age < 18 || age > 65) return alert("Age must be between 18 and 65");
      if (weight < 45) return alert("Weight must be at least 45kg");
      if (hb < 12.5) return alert("Hemoglobin must be at least 12.5 g/dL");

      if (lastDonationDate) {
        const lastDate = new Date(lastDonationDate);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (lastDate > threeMonthsAgo) {
          alert("You must wait 3 months (90 days) between blood donations.");
          return;
        }
      }
    } else {
      // Request Validation
      if (!description && !selectedImage && !bloodGroup) {
        alert("Please add a blood group, photo, or text");
        return;
      }
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Session expired. Please login again.");
          return;
        }

        const formData = new FormData();
        formData.append("description", description);
        formData.append("bloodGroup", bloodGroup); // Optional for donation, but good to have
        formData.append("units", units);
        formData.append("urgent", urgent);
        formData.append("postType", postType); // or just type
        formData.append("type", postType);
        
        // Append Donor Fields
        if (postType === "donation") {
           formData.append("age", age);
           formData.append("weight", weight);
           formData.append("hb", hb);
           formData.append("disease", disease);
           if (lastDonationDate) formData.append("lastDonationDate", lastDonationDate);
        }

        formData.append("lat", pos.coords.latitude);
        formData.append("lng", pos.coords.longitude);

        if (selectedImage) {
          formData.append("image", selectedImage);
        }

        console.log("Submitting post with token:", token);
        const res = await axios.post(
          `${API_BASE_URL}/api/posts`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (postType === "donation") {
          alert("Thank you! Your donation availability has been posted.");
        }
        resetForm();
        fetchAllRequests();
      } catch (err) {
        console.error("Failed to create post:", err);
        if (err.response && err.response.data && err.response.data.message) {
            alert("Error: " + err.response.data.message);
        } else if (err.response && err.response.status === 401) {
          alert("Session expired. Please login again.");
        } else {
          alert("Failed to create post. Please try again.");
        }
      }
    }, (err) => {
      console.error("Location error:", err);
      alert("Location access is required to create a post. Please enable location permissions.");
    });
  };

  const handleCall = (phone) => {
    if (!phone) return alert("Phone not available");
    window.location.href = `tel:${phone}`;
  };

  const handleMap = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const handleHelp = (req) => {
    alert(`Name: ${req.user?.name}\nPhone: ${req.user?.phone}`);
  };

  const handleShare = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    alert("Link copied");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to delete posts");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllRequests();
    } catch (err) {
      console.error("Delete failed:", err);
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please login again.");
      } else {
        alert("Failed to delete post.");
      }
    }
  };

  const showCurrentLocationOnMap = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        window.open(
          `https://www.google.com/maps?q=${latitude},${longitude}`,
          "_blank"
        );
      },
      () => {
        alert("Location permission denied");
      }
    );
  };

  return (
    <div className="fb-feed">
      {/* CREATE POST */}
      <div className="create-post">
        <div className="create-top">
          <img
            src={
              profilePhoto
                ? profilePhoto
                : `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random&size=40`
            }
            className="avatar"
            alt=""
          />
          <input
            placeholder="Create Blood Request 🩸..."
            readOnly
            onClick={() => setShowCreate(true)}
          />
        </div>

        <div className="create-actions">
          {/* 🩸 Blood Request → Open Modal */}
          <span
            className="action-item"
            onClick={() => {
              setPostType("request");
              setShowCreate(true);
            }}
          >
            🩸 Blood Request
          </span>

          <span
            className="action-item"
            onClick={() => {
              setPostType("donation");
              setShowCreate(true);
            }}
          >
            ❤️ Donate
          </span>

          {/* 📍 Location → Fetch Nearby Posts */}
          <span
            className="action-item"
            onClick={showCurrentLocationOnMap}
          >
            📍 Location
          </span>

          <span
            className="action-item post-btn"
            onClick={() => setShowCreate(true)}
          >
            ➕ Post
          </span>
        </div>
      </div>

      {/* FILTER */}
      <div className="filter-bar">
        <span 
          className={filterType === "nearby" ? "active-filter" : ""} 
          onClick={fetchNearbyPosts}
        >
          📍 Nearby
        </span>
        <span 
          className={filterType === "urgent" ? "active-filter" : ""} 
          onClick={fetchUrgentPosts}
        >
          ⚠️ Urgent
        </span>
        <span 
          className={filterType === "all" ? "active-filter" : ""} 
          onClick={fetchAllRequests}
        >
          🩸 All
        </span>
      </div>

      {/* MODAL */}
      {showCreate && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>{postType === "donation" ? "Donate Blood" : "Create Request"}</h3>

            {/* Blood Group Selection */}
            <div className="form-row">
              <select 
                name="bloodGroup"
                id="bloodGroup"
                value={bloodGroup} 
                onChange={(e) => setBloodGroup(e.target.value)}
                className="bg-select"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>

              {postType === "request" && (
                <input 
                  type="number" 
                  name="units"
                  id="units"
                  placeholder="Units" 
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="units-input"
                  style={{ width: "80px" }}
                />
              )}
            </div>
            
            {postType === "request" && (
              <label className="checkbox-label" htmlFor="urgent">
                <input 
                  type="checkbox" 
                  name="urgent"
                  id="urgent"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                />
                ⚠️ Urgent Request
              </label>
            )}

            {/* DONOR SPECIFIC FIELDS */}
            {postType === "donation" && (
              <div className="donor-fields" style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "10px 0" }}>
                <input 
                  type="number" 
                  name="age"
                  id="age"
                  placeholder="Age" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ flex: 1, minWidth: "80px", padding: "8px" }}
                />
                 <input 
                  type="number" 
                  name="weight"
                  id="weight"
                  placeholder="Weight (kg)" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{ flex: 1, minWidth: "80px", padding: "8px" }}
                />
                 <input 
                  type="number" 
                  name="hb"
                  id="hb"
                  placeholder="Hb (g/dL)" 
                  value={hb}
                  onChange={(e) => setHb(e.target.value)}
                  style={{ flex: 1, minWidth: "80px", padding: "8px" }}
                />
                
                <select 
                  name="disease"
                  id="disease"
                  value={disease} 
                  onChange={(e) => setDisease(e.target.value)}
                  style={{ flex: 1, minWidth: "120px", padding: "8px" }}
                >
                  <option value="None">No Disease</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Hypertension">Hypertension</option>
                  <option value="HIV">HIV</option>
                  <option value="Hepatitis">Hepatitis</option>
                  <option value="Others">Others</option>
                </select>

                <div style={{ width: "100%" }}>
                  <label htmlFor="lastDonationDate" style={{ fontSize: "0.8em", color: "#666" }}>Last Donation Date:</label>
                  <input 
                    type="date" 
                    name="lastDonationDate"
                    id="lastDonationDate"
                    value={lastDonationDate}
                    onChange={(e) => setLastDonationDate(e.target.value)}
                    style={{ width: "100%", padding: "8px" }}
                  />
                </div>
              </div>
            )}

            {/* Description and Photo */}
            <textarea
              name="description"
              id="description"
              className="description-input"
              placeholder={postType === 'donation' ? "Any message for recipients? (Optional)" : "What's on your mind? (Optional)"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            {/* Photo Upload Section */}
            <div className="photo-upload-section">
              <input
                type="file"
                accept="image/*"
                id="image-upload"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload" className="add-photo-btn">
                📷 Add Photo
              </label>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button className="remove-image-btn" onClick={removeImage}>
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <span onClick={resetForm}>Cancel</span>
              <span onClick={handleCreatePost}>Submit</span>
            </div>
          </div>
        </div>
      )}

      {/* POSTS */}
      {loading && <p>Loading...</p>}

      {!loading &&
        requests
          .filter(req => !onlyRequests || req.bloodGroup)
          .map((req) => (
            <div key={req._id} className="post-card" style={req.type === 'camp' ? { borderLeft: "5px solid #d32f2f", background: "#fff5f5" } : {}}>
              <h4>
                <img
                  src={
                    req.user?.profilePhoto
                      ? `${API_BASE_URL}/uploads/${req.user.profilePhoto}?t=${Date.now()}`
                      : `https://ui-avatars.com/api/?name=${req.user?.name || "U"}&background=random&size=32`
                  }
                  className="post-avatar"
                  alt=""
                  style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 10, verticalAlign: "middle", objectFit: "cover" }}
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${req.user?.name || "U"}&background=random&size=32`; }}
                />
                
                {req.type === 'camp' ? (
                   <span>{req.user?.name || "Organizer"} (Camp Organizer)</span>
                ) : (
                   req.user?.name
                )}
                
                {req.bloodGroup && req.type !== 'camp' && (
                  <span className={`bg-badge ${req.urgent ? 'urgent' : ''}`}>
                    {req.bloodGroup}
                    {req.urgent && " ⚠️"}
                  </span>
                )}
                
                {req.type === 'camp' && <span className="bg-badge urgent">🏕 CAMP</span>}
              </h4>

              {req.image && (
                <img
                  src={`${API_BASE_URL}/uploads/${req.image}`}
                  className="post-image"
                  alt=""
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}

              {/* Description */}
              <div className="post-description">
                {req.bloodGroup && (
                  <strong style={{ display: 'block', marginBottom: 5, color: req.type === 'donation' ? '#2e7d32' : '#d32f2f' }}>
                    {req.type === 'donation' 
                      ? `Available to Donate ${req.bloodGroup} Blood 🩸`
                      : req.type === 'camp' ? "" 
                      : `Requesting ${req.units ? `${req.units} units of ` : ''}${req.bloodGroup} Blood`
                    }
                  </strong>
                )}
                
                {req.type === 'donation' && (
                   <div style={{ fontSize: "0.9em", color: "#555", marginBottom: "5px", background: "#f0f0f0", padding: "5px", borderRadius: "5px" }}>
                     <span><strong>Age:</strong> {req.age} | </span>
                     <span><strong>Weight:</strong> {req.weight}kg | </span>
                     <span><strong>Hb:</strong> {req.hb} | </span>
                     {req.lastDonationDate && <span><strong>Last Donated:</strong> {new Date(req.lastDonationDate).toLocaleDateString()}</span>}
                   </div>
                )}

                {req.description}
              </div>

              {/* ACTION STYLE LIKE FB */}
              <div className="post-actions">
                <span onClick={() => handleHelp(req)}>❤️ {req.type === 'camp' ? "Interested" : "Help"}</span>
                {req.type !== 'camp' && <span onClick={() => handleCall(req.user?.phone)}>📞 Call</span>}
                <span onClick={() => handleMap(req.location?.coordinates?.[1] || req.lat, req.location?.coordinates?.[0] || req.lng)}>📍 Location</span>
                <span onClick={() => handleShare(req._id)}>🔗 Share</span>

                {/* DELETE BUTTON - Only for owner */}
                {user && (req.user?._id === user._id || req.user?._id === user.id) && (
                  <span 
                    className="delete-btn"
                    onClick={() => handleDelete(req._id)}
                    title="Delete Post"
                  >
                    🗑 Delete
                  </span>
                )}
              </div>
            </div>
          ))}
    </div>
  );
}
