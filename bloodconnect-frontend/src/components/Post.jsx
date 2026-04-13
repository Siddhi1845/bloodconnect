import "../styles/post.css";
export default function Post({ post }) {
  return (
    <div className="post">
      <div className="postWrapper">
        
        {/* TOP */}
        <div className="postTop">
          <div className="postTopLeft">
            <img
              className="postProfileImg"
              src="/assets/person/noAvatar.png"
              alt=""
            />
            <span className="postUsername">
              {post.user?.name || "Unknown User"}
            </span>
          </div>

          {post.urgent && (
            <span style={{ color: "#ff4d4d", fontWeight: "bold" }}>
              URGENT
            </span>
          )}
        </div>

        {/* CENTER */}
        <div className="postCenter">
          <p className="postText">
            <b>Blood Group:</b> {post.bloodGroup || "—"}
          </p>
          <p className="postText">
            <b>Units Required:</b> {post.units || "—"}
          </p>
        </div>

        {/* BOTTOM */}
        <div className="postBottom">
          <div className="postBottomLeft">
            <span>
              📞 {post.user?.phone || "Not available"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
