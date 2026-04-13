import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function RightSidebar() {
  const [stats, setStats] = useState({
    availability: {},
    impact: { donations: 0, livesSaved: 0 }
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="right-sidebar-inner">

      <div className="side-card">
        <h4 className="compat-title">🩸 Compatibility Chart</h4>
        <table className="compat-table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Receiver</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="blood-type">O-</td><td>All (Universal)</td></tr>
            <tr><td className="blood-type">O+</td><td>O+, A+, B+, AB+</td></tr>
            <tr><td className="blood-type">A-</td><td>A-, A+, AB-, AB+</td></tr>
            <tr><td className="blood-type">A+</td><td>A+, AB+</td></tr>
            <tr><td className="blood-type">B-</td><td>B-, B+, AB-, AB+</td></tr>
            <tr><td className="blood-type">B+</td><td>B+, AB+</td></tr>
            <tr><td className="blood-type">AB-</td><td>AB-, AB+</td></tr>
            <tr><td className="blood-type">AB+</td><td>AB+ Only</td></tr>
          </tbody>
        </table>
      </div>

      <div className="side-card">
        <h4>Nearby Camps</h4>
        {stats.upcomingCamps && stats.upcomingCamps.length > 0 ? (
          stats.upcomingCamps.map(camp => (
            <div key={camp._id} style={{ marginBottom: "10px" }}>
              <p style={{ margin: 0, fontWeight: 500 }}>📍 {camp.name}</p>
              <span style={{ fontSize: "0.8em", color: "#666" }}>
                {new Date(camp.date).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p style={{ color: "#777", fontSize: '0.9em' }}>No upcoming camps</p>
        )}
      </div>

    </div>
  );
}
