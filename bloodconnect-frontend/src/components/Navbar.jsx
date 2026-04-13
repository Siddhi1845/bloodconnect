import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaTint,
  FaBell,
  FaCommentDots,
  FaPlusCircle
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

import "../styles/topbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { logout, user, profilePhoto } = useContext(AuthContext);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (user) {
       fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/api/notifications/${user._id || user.id}`);
          // Sort by newest
          setNotifications(res.data.reverse());
      } catch (err) {
          console.error(err);
      }
  };

  const handleOpenNotifs = async () => {
      setShowNotifs(!showNotifs);
      if (!showNotifs) {
          // Opening: Mark all as read
          try {
              await axios.put(`${API_BASE_URL}/api/notifications/read-all/${user._id || user.id}`);
              // Update local state to read
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          } catch (e) {
              console.error(e);
          }
          fetchNotifications();
      }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUndo = async (notif) => {
      try {
          if(!confirm("Undo your decision?")) return;
          await axios.post(`${API_BASE_URL}/api/donor-requests/undo`, {
              requestId: notif.metadata?.requestId
          }, { headers: { Authorization: `Bearer ${user.token}` } });
          
          alert("Undone! Request is pending again.");
          fetchNotifications();
      } catch (err) {
          alert(err.response?.data?.message || "Failed to undo");
      }
  };

  const handleAction = async (notif, status) => {
      try {
          await axios.post(
             `${API_BASE_URL}/api/donor-requests/respond`,
             { 
                 requestId: notif.metadata?.requestId, 
                 status: status 
             },
             { headers: { Authorization: `Bearer ${user.token}` } }
          );
          alert(`Request ${status}!`);
          // Optionally mark notification as read or refresh
          fetchNotifications();
      } catch (err) {
          alert("Failed to action request");
      }
  };

  return (
    <div className="fb-topbar">
      {/* LEFT */}
      <div className="topbar-left">
        <span className="logo-icon">🩸</span>
        <strong className="logo-text">BloodConnect</strong>

        <input
          className="fb-search"
          name="search"
          id="search"
          placeholder="Search BloodConnect"
        />
      </div>

      {/* CENTER */}
      <div className="topbar-center">
        <FaHome
          size={22}
          title="Home"
          onClick={() => navigate("/")}
        />
        <FaTint
          size={22}
          title="Blood Requests"
          onClick={() => navigate("/requests")}
        />
        <FaUsers
          size={22}
          title="Groups"
          onClick={() => navigate("/groups")}
        />
        <FaCalendarAlt
          size={22}
          title="Camps"
          onClick={() => navigate("/camps")}
        />
      </div>

      {/* RIGHT */}
      <div className="topbar-right">

        
        <div style={{ position: "relative" }}>
            <FaBell 
              size={20} 
              title="Notifications" 
              onClick={handleOpenNotifs}
              style={{ cursor: "pointer" }}
            />
            {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="notif-badge">{notifications.filter(n => !n.isRead).length}</span>
            )}

            {showNotifs && (
                <div className="notif-dropdown">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '10px 15px', borderBottom: '1px solid #eee'}}>
                        <h6 style={{margin:0}}>Notifications</h6>
                        {notifications.length > 0 && (
                            <span 
                                style={{fontSize:'0.8em', color:'#1976d2', cursor:'pointer'}}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    setNotifications([]); // clear UI
                                    await axios.delete(`${API_BASE_URL}/api/notifications/all/${user._id || user.id}`); // Optional clear all
                                }}
                            >
                                Clear All
                            </span>
                        )}
                    </div>
                    <div className="notif-list">
                        {notifications.length === 0 ? <p>No notifications</p> : (
                            notifications.map(n => (
                                <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                                    <p>{n.message}</p>
                                    
                                    {/* Action Buttons for Blood Request */}
                                    {n.type === 'blood_request' && (
                                        <div style={{marginTop: 5, display: 'flex', gap: 5}}>
                                            <button 
                                                onClick={() => handleAction(n, 'accepted')}
                                                style={{padding: "2px 8px", fontSize: "0.75em", background: "#2e7d32", color: "white", border: "none", borderRadius: "3px", cursor: "pointer"}}
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                 onClick={() => handleAction(n, 'rejected')}
                                                 style={{padding: "2px 8px", fontSize: "0.75em", background: "#d32f2f", color: "white", border: "none", borderRadius: "3px", cursor: "pointer"}}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {/* Undo Option for Responded Requests */}
                                    {n.type === 'info' && n.metadata?.requestId && (n.message.includes("You accepted") || n.message.includes("You rejected")) && (
                                        <div style={{marginTop: 5}}>
                                            <span 
                                                onClick={() => handleUndo(n)} 
                                                style={{fontSize: '0.8em', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline'}}
                                            >
                                                Undo Decision
                                            </span>
                                        </div>
                                    )}

                                    <div style={{marginTop: 4, display:'flex', justifyContent:'space-between', fontSize: '0.7em', color: '#888'}}>
                                       <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                                       {/* Optional Delete Single Notification */}
                                       <span style={{cursor:'pointer'}} onClick={(e) => {
                                            e.stopPropagation();
                                            axios.delete(`${API_BASE_URL}/api/notifications/${n._id}`);
                                            setNotifications(prev => prev.filter(x => x._id !== n._id));
                                       }}>✕</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

        <div
          className="topbar-profile"
          onClick={() => navigate("/profile")}
        >
          <img
            src={
              profilePhoto
                ? profilePhoto
                : `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random&size=32`
            }
            alt="profile"
            className="rounded-circle"
          />



          <span>{user?.name || "User"}</span>
        </div>

        <button onClick={handleLogout} className="btn-outline">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
