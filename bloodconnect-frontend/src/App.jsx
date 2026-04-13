import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";
import BottomNav from "./components/BottomNav";

import Feed from "./components/Feed";
import Profile from "./pages/Profile";
import Camps from "./pages/Camps";
import Requests from "./pages/Requests";
import NearbyDonors from "./pages/NearbyDonors";
import BloodBanks from "./pages/BloodBanks";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import { AuthContext } from "./context/AuthContext";

function Layout({ children }) {
  return (
    <div className="fb-app">
      <Navbar />

      <div className="fb-body">
        <div className="fb-left">
          <Sidebar />
        </div>

        <div className="fb-center">
          {children}
        </div>

        <div className="fb-right">
          <RightSidebar />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to="/" /> : <ForgotPassword />}
      />

      {/* PROTECTED ROUTES */}
      {user ? (
        <>
          <Route
            path="/"
            element={
              <Layout>
                <Feed />
              </Layout>
            }
          />

          <Route
            path="/requests"
            element={
              <Layout>
                <Requests />
              </Layout>
            }
          />

          <Route
            path="/donors"
            element={
              <Layout>
                <NearbyDonors />
              </Layout>
            }
          />

          <Route
            path="/camps"
            element={
              <Layout>
                <Camps />
              </Layout>
            }
          />

          <Route
            path="/blood-banks"
            element={
              <Layout>
                <BloodBanks />
              </Layout>
            }
          />

          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}

      {/* FINAL FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
