import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
      <nav className="bg-gray-800 flex flex-col h-screen w-1/6 items-center px-4 text-white">
          <h1>TESTING</h1>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/MusicExplorer">Music</NavLink>
          <NavLink to="/Player">Player</NavLink>
      </nav>
  );
}
