import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import PoseDetection from "./components/PoseDetection";
import TrialRoom from "./components/TrialRoom";
import Navigation from "./components/Navigation";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import * as THREE from "three";

useGLTF.preload("/young_male.glb");

const Modal = ({
  scene,
  currentColor,
}: {
  scene: THREE.Group;
  currentColor: string;
}) => {
  // const texure = useTexture("/vite.svg");
  const ref = useRef(null);

  // useFrame((state, delta) => {
  //   ref.current.rotation.y += delta * 0.5;
  // });

  useEffect(() => {
    // scene.traverse((child) => {
    //   if (child.isMesh) {
    //     child.material.color.set(currentColor);
    //   }
    // });

    const shirt = scene.getObjectById(29) as THREE.Mesh | null;
    if (
      shirt &&
      shirt.material &&
      shirt.material instanceof THREE.MeshStandardMaterial
    ) {
      shirt.material.color.set(currentColor);
    }
  }, [currentColor, scene]);

  // useEffect(() => {
  //   scene.traverse((child) => {
  //     console.log(child);
  //     if (child.isMesh) {
  //       child.material.color.set(currentColor); // Change to blue
  //       child.castShadow = true;
  //     }
  //   });

  //   // const mesh = scene.getObjectById(16);
  //   // mesh.material.color.set(currentColor);
  // }, [scene, currentColor]);

  // useEffect(() => {
  //   console.log(scene.children[0]?.children);
  //   const mesh = scene.getObjectById(23);
  //   mesh?.position.set(3, 3, 3);
  //   mesh.material.map = texure;
  //   mesh.material.needsUpdate = true;
  // }, [scene, texure]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <primitive object={scene} ref={ref} />
      {/* <mesh geometry={nodesy} material={materials.ShirtMaterial} /> */}

      <OrbitControls enableRotate />
    </>
  );
};
function App() {
  const [currentColor, setCurrentColor] = useState("#BE9167");

  const { scene } = useGLTF("/young_male.glb");
  console.log(scene);

  const onClick = () => {
    // const targetMesh = scene.getObjectById(18); // Change 23 to your actual ID

    // if (targetMesh && targetMesh.isMesh) {
    //   targetMesh.geometry.dispose(); // optional cleanup
    //   targetMesh.geometry = targetMesh.clone(true); // 🎲 Replace with cube
    //   targetMesh.material.color.set("red"); // optionally update color
    // }

    const shirt = scene.getObjectById(16);

    if (shirt && shirt instanceof THREE.Mesh) {
      const copy = shirt.clone();
      console.log(copy.id);
      // Optional: clone geometry/material if you want independence
      copy.geometry = (shirt.geometry as THREE.BufferGeometry).clone();
      copy.material = (shirt.material as THREE.Material).clone();
      if ((copy.material as THREE.MeshStandardMaterial).color) {
        (copy.material as THREE.MeshStandardMaterial).color.set("red");
      }
      // Change position so it's not on top of the original
      copy.position.set(0, 0, 0);
      copy.rotation.set(-Math.PI / 2, 0, 0);
      // Add it to the scene or to the parent of the original
      scene.add(copy);
    }
  };

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <div className="m-4">
              <h1 className="text-3xl font-bold  text-center mb-6">
                Virtual Trial
              </h1>
              <Canvas
                className="w-full !h-[60vh] bg-gray-200"
                camera={{ fov: 75, position: [0, 0, 15] }}
              >
                <Modal scene={scene} currentColor={currentColor} />
              </Canvas>
              <div className="flex flex-col items-center justify-center mt-24">
                <button onClick={onClick}>Add default cloth</button>
                <h1 className="text-center text-2xl">Update clothes color</h1>
                <div>
                  <input
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    type="color"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              <div></div>
            </div>
          }
        />
        <Route path="/2d" element={<PoseDetection />} />
        <Route path="/trial-room" element={<TrialRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
