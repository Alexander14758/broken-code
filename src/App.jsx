// App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Mainpage from "./pages/Mainpage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mainpage" element={<Mainpage />} />
      </Routes>
    </BrowserRouter>
  );
}
