import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from "react-router-dom";
import HomePage from "./pages/Home";
import MainLayout from "./Layouts/MainLayout";
import MusicExplorer from "./pages/MusicExplorer";
import Player from "./pages/Player";

const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="MusicExplorer" element={<MusicExplorer />} />
      <Route path="Player" element={<Player />} />
    </Route>
  )
);

function App() {
  return (    
    <RouterProvider router={router} />
  );
}

export default App;
