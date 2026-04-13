import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import Rightbar from "../components/RightSidebar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="home">
        <div className="homeContainer">
          <Sidebar />
          <Feed />
          <Rightbar />
        </div>
      </div>
    </>
  );
}
