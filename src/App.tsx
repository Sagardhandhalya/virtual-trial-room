import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";

const Modal = ({ currentColor }: { currentColor: string }) => {
  const { scene } = useGLTF("/young_male.glb");
  const texure = useTexture("/vite.svg");

  useEffect(() => {
    scene.traverse((child) => {
      console.log(child);
      if (child.isMesh) {
        child.material.color.set(currentColor);
      }
    });
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

  useEffect(() => {
    console.log(scene.children[0]?.children);
    const mesh = scene.getObjectById(23);
    mesh?.position.set(3, 3, 3);
    // mesh.material.map = texure;
    // mesh.material.needsUpdate = true;
  }, [scene, texure]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <primitive object={scene} scale={1} />
      <OrbitControls />
    </>
  );
};
function App() {
  const [currentColor, setCurrentColor] = useState("#BE9167");

  return (
    <div className="m-4">
      <h1 className="text-3xl font-bold  text-center mb-6">Virtual Trial</h1>

      <Canvas
        className="w-full !h-[60vh] bg-gray-200"
        camera={{ fov: 75, position: [0, -5, 18] }}
      >
        <Modal currentColor={currentColor} />
      </Canvas>

      <div className="flex flex-col items-center justify-center mt-24">
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
    </div>
  );
}

export default App;
