import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showLocationModal, setShowLocationModal] = useState(false);

  // 1. Handle Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Instead of navigating immediately, show custom permission modal
      setShowLocationModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // 2. User clicks "Allow Location" in our custom modal
  const handleAllowLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Success
                alert("✅ Location Permission Allowed! We can now find donors near you.");
                navigate("/"); 
            },
            (err) => {
                // Denied or Error
                console.warn("Location denied on login");
                navigate("/"); 
            }
        );
    } else {
        navigate("/"); 
    }
  };

  // 3. User clicks "Skip"
  const handleSkip = () => {
      navigate("/");
  };

  return (
    <div className="auth-layout">
      {/* Custom Location Permission Modal */}
      {showLocationModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '350px', textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <div style={{fontSize: '40px', marginBottom: '15px'}}>📍</div>
                <h3 style={{marginBottom: '10px', color: '#333'}}>Allow Location Access?</h3>
                <p style={{color: '#666', marginBottom: '25px', lineHeight: '1.5'}}>
                    To find nearby donors and blood banks, BloodConnect needs access to your device's location.
                </p>
                <button 
                    onClick={handleAllowLocation}
                    style={{
                        width: '100%', padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', 
                        fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px'
                    }}
                >
                    Allow Location
                </button>
                
                <button 
                    onClick={handleSkip}
                    style={{
                        width: '100%', padding: '12px', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '8px',
                        fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px'
                    }}
                >
                    Ask Me Later
                </button>

                <button 
                    onClick={handleSkip}
                    style={{
                        width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#888', border: 'none', 
                        fontSize: '14px', cursor: 'pointer'
                    }}
                >
                    Don't Allow
                </button>
            </div>
        </div>
      )}

      <div className="auth-brand">
        <h1>BloodConnect</h1>
        <p>Connecting donors and saving lives.</p>
      </div>

      <div className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-title">
            <h2>Login</h2>
            <span>Welcome back</span>
          </div>

          <div className="auth-field">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="auth-btn" type="submit">
            Login
          </button>

          <div
            className="auth-link"
            onClick={() => navigate("/register")}
          >
            Create new account
          </div>

          <div
            className="auth-link"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </div>
        </form>
      </div>
    </div>
  );
}
