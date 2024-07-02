import { NavLink } from "react-router-dom";
import { HomeIcon, MusicalNoteIcon, PlayIcon } from "@heroicons/react/20/solid";
import logo from "../../public/assets/Logo.png"

export default function Navbar() {
  const getIcon = (title: string) => {
    switch (title) {
      case 'Home':
        return <HomeIcon className="size-5 mx-2" />;
      case 'Music':
        return <MusicalNoteIcon className="size-5 mx-2" />;
      case 'Player':
        return <PlayIcon className="size-5 mx-2" />;
      default:
        return null;
    }
  };

  return (
      <nav className="bg-slate-900 flex flex-col px-2 w-1/6 items-center drop-shadow-lg">
          <div className="my-3 size-24">
            <img src={logo} />
          </div>
          {
            [
              ['Home', '/'],
              ['Music', '/MusicExplorer'],
              ['Player', '/Player'],
            ].map(([title, url]) => (
              <NavLink key={title} to={url} className="w-full rounded-lg px-3 py-3 text-white font-medium hover:bg-slate-100 hover:text-slate-900">
                <div className="flex flex-row w-full items-center">
                  {getIcon(title)} {title}
                </div>
              </NavLink>
            ))
          }
      </nav>
  );
}
