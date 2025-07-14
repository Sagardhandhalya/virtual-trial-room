import "./App.css";
import TrialRoom from "./components/TrialRoom";
import Navigation from "./components/Navigation";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManipulateModal from "./components/ManipulateModal";
import PoseDetection from "./components/PoseDetection";
import VirtualTrialRoom from "./components/VirtualTrialRoom/VirtualTrialRoom";

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<VirtualTrialRoom />} />
        <Route path="/2d" element={<PoseDetection />} />
        <Route path="/trial-room" element={<TrialRoom />} />
        <Route path="/manipulate" element={<ManipulateModal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
