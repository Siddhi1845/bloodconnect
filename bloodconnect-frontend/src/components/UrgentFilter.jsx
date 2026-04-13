import api from "../api/axios";

export default function UrgentFilter({ setPosts }) {
  const loadUrgent = async () => {
    const res = await api.get("/posts/urgent");
    setPosts(res.data);
  };

  return (
    <button className="filterButton urgent" onClick={loadUrgent}>
      🔥 Urgent Requests
    </button>
  );
}
