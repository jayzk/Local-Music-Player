import "react-h5-audio-player/lib/styles.css";
import NavTop from "../Components/NavTop";
import DisplayHome from "../Components/DisplayHome";

export default function Home() {
  return (
    <div className="h-full py-2">
      <div className="h-[30%] lg:h-[10%]">
        <NavTop />
      </div>
      <div className="h-[70%] lg:h-[90%]">
        <DisplayHome />
      </div>
    </div>
  );
}
