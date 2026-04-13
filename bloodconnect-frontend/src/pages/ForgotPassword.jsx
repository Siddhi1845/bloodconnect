import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // TEMP: backend integration later
    setSent(true);
  };

  return (
    <div className="auth-layout">
      {/* LEFT BRAND */}
      <div className="auth-brand">
        <h1>BloodConnect</h1>
        <p>
          Don’t worry. We’ll help you get back into your account.
        </p>
      </div>

      {/* RIGHT FORM */}
      <div className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-title">
            <h2>Forgot Password</h2>
            <span>Reset your password</span>
          </div>

          {!sent ? (
            <>
              <div className="auth-field">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button className="auth-btn">
                Send Reset Link
              </button>

              <div
                className="auth-link"
                onClick={() => (window.location.href = "/login")}
              >
                Back to Login
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  textAlign: "center",
                  color: "#2e7d32",
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                ✅ Reset link sent to <strong>{email}</strong>
              </div>

              <button
                type="button"
                className="auth-btn"
                onClick={() => (window.location.href = "/login")}
              >
                Go to Login
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
