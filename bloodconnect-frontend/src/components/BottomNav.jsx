import { NavLink } from "react-router-dom";
import { FaHome, FaTint, FaUsers, FaCampground, FaUser, FaClinicMedical } from "react-icons/fa";
import "../styles/bottomNav.css";

export default function BottomNav() {
    return (
        <div className="bottom-nav">
            <NavLink
                to="/"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                end
            >
                <FaHome className="nav-icon" />
                <span>Home</span>
            </NavLink>

            <NavLink
                to="/requests"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
                <FaTint className="nav-icon" />
                <span>Requests</span>
            </NavLink>

            <NavLink
                to="/camps"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
                <FaCampground className="nav-icon" />
                <span>Camps</span>
            </NavLink>

            <NavLink
                to="/blood-banks"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
                <FaClinicMedical className="nav-icon" />
                <span>Banks</span>
            </NavLink>

            <NavLink
                to="/donors"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
                <FaUsers className="nav-icon" />
                <span>Donors</span>
            </NavLink>

            <NavLink
                to="/profile"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
                <FaUser className="nav-icon" />
                <span>Profile</span>
            </NavLink>
        </div>
    );
}
