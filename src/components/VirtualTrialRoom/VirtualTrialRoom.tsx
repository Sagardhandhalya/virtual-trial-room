import { useState } from "react";
import useVirtualTrialRoom from "./useVirtualTrialRoom";
import styles from "./VirtualTrialRoom.module.css";

// Example assets (add more as needed)
const SHIRTS = [
  { src: "/assets/maroon-suite-upper.png", name: "Maroon Upper" },
  { src: "/assets/shirt.png", name: "Shirt 1" },
  { src: "/assets/suite-upper.png", name: "Suite Upper" },
];
const PENTS = [
  { src: "/assets/maroon-suite-lower.png", name: "Maroon Lower" },
  { src: "/assets/pent.png", name: "Pent 1" },
  { src: "/assets/suite-lower.png", name: "Suit lower" },
];

const VirtualTrialRoom = () => {
  const {
    videoRef,
    canvasRef,
    pentImgRef,
    shirtImgRef,
    handleShirtChange,
    handlePentChange,
  } = useVirtualTrialRoom();

  // State for selected clothes
  const [selectedShirt, setSelectedShirt] = useState(SHIRTS[0]?.src || "");
  const [selectedPent, setSelectedPent] = useState(PENTS[0]?.src || "");

  return (
    <div className={`${styles.trialRoomFlex} ${styles.lightTheme}`}>
      {/* Left: Clothing selection */}
      <div className={styles.trialRoomSidebar}>
        <div className={styles.trialRoomSection}>
          <h3>Shirts</h3>
          <div className={styles.trialRoomThumbnails}>
            {SHIRTS.map((shirt) => (
              <img
                key={shirt.src}
                src={shirt.src}
                alt={shirt.name}
                className={`${styles.trialRoomThumb} ${
                  selectedShirt === shirt.src ? styles.selected : ""
                }`}
                onClick={() => {
                  setSelectedShirt(shirt.src);
                  handleShirtChange(shirt.src);
                }}
              />
            ))}
          </div>
        </div>
        <div className={styles.trialRoomSection}>
          <h3>Pents</h3>
          <div className={styles.trialRoomThumbnails}>
            {PENTS.map((pent) => (
              <img
                key={pent.src}
                src={pent.src}
                alt={pent.name}
                className={`${styles.trialRoomThumb} ${
                  selectedPent === pent.src ? styles.selected : ""
                }`}
                onClick={() => {
                  setSelectedPent(pent.src);
                  handlePentChange(pent.src);
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Right: Canvas */}
      <div className={styles.trialRoomCanvasWrap}>
        <video ref={videoRef} style={{ display: "none" }} playsInline muted />
        <canvas ref={canvasRef} className={styles.trialRoomCanvas} />
        {/* Preload images for overlay */}
        <img
          ref={pentImgRef}
          src={selectedPent}
          alt="pent"
          style={{ display: "none" }}
        />
        <img
          ref={shirtImgRef}
          src={selectedShirt}
          alt="shirt"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default VirtualTrialRoom;
