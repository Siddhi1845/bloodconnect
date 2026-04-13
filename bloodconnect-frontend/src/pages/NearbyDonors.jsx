import { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../styles/nearbyDonors.css";
import { API_BASE_URL } from "../config";
import { AuthContext } from "../context/AuthContext";

// Haversine formula to calculate distance between two coordinates
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function NearbyDonors() {
  const { user } = useContext(AuthContext);
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    // Geolocation for Donors
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchNearbyDonors(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          fetchNearbyDonors(18.5204, 73.8567);
        }
      );
    } else {
      fetchNearbyDonors(18.5204, 73.8567);
    }

    // Fetch Sent Requests
    if (user) {
      fetchSentRequests();
    }
  }, [user]);

  async function fetchSentRequests() {
    try {
      // Check if we already have sent requests
      const res = await axios.get(`${API_BASE_URL}/api/donor-requests/sent`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const statusMap = {};
      res.data.forEach(req => {
        statusMap[req.receiver] = req.status;
      });
      setSentRequests(statusMap);
    } catch (err) {
      console.error("Error fetching sent requests", err);
    }
  };

  function fetchNearbyDonors(lat, lng) {
    fetch(
      `${API_BASE_URL}/api/users/nearby?lat=${lat}&lng=${lng}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
    )
      .then((res) => res.json())
      .then((data) => {
        // Filter: Show all returned users (backend now handles spatial query)
        const validDonors = data;

        const mappedDonors = validDonors.map((u, index) => {
          const donorLat = u.location.coordinates[1];
          const donorLng = u.location.coordinates[0];

          const distanceKm = getDistanceInKm(
            lat,
            lng,
            donorLat,
            donorLng
          );

          const isAvailable = u.lastDonationDate
            ? new Date(u.lastDonationDate) < new Date(new Date().setMonth(new Date().getMonth() - 3))
            : true;

          const status = isAvailable ? "Available" : "Unavailable";

          return {
            id: u._id || index,
            name: u.name,
            bloodGroup: u.bloodGroup,
            donations: u.donations || 0,
            distance: `${distanceKm} km`,
            status: status,
            lastDonation: u.lastDonationDate,
            age: u.age,
            weight: u.weight,
            location: u.city || u.address || "Unknown Location",
            phone: u.phone,
            profilePhoto: u.profilePhoto // Add this line
          };
        });


        setDonors(mappedDonors);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load nearby donors", err);
        setLoading(false);
      });
  };





  if (loading) {
    return <p style={{ padding: "20px" }}>Loading nearby donors...</p>;
  }

  const handleRequest = async (donor) => {
    try {
      if (!user) return alert("Please login");

      await axios.post(`${API_BASE_URL}/api/donor-requests/send`,
        { donorId: donor.id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setSentRequests(prev => ({ ...prev, [donor.id]: "pending" }));
      alert(`Request sent to ${donor.name}!`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const filteredDonors = donors.filter(donor => {
    if (!bloodGroupFilter) return true;
    if (!donor.bloodGroup) return false;

    // Normalize: remove spaces, handle dashes, lowercase
    const normalize = (str) =>
      str.toString()
        .replace(/\s+/g, '') // Remove all spaces
        .replace(/[\u2013\u2014\u2212]/g, '-') // Normalize en-dash/em-dash/minus-sign to hyphen
        .toLowerCase();

    return normalize(donor.bloodGroup) === normalize(bloodGroupFilter);
  });

  return (
    <div className="nearby-donors">
      <h2>🩸 Nearby Donors</h2>
      <p className="subtitle">
        Find blood donors near your location
      </p>

      {/* FILTER BAR */}
      <div className="donor-filters">
        <select
          value={bloodGroupFilter}
          onChange={(e) => setBloodGroupFilter(e.target.value)}
        >
          <option value="">All Blood Groups</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
      </div>

      {/* DONOR LIST */}
      <div className="donor-list">
        {filteredDonors.length === 0 ? (
          <p>No donors found nearby using current filters.</p>
        ) : (
          filteredDonors.map((donor) => (
            <div key={donor.id} className="donor-card">
              <div className="donor-avatar">
                {/* Fixed Profile Photo Fallback */}
                {/* If donor has photo, show it, else initial */}
                {donor.profilePhoto ? (
                  <img
                    src={`${API_BASE_URL}/uploads/${donor.profilePhoto}`}
                    alt={donor.name}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = donor.name.charAt(0) }}
                  />
                ) : (
                  donor.name.charAt(0)
                )}
              </div>

              <div className="donor-info">
                <h4>{donor.name}</h4>
                <p>📍 {donor.location}</p>
                <p>
                  🩸 Blood Group: <strong>{donor.bloodGroup}</strong>
                </p>

                <p style={{ fontSize: '0.9em', color: '#2e7d32' }}>
                  🤝 Requests Accepted: <strong>{donor.donations}</strong>
                </p>

                {donor.lastDonation && (
                  <p style={{ fontSize: '0.8em', color: '#777', margin: 0 }}>📅 Last: {new Date(donor.lastDonation).toLocaleDateString()}</p>
                )}
                <div style={{ fontSize: '0.85em', color: '#555', marginTop: '5px' }}>
                  {donor.age && <span>Age: {donor.age} | </span>}
                  {donor.weight && <span>Wt: {donor.weight}kg</span>}
                </div>
                <p>📏 Distance: {donor.distance}</p>
              </div>

              {sentRequests[donor.id] === 'accepted' ? (
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <div style={{ background: '#e8f5e9', padding: '5px', borderRadius: '5px', marginBottom: '5px', color: '#2e7d32', fontWeight: 'bold' }}>
                    ✅ Approved
                  </div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>📞 {donor.phone}</p>
                </div>
              ) : sentRequests[donor.id] ? (
                <div className="donor-status">
                  <span className={donor.status === "Available" ? "status available" : "status unavailable"}>
                    {donor.status}
                  </span>
                  <button disabled style={{
                    backgroundColor: '#ed6c02',
                    cursor: 'default',
                    width: '100%'
                  }}>
                    {sentRequests[donor.id] === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                  </button>
                </div>
              ) : (
                <div className="donor-status">
                  <span className={donor.status === "Available" ? "status available" : "status unavailable"}>
                    {donor.status}
                  </span>

                  <button
                    disabled={donor.status !== "Available"}
                    onClick={() => handleRequest(donor)}
                    style={{ cursor: donor.status !== "Available" ? "not-allowed" : "pointer" }}
                  >
                    Request
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
