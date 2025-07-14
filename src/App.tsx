import "./App.css";
import TrialRoom from "./components/TrialRoom";
import Navigation from "./components/Navigation";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManipulateModal from "./components/ManipulateModal";
import VirtualTrialRoom from "./components/VirtualTrialRoom/VirtualTrialRoom";
import PoseDetection from "./components/PoseDetection";
import Website3D from "./components/Website3D";

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Website3D />} />
        <Route path="/2d" element={<PoseDetection />} />
        <Route path="/trial-room" element={<TrialRoom />} />
        <Route path="/manipulate" element={<ManipulateModal />} />
        <Route path="/virtual-trial" element={<VirtualTrialRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
