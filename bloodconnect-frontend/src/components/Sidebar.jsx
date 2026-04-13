import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">

      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `sidebar-item ${isActive ? "active-link" : ""}`
        }
      >
        🏠 Feed
      </NavLink>

      <NavLink
        to="/requests"
        className={({ isActive }) =>
          `sidebar-item ${isActive ? "active-link" : ""}`
        }
      >
        🩸 Blood Requests
      </NavLink>

      <NavLink
        to="/donors"
        className={({ isActive }) =>
          `sidebar-item ${isActive ? "active-link" : ""}`
        }
      >
        🧑‍🤝‍🧑 Donors
      </NavLink>

      <NavLink
        to="/camps"
        className={({ isActive }) =>
          `sidebar-item ${isActive ? "active-link" : ""}`
        }
      >
        🏕 Camps
      </NavLink>
      
      <NavLink
        to="/blood-banks"
        className={({ isActive }) =>
          `sidebar-item ${isActive ? "active-link" : ""}`
        }
      >
        🏥 Blood Banks
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `sidebar-item ${isActive ? "active-link" : ""}`
        }
      >
        👤 Profile
      </NavLink>

    </div>
  );
}
