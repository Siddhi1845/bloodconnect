import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function CreatePost({ onSuccess }) {
  const [bloodGroup, setBloodGroup] = useState("");
  const [units, setUnits] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitPost = async () => {
    if (!bloodGroup || !units) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const token = localStorage.getItem("token");

        await axios.post(
          `${API_BASE_URL}/api/posts`,
          {
            bloodGroup,
            units,
            urgent,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        onSuccess(); // refresh feed
        setBloodGroup("");
        setUnits("");
        setUrgent(false);
      } catch (err) {
        console.error("Failed to create request:", err);
        alert("Failed to create request");
      } finally {
        setLoading(false);
      }
    }, (err) => {
      setLoading(false);
      console.error("Location error:", err);
      alert("Location access is required. Please enable location.");
    });
  };

  return (
    <div className="create-post">
      <h4>Create Blood Request</h4>

      <select
        name="bloodGroup"
        id="bloodGroup"
        value={bloodGroup}
        onChange={(e) => setBloodGroup(e.target.value)}
      >
        <option value="">Select Blood Group</option>
        <option>A+</option><option>A-</option>
        <option>B+</option><option>B-</option>
        <option>O+</option><option>O-</option>
        <option>AB+</option><option>AB-</option>
      </select>

      <input
        type="number"
        name="units"
        id="units"
        placeholder="Units Required"
        value={units}
        onChange={(e) => setUnits(e.target.value)}
      />

      <label htmlFor="urgent">
        <input
          type="checkbox"
          name="urgent"
          id="urgent"
          checked={urgent}
          onChange={() => setUrgent(!urgent)}
        />{" "}
        Mark as urgent
      </label>

      <button onClick={submitPost} disabled={loading}>
        {loading ? "Posting..." : "Post Request"}
      </button>
    </div>
  );
}
