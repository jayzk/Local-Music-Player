import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from "react-router-dom";
import HomePage from "./pages/Home";
import MainLayout from "./Layouts/MainLayout";
import AddMusicYT from "./pages/AddMusicYT";

const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="AddMusicYT" element={<AddMusicYT />} />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
