import { useState, useEffect, useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import L from "leaflet";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

// Fix for default markers in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Icons using Base64 to avoid network issues
const requestIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiBmaWxsPSIjZDMyZjJmIj48cGF0aCBkPSJNMTIgMkwyIDEyLDIyIDM2Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iNCIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMTIgMmMtNC45NyAwLTkgNC4wMy05IDkgMCA1LjI1IDcgMTMgOSAxMyAyIDAgOS03Ljc1IDktMTMtNC45NyAwLTktOS05LTl6bTAgMTEuNWMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0TIuNSAyLjUtMi41IDIuNSAxLjEyIDIuNSAyLjUtMS4xMiAyLjUtMi41IDIuNXoiLz48L3N2Zz4=', // Custom Red SVG
     // Fallback to a simpler reliable URL or just use the default L.Icon with CSS filters if creating B64 is too complex for this context. 
     // Using a reliable CDN for pins:
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Since user reported colors are not shown, it's likely the github raw URLs are blocked or failing.
// Let's use CSS filters on default default markers if possible, OR standard Leaflet markers.
// Actually, let's try a different source or standard colors.

// Better approach: Use local assets or standard Cloudflare CDNs which are more reliable.
const redIcon = new L.Icon({
	iconUrl: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000',
	iconSize: [21, 34],
	iconAnchor: [10, 34],
	popupAnchor: [1, -34],
	shadowUrl: 'https://chart.apis.google.com/chart?chst=d_map_pin_shadow',
	shadowSize: [40, 37],
	shadowAnchor: [12, 35]
});

const greenIcon = new L.Icon({
	iconUrl: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|2E7D32',
	iconSize: [21, 34],
	iconAnchor: [10, 34],
	popupAnchor: [1, -34],
    shadowUrl: 'https://chart.apis.google.com/chart?chst=d_map_pin_shadow',
	shadowSize: [40, 37],
	shadowAnchor: [12, 35]
});

const blueIcon = new L.Icon({
	iconUrl: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|2196F3',
	iconSize: [21, 34],
	iconAnchor: [10, 34],
	popupAnchor: [1, -34],
    shadowUrl: 'https://chart.apis.google.com/chart?chst=d_map_pin_shadow',
	shadowSize: [40, 37],
	shadowAnchor: [12, 35]
});

// Helper component to auto-fit map bounds
function FitMapBounds({ markers }) {
    const map = useMap(); // requires standard leaflet import or from react-leaflet usage
    // Access map instance via useMap hook from react-leaflet
    
    useEffect(() => {
        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [markers, map]);
    
    return null;
}

export default function BloodMap() {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [donors, setDonors] = useState([]);
    const [banks, setBanks] = useState([]);
    const [center, setCenter] = useState([18.5204, 73.8567]); // Default Pune
    const [filter, setFilter] = useState("all"); 
    const [visibleMarkers, setVisibleMarkers] = useState([]);

    useEffect(() => {
        // Collect visible coordinates for auto-zoom
        const coords = [];
        
        if (filter === "all" || filter === "requests") {
            posts.forEach(p => {
                const lat = p.location?.coordinates?.[1] || p.lat;
                const lng = p.location?.coordinates?.[0] || p.lng;
                if(lat && lng) coords.push([lat, lng]);
            });
        }
        
        if (filter === "all" || filter === "donors") {
            donors.forEach(d => {
                const lat = d.location?.coordinates?.[1];
                const lng = d.location?.coordinates?.[0];
                if(lat && lng && (d.isDonor || (d.age && d.age > 0))) coords.push([lat, lng]);
            });
        }
        
        if (filter === "all" || filter === "banks") {
            banks.forEach(b => {
                if(b.lat && b.lng) coords.push([b.lat, b.lng]);
            });
        }
        
        // Also add user center if available
        if(center) coords.push(center);

        setVisibleMarkers(coords);
    }, [posts, donors, banks, filter, center]);

    useEffect(() => {
        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const { latitude, longitude } = pos.coords;
                setCenter([latitude, longitude]);
                fetchData(latitude, longitude);
            }, () => {
                fetchData(18.5204, 73.8567);
            });
        } else {
            fetchData(18.5204, 73.8567);
        }
    }, [user]);

    const fetchData = async (lat, lng) => {
        try {
            const resPosts = await axios.get(`${API_BASE_URL}/api/posts`);
            // 2. Fetch Donors (Try 'All', fallback to 'Nearby')
            let resDonors;
            try {
                 resDonors = await axios.get(`${API_BASE_URL}/api/users/all-donors`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
            } catch (e) {
                console.warn("All-donors endpoint failed, falling back to nearby", e);
                resDonors = await axios.get(`${API_BASE_URL}/api/users/nearby?lat=${lat}&lng=${lng}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
            }
            const resBanks = await axios.get(`${API_BASE_URL}/api/blood-banks`, {
                 headers: { Authorization: `Bearer ${user?.token}` }
            });

            setPosts(resPosts.data);
            setDonors(resDonors.data);
            setBanks(resBanks.data);
        } catch (err) {
            console.error("Failed to fetch map data", err);
        }
    };

    return (
        <div style={{ height: "100vh", width: "100%", position: "relative" }}>
            <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Auto Fit Bounds */}
                <FitMapBounds markers={visibleMarkers} />

                {/* 🔴 REQUESTS Markers */}
                {(filter === "all" || filter === "requests") && posts.map(post => {
                    const lat = post.location?.coordinates?.[1] || post.lat;
                    const lng = post.location?.coordinates?.[0] || post.lng;
                    if (!lat || !lng) return null;

                    return (
                        <Marker key={post._id} position={[lat, lng]} icon={redIcon}>
                            <Popup>
                                <strong>🔴 Request: {post.bloodGroup}</strong><br/>
                                <span style={{fontSize: '0.9em', color: '#555'}}>
                                    {post.user?.name}<br/>
                                    📍 {post.user?.city || post.user?.address || "Location unavailable"}<br/>
                                </span>
                                <hr style={{margin: "5px 0", border: 0, borderTop: "1px solid #eee"}}/>
                                {post.description}
                                <br/>
                                <span style={{fontSize:'0.8em', color:'#888'}}>
                                    ({Number(lat).toFixed(4)}, {Number(lng).toFixed(4)})
                                </span>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* 🟢 DONORS Markers */}
                {(filter === "all" || filter === "donors") && donors.map(donor => {
                    const lat = donor.location?.coordinates?.[1];
                    const lng = donor.location?.coordinates?.[0];
                    if (!lat || !lng) return null;

                    if (!donor.isDonor && (!donor.age || donor.age <= 0)) return null;

                    return (
                        <Marker key={donor._id} position={[lat, lng]} icon={greenIcon}>
                            <Popup>
                                <strong>🟢 Donor: {donor.name}</strong><br/>
                                Group: {donor.bloodGroup}<br/>
                                📍 {donor.city || donor.address || "Location unavailable"}<br/>
                                <Link to="/donors">Request Donation</Link>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* 🏥 BLOOD BANKS Markers */}
                {(filter === "all" || filter === "banks") && banks.map(bank => {
                    if (!bank.lat || !bank.lng) return null; 
                    
                    return (
                        <Marker key={bank._id} position={[bank.lat, bank.lng]} icon={blueIcon}>
                            <Popup>
                                <strong>🏥 {bank.name}</strong><br/>
                                📍 {bank.address}, {bank.city}<br/>
                                {bank.phone}<br/>
                                {bank.type}
                            </Popup>
                        </Marker>
                    );
                })}
                
                {/* 📍 USER LOCATION */}
               <CircleMarker center={center} pathOptions={{ color: 'blue', fillColor: 'blue' }} radius={8}>
                    <Popup>You are here</Popup>
               </CircleMarker>

            </MapContainer>
            
            {/* Legend Filter Overlay */}
            <div style={{
                position: "absolute", 
                bottom: "20px", 
                left: "20px", 
                background: "white", 
                padding: "15px", 
                borderRadius: "12px", 
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                zIndex: 1000,
                minWidth: "160px"
            }}>
                <h4 style={{margin: "0 0 10px 0", fontSize: "1rem"}}>Map Legend (Filter)</h4>
                
                <div 
                    onClick={() => setFilter(filter === "requests" ? "all" : "requests")}
                    style={{
                        display:'flex', alignItems:'center', gap: 8, marginBottom: 8, cursor: 'pointer',
                        opacity: filter === "all" || filter === "requests" ? 1 : 0.4
                    }}
                >
                    <span style={{color:'red'}}>●</span> Blood Request
                </div>

                <div 
                    onClick={() => setFilter(filter === "donors" ? "all" : "donors")}
                    style={{
                        display:'flex', alignItems:'center', gap: 8, marginBottom: 8, cursor: 'pointer',
                        opacity: filter === "all" || filter === "donors" ? 1 : 0.4
                    }}
                >
                    <span style={{color:'green'}}>●</span> Active Donor
                </div>

                <div 
                    onClick={() => setFilter(filter === "banks" ? "all" : "banks")}
                    style={{
                        display:'flex', alignItems:'center', gap: 8, cursor: 'pointer',
                        opacity: filter === "all" || filter === "banks" ? 1 : 0.4
                    }}
                >
                    <span style={{color:'blue'}}>●</span> Blood Bank
                </div>
                
                {filter !== "all" && (
                    <div 
                        onClick={() => setFilter("all")}
                        style={{marginTop: 10, fontSize: "0.8em", textDecoration: "underline", cursor: "pointer", color: "#666"}}
                    >
                        Show All
                    </div>
                )}
            </div>
        </div>
    );
}
