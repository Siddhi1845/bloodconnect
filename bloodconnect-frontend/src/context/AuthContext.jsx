import { createContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [profilePhoto, setProfilePhoto] = useState(
    localStorage.getItem("profilePhoto") || ""
  );

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = { ...res.data, token };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        if (userData.profilePhoto) {
          const pUrl = `${API_BASE_URL}/uploads/${userData.profilePhoto}`;
          setProfilePhoto(pUrl);
          localStorage.setItem("profilePhoto", pUrl);
        } else {
          setProfilePhoto("");
          localStorage.removeItem("profilePhoto");
        }

      } catch (err) {
        console.error("Auth sync failed", err);
        // Optional: logout if token invalid
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });

    const { token, user: userData } = res.data;

    // Store in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ ...userData, token }));

    // Set profile photo if valid
    if (userData.profilePhoto) {
      const pUrl = `${API_BASE_URL}/uploads/${userData.profilePhoto}`;
      setProfilePhoto(pUrl);
      localStorage.setItem("profilePhoto", pUrl);
    }

    // Update state
    setUser({ ...userData, token });
  };

  const updateProfilePhoto = (photo) => {
    setProfilePhoto(photo);
    localStorage.setItem("profilePhoto", photo);
  };

  const updateUserDetails = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setProfilePhoto("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        profilePhoto,
        updateProfilePhoto,
        updateUserDetails,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
