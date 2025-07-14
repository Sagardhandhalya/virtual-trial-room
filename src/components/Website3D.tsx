import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

function AnimatedSuitModel({ scrollProgress = 0 }: { scrollProgress: number }) {
  const ref = useRef<THREE.Object3D>(null);
  useFrame(() => {
    if (ref.current) {
      // Spin based on scroll progress (0 to 1)
      ref.current.rotation.y = Math.PI / 8 + scrollProgress * Math.PI * 2.5;
    }
  });
  const { scene } = useGLTF("/fancy_tailcoat_suit.glb");
  return (
    <primitive ref={ref} object={scene} scale={2.2} position={[0, -1.5, 0]} />
  );
}

export default function Website3D() {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const el = leftPanelRef.current;
      if (el) {
        const maxScroll = el.scrollHeight - el.clientHeight;
        const progress = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
        setScrollProgress(progress);
      }
    };
    const el = leftPanelRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    // Also listen to window scroll and sync left panel scroll
    const handleWindowScroll = () => {
      if (!el) return;
      // Set left panel scrollTop to window.scrollY
      el.scrollTop = window.scrollY;
      handleScroll();
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  // Header height
  const HEADER_HEIGHT = 72;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(120deg, #e3eaff 0%, #f7f7f7 100%)",
        overflow: "hidden",
      }}
    >
      {/* 3D Model fixed on the right */}
      <div
        style={{
          position: "fixed",
          // top: HEADER_HEIGHT,
          right: 0,
          width: "50vw",
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          zIndex: 1,
          background: "linear-gradient(120deg, #e3eaff 0%, #f7f7f7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <Canvas camera={{ position: [0, 1.5, 6], fov: 40 }} shadows>
            <color attach="background" args={["#f7f7f7"]} />
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[5, 10, 5]}
              intensity={1.2}
              castShadow
            />
            <Suspense fallback={null}>
              <Environment preset="city" />
              <AnimatedSuitModel scrollProgress={scrollProgress} />
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.5}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>
      {/* Left: Scrollable Sections, takes full viewport and scrolls */}
      <div
        ref={leftPanelRef}
        style={{
          position: "relative",
          zIndex: 2,
          width: "100vw",
          height: "100vh",
          overflowY: "scroll",
          background: "transparent",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          [data-hide-scrollbar]::-webkit-scrollbar { display: none; }
          [data-hide-scrollbar] { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div data-hide-scrollbar style={{ width: "50vw", minWidth: 320 }}>
          <div
            style={{
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 60,
              // paddingTop: HEADER_HEIGHT,
              borderBottom: "1.5px solid #e3eaff",
            }}
          >
            <h1
              style={{
                fontSize: "3.8rem",
                fontWeight: 900,
                color: "#1976d2",
                marginBottom: "1.5rem",
                letterSpacing: 2,
                textShadow: "0 4px 24px #1976d233",
                textAlign: "left",
                lineHeight: 1.1,
              }}
            >
              Wear Your Confidence
            </h1>
            <p
              style={{
                fontSize: "1.7rem",
                color: "#333",
                maxWidth: 520,
                textAlign: "left",
                lineHeight: 1.5,
              }}
            >
              Step into a new era of suiting. Where style meets technology, and
              every fit is made for you.
            </p>
          </div>
          <div
            style={{
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 60,
              borderBottom: "1.5px solid #e3eaff",
            }}
          >
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#222",
                marginBottom: "1rem",
                textAlign: "left",
                lineHeight: 1.2,
              }}
            >
              Tailored for You
            </h2>
            <p
              style={{
                fontSize: "1.3rem",
                color: "#444",
                maxWidth: 420,
                textAlign: "left",
                lineHeight: 1.5,
              }}
            >
              At Banjara, we believe confidence starts with the perfect fit. Our
              mission is to empower you to look and feel your best, every day.
            </p>
          </div>
          <div
            style={{
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 60,
              borderBottom: "1.5px solid #e3eaff",
            }}
          >
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 800,
                color: "#1976d2",
                marginBottom: "1rem",
                textAlign: "left",
                lineHeight: 1.2,
              }}
            >
              Try On, Virtually
            </h2>
            <p
              style={{
                fontSize: "1.2rem",
                color: "#333",
                maxWidth: 420,
                textAlign: "left",
                lineHeight: 1.5,
              }}
            >
              Use our virtual trial room to see how our suits fit you in real
              time. Choose your style, adjust your look, and find your perfect
              match—all from the comfort of home.
            </p>
            <button
              style={{
                marginTop: 32,
                alignSelf: "flex-start",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "14px 36px",
                fontSize: 20,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px #1976d233",
                transition: "background 0.2s",
                letterSpacing: 1,
              }}
              onClick={() => navigate("/virtual-trial")}
            >
              Try Now
            </button>
          </div>
          <div
            style={{
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 60,
              borderBottom: "1.5px solid #e3eaff",
            }}
          >
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#1976d2",
                marginBottom: "1rem",
                textAlign: "left",
                lineHeight: 1.2,
              }}
            >
              Discover the Collection
            </h2>
            <p
              style={{
                fontSize: "1.3rem",
                color: "#333",
                maxWidth: 420,
                textAlign: "left",
                lineHeight: 1.5,
              }}
            >
              Explore our range of modern and classic suits, crafted for every
              occasion. Scroll to see them in 3D.
            </p>
          </div>
          <div
            style={{
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 60,
            }}
          >
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 800,
                color: "#222",
                marginBottom: "1rem",
                textAlign: "left",
                lineHeight: 1.2,
              }}
            >
              What Our Customers Say
            </h2>
            <p
              style={{
                fontSize: "1.2rem",
                color: "#444",
                maxWidth: 420,
                textAlign: "left",
                lineHeight: 1.5,
              }}
            >
              “The virtual trial room made suit shopping so easy!”
              <br />
              “I’ve never felt more confident in a suit.”
              <br />
              “Banjara is the future of fashion.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preload the GLB model
useGLTF.preload("/fancy_tailcoat_suit.glb");
