import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaHospital, FaPhone, FaMapMarkerAlt, FaGlobe, FaPlus } from "react-icons/fa";
import "../styles/bloodbanks.css";
import { API_BASE_URL } from "../config";

export default function BloodBanks() {
  const { user } = useContext(AuthContext);
  const [banks, setBanks] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      name: "",
      address: "",
      city: "",
      phone: "",
      website: "",
      type: "Government"
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async (city = "") => {
    try {
      const url = city 
        ? `${API_BASE_URL}/api/blood-banks?city=${city}`
        : `${API_BASE_URL}/api/blood-banks`;
      
      const res = await axios.get(url, {
         headers: { Authorization: `Bearer ${user?.token}` }
      });
      setBanks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
      setSearchCity(e.target.value);
      fetchBanks(e.target.value);
  };

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await axios.post(`${API_BASE_URL}/api/blood-banks`, formData, {
              headers: { Authorization: `Bearer ${user.token}` }
          });
          alert("Blood Bank Added!");
          setShowModal(false);
          setFormData({ name: "", address: "", city: "", phone: "", website: "", type: "Government" });
          fetchBanks();
      } catch (err) {
          alert("Failed to add blood bank");
      }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this blood bank?")) return;
      try {
          await axios.delete(`${API_BASE_URL}/api/blood-banks/${id}`, {
              headers: { Authorization: `Bearer ${user.token}` }
          });
          alert("Blood Bank deleted");
          fetchBanks();
      } catch (err) {
          console.error(err);
          alert("Failed to delete blood bank");
      }
  };

  return (
    <div className="blood-banks-page">
      <div className="bb-header">
        <div>
            <h2>🏥 Blood Banks</h2>
            <p style={{color: '#666'}}>Find nearest blood banks and contact them directly.</p>
        </div>
        <button className="add-bb-btn" onClick={() => setShowModal(true)}>
            <FaPlus /> Add Blood Bank
        </button>
      </div>

      <div className="bb-filters">
        <input 
            type="text" 
            name="searchCity"
            id="searchCity"
            placeholder="Search by City..." 
            value={searchCity}
            onChange={handleSearch}
        />
      </div>

      <div className="bb-list">
         {banks.length === 0 ? (
             <p>No blood banks found.</p>
         ) : (
             banks.map(bb => (
                 <div key={bb._id} className="bb-card">
                     <div className="bb-icon">
                        <FaHospital />
                     </div>
                     <div className="bb-info">
                         <h3>{bb.name}</h3>
                         <p className="bb-type">{bb.type}</p>
                         <p><FaMapMarkerAlt /> {bb.address}, {bb.city}</p>
                         <p><FaPhone /> {bb.phone}</p>
                         {bb.website && (
                            <p><FaGlobe /> <a href={bb.website} target="_blank" rel="noreferrer">Website</a></p>
                         )}
                         
                         {user && bb.addedBy === user._id && (
                             <button 
                                onClick={() => handleDelete(bb._id)}
                                style={{marginTop: 10, background: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer'}}
                             >
                                 Delete
                             </button>
                         )}
                     </div>
                 </div>
             ))
         )}
      </div>

      {/* MODAL */}
      {showModal && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h3>Add Blood Bank</h3>
                  <form onSubmit={handleSubmit}>
                      <input name="name" id="name" placeholder="Bank Name" required value={formData.name} onChange={handleChange} />
                      <input name="address" id="address" placeholder="Address" required value={formData.address} onChange={handleChange} />
                      <input name="city" id="city" placeholder="City" required value={formData.city} onChange={handleChange} />
                      <input name="phone" id="phone" placeholder="Phone" required value={formData.phone} onChange={handleChange} />
                      <input name="website" id="website" placeholder="Website (Optional)" value={formData.website} onChange={handleChange} />
                      <select name="type" id="type" value={formData.type} onChange={handleChange}>
                          <option>Government</option>
                          <option>Private</option>
                          <option>Red Cross</option>
                      </select>
                      
                      <div className="modal-actions">
                          <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                          <button type="submit" className="save-btn">Save</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
