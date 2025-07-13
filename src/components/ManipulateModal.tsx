import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/character_male_sci-fi.glb";

function CharacterModel({ scales }: { scales: Record<string, number> }) {
  const { scene } = useGLTF(MODEL_PATH);
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene) return;
    // Scale Spine_55 directly by name
    const spine = scene.getObjectByName("Object_15") as THREE.Mesh | undefined;
    console.log(spine);

    if (spine) {
      spine.geometry.rotateX(35 * scales.leg);
    }
  }, [scene, scales]);

  return <primitive object={scene} ref={group} />;
}

export default function ManipulateModal() {
  const [scales, setScales] = useState({
    leg: 1,
    head: 1,
    arm: 1,
    body: 1,
  });

  const handleSlider = (part: string, value: number) => {
    setScales((prev) => ({ ...prev, [part]: value }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h2 className="text-2xl font-bold mb-4">Manipulate Character Model</h2>
      <div className="w-full max-w-2xl h-[60vh] bg-white rounded shadow mb-8">
        <Canvas
          camera={{ fov: 75, position: [10, 10, 5] }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <CharacterModel scales={scales} />
          <OrbitControls enableRotate />
        </Canvas>
      </div>
      <div className="w-full max-w-md space-y-4">
        <Slider
          label="Leg Size"
          value={scales.leg}
          min={0.5}
          max={2}
          step={0.01}
          onChange={(v) => handleSlider("leg", v)}
        />
        <Slider
          label="Head Size"
          value={scales.head}
          min={0.5}
          max={2}
          step={0.01}
          onChange={(v) => handleSlider("head", v)}
        />
        <Slider
          label="Arm Size"
          value={scales.arm}
          min={0.5}
          max={2}
          step={0.01}
          onChange={(v) => handleSlider("arm", v)}
        />
        <Slider
          label="Body Size"
          value={scales.body}
          min={0.5}
          max={2}
          step={0.01}
          onChange={(v) => handleSlider("body", v)}
        />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center space-x-4">
      <label className="w-24 font-medium">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <span className="w-12 text-right">{value.toFixed(2)}</span>
    </div>
  );
}
