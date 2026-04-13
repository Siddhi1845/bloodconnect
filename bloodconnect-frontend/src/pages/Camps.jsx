import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/camps.css";
import { API_BASE_URL } from "../config";

export default function Camps() {
  const { user } = useContext(AuthContext);
  const [camps, setCamps] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    organizer: "",
    date: "",
    location: "",
    description: "",
    contact: ""
  });

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/camps`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCamps(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/camps`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ name: "", organizer: "", date: "", location: "", description: "", contact: "" });
      fetchCamps();
    } catch (err) {
      alert("Failed to create camp");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this camp?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/camps/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCamps();
    } catch (err) {
      console.error(err);
      alert("Failed to delete camp");
    }
  };

  return (
    <div className="camps-page">
      <div className="camps-header">
        <h2>🏕 Upcoming Blood Camps</h2>
        <button className="add-camp-btn" onClick={() => setShowModal(true)}>
          ➕ Add Camp
        </button>
      </div>

      <div className="camps-list">
        {camps.length === 0 ? (
          <p>No upcoming camps.</p>
        ) : (
          camps.map((camp) => (
            <div key={camp._id} className="camp-card">
              <div className="camp-date">
                <span className="month">{new Date(camp.date).toLocaleString('default', { month: 'short' })}</span>
                <span className="day">{new Date(camp.date).getDate()}</span>
              </div>
              <div className="camp-info">
                <h3>{camp.name}</h3>
                <p>📍 {camp.location}</p>
                <p>👤 Organized by <strong>{camp.organizer}</strong></p>
                <p>📞 {camp.contact}</p>
                {camp.description && <p className="camp-desc">{camp.description}</p>}

                {user && camp.createdBy === user._id && (
                  <button
                    className="delete-camp-btn"
                    onClick={() => handleDelete(camp._id)}
                    style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", marginTop: "10px", cursor: "pointer", borderRadius: "5px" }}
                  >
                    🗑 Delete Camp
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Add New Camp</h3>
            <input
              name="name"
              id="name"
              placeholder="Camp Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              name="organizer"
              id="organizer"
              placeholder="Organizer"
              value={form.organizer}
              onChange={e => setForm({ ...form, organizer: e.target.value })}
            />
            <input
              type="date"
              name="date"
              id="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
            <input
              name="location"
              id="location"
              placeholder="Location"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
            <input
              name="contact"
              id="contact"
              placeholder="Contact Number"
              value={form.contact}
              onChange={e => setForm({ ...form, contact: e.target.value })}
            />
            <textarea
              name="description"
              id="description"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <div className="modal-actions">
              <span onClick={() => setShowModal(false)}>Cancel</span>
              <span onClick={handleCreate}>Create</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
