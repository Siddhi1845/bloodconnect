import api from "../api/axios";

export default function NearbyFilter({ setPosts }) {
  const loadNearby = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await api.get(
        `/posts/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`
      );
      setPosts(res.data);
    });
  };

  return (
    <button className="filterButton nearby" onClick={loadNearby}>
      📍 Nearby Requests
    </button>
  );
}
