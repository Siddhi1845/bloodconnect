import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    bloodGroup: "",
    lat: null,
    lng: null
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showLocationModal, setShowLocationModal] = useState(false);

  // Remove the useEffect for auto-location.
  // Remove the handleChange (it's fine to keep generic, but we need the new logic).

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 1. Triggered when user clicks "Register"
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    // Show the permission modal instead of registering immediately
    setShowLocationModal(true);
  };

  // 2. Helper to actually send data to backend
  const executeRegister = async (lat, lng) => {
    setLoading(true);
    setError("");
    try {
      const payload = { ...form, lat, lng };
      await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
      alert("Registration successful 🎉");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      // If failed, close modal so they can fix form
      setShowLocationModal(false);
    } finally {
      setLoading(false);
    }
  };

  // 3. User clicks "Allow Location" in Modal
  const handleAllowLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          executeRegister(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Location denied");
          // Register anyway without location
          executeRegister(null, null);
        }
      );
    } else {
      executeRegister(null, null);
    }
  };

  // 4. User clicks "Skip" in Modal
  const handleSkip = () => {
    executeRegister(null, null);
  };

  return (
    <div className="auth-layout">

      {/* Custom Location Permission Modal - Android Style */}
      {showLocationModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '25px', width: '90%', maxWidth: '350px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden', fontFamily: 'sans-serif', textAlign: 'center'
          }}>
            {/* Icon Header */}
            <div style={{ paddingTop: '25px' }}>
              <div style={{ fontSize: '30px' }}>📍</div>
            </div>

            {/* Title */}
            <h3 style={{ margin: '10px 0 5px 0', fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
              Allow BloodConnect to access this device's location?
            </h3>

            {/* Info Box */}
            <div style={{ padding: '0 20px' }}>
              <div style={{
                border: '1px solid #e0e0e0', borderRadius: '10px', padding: '10px', marginTop: '15px',
                display: 'flex', alignItems: 'center', textAlign: 'left', fontSize: '12px', color: '#555'
              }}>
                <span style={{ fontSize: '16px', marginRight: '10px' }}>🛡️</span>
                <div>
                  This app stated that it may share location data with third parties
                  {/* arrow icon */}
                  <span style={{ float: 'right', fontSize: '16px', color: '#999' }}> &gt;</span>
                </div>
              </div>
            </div>

            {/* Map Visuals */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
              {/* Precise */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%', background: '#e3f2fd', border: '2px solid #1976d2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ width: '10px', height: '10px', background: '#1976d2', borderRadius: '50%' }}></div>
                </div>
                <span style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>Precise</span>
              </div>

              {/* Approximate */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #ccc',
                  backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '10px 10px'
                }}></div>
                <span style={{ fontSize: '12px', marginTop: '5px' }}>Approximate</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }} />

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={handleAllowLocation}
                style={{
                  width: '100%', padding: '15px', background: 'transparent', border: 'none',
                  color: '#1976d2', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid #f0f0f0'
                }}
              >
                While using the app
              </button>

              <button
                onClick={handleAllowLocation}
                style={{
                  width: '100%', padding: '15px', background: 'transparent', border: 'none',
                  color: '#1976d2', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid #f0f0f0'
                }}
              >
                Only this time
              </button>

              <button
                onClick={handleSkip}
                style={{
                  width: '100%', padding: '15px', background: 'transparent', border: 'none',
                  color: '#1976d2', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Don't allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT BRAND */}
      <div className="auth-brand">
        <h1>BloodConnect</h1>
        <p>Join the mission to save lives.</p>
      </div>

      {/* RIGHT FORM */}
      <div className="auth-form-panel">
        <form className="auth-card" onSubmit={handleInitialSubmit}>
          <div className="auth-title">
            <h2>Register</h2>
            <span>Create your account</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <input
              name="name"
              id="name"
              placeholder="Full Name"
              autoComplete="name"
              required
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <input
              name="email"
              id="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <input
              name="phone"
              id="phone"
              placeholder="Phone Number"
              autoComplete="tel"
              required
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <select
              name="bloodGroup"
              id="bloodGroup"
              required
              onChange={handleChange}
              defaultValue=""
            >
              <option value="" disabled>
                Select Blood Group
              </option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>O+</option>
              <option>O-</option>
              <option>AB+</option>
              <option>AB-</option>
            </select>
          </div>

          <div className="auth-field">
            <input
              name="password"
              id="password"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              required
              onChange={handleChange}
            />
          </div>

          <button className="auth-btn" disabled={loading}>
            Register
          </button>

          <div className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
