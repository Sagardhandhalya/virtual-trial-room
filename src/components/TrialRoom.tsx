import { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import './TrialRoom.css';

// Debug component to show scene objects
const SceneDebugger = ({ scene }: { scene: THREE.Group }) => {
  const [sceneInfo, setSceneInfo] = useState<string[]>([]);

  useEffect(() => {
    const info: string[] = [];
    
    scene.traverse((child: THREE.Object3D) => {
      if (child.isMesh) {
        const mesh = child as THREE.Mesh;
        info.push(`Mesh ID: ${mesh.id}, Name: "${mesh.name}", Type: ${mesh.type}`);
        
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            info.push(`  Materials: ${mesh.material.length} materials`);
          } else {
            info.push(`  Material: ${mesh.material.type}, Color: ${(mesh.material as any).color?.getHexString() || 'N/A'}`);
          }
        }
      }
    });
    
    setSceneInfo(info);
  }, [scene]);

  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4">
      <h3 className="font-bold text-gray-800 mb-2">Scene Debug Info:</h3>
      <div className="max-h-40 overflow-y-auto text-xs">
        {sceneInfo.map((info, index) => (
          <div key={index} className="mb-1 font-mono">{info}</div>
        ))}
      </div>
    </div>
  );
};

useGLTF.preload('/young_male.glb');

interface ClothingItem {
  id: string;
  name: string;
  type: 'tshirt' | 'shirt' | 'jacket';
  color: string;
  texture?: string;
}

const clothingItems: ClothingItem[] = [
  { id: '1', name: 'Classic T-Shirt', type: 'tshirt', color: '#ffffff' },
  { id: '2', name: 'Blue T-Shirt', type: 'tshirt', color: '#3b82f6' },
  { id: '3', name: 'Red T-Shirt', type: 'tshirt', color: '#ef4444' },
  { id: '4', name: 'Formal Shirt', type: 'shirt', color: '#ffffff' },
  { id: '5', name: 'Denim Jacket', type: 'jacket', color: '#1e40af' },
];

const ModelViewer = ({ 
  scene, 
  selectedClothing, 
  userPhoto 
}: { 
  scene: THREE.Group; 
  selectedClothing: ClothingItem | null;
  userPhoto: string | null;
}) => {
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (selectedClothing && scene) {
      console.log('Updating model with clothing:', selectedClothing);
      console.log('Scene objects:', scene);
      
      // Try multiple approaches to find and update clothing
      let updated = false;
      
      // Method 1: Try specific object IDs that might be clothing
      const possibleClothingIds = [29, 16, 23, 18];
      for (const id of possibleClothingIds) {
        const object = scene.getObjectById(id) as THREE.Mesh | null;
        if (object && object.material) {
          console.log(`Found object with ID ${id}:`, object);
          if (object.material instanceof THREE.MeshStandardMaterial) {
            // Create a new material instance for better updates
            const newMaterial = object.material.clone();
            newMaterial.color.set(selectedClothing.color);
            newMaterial.needsUpdate = true;
            object.material = newMaterial;
            updated = true;
            console.log(`Updated object ${id} with color:`, selectedClothing.color);
            break;
          }
        }
      }
      
      // Method 2: Traverse all meshes and look for clothing-like objects
      if (!updated) {
        scene.traverse((child: THREE.Object3D) => {
          if (child.isMesh && child.material) {
            console.log('Found mesh:', child.name, child.id);
            if (child.material instanceof THREE.MeshStandardMaterial) {
              // Look for objects that might be clothing based on name or position
              const childName = child.name.toLowerCase();
              if (childName.includes('shirt') || childName.includes('cloth') || 
                  childName.includes('body') || childName.includes('torso') ||
                  childName.includes('upper') || childName.includes('chest')) {
                // Create a new material instance for better updates
                const newMaterial = child.material.clone();
                newMaterial.color.set(selectedClothing.color);
                newMaterial.needsUpdate = true;
                child.material = newMaterial;
                updated = true;
                console.log(`Updated clothing mesh ${child.name} with color:`, selectedClothing.color);
              }
            }
          }
        });
      }
      
      // Method 3: Update all materials if no specific clothing found
      if (!updated) {
        console.log('No specific clothing found, updating all materials');
        scene.traverse((child: THREE.Object3D) => {
          if (child.isMesh && child.material instanceof THREE.MeshStandardMaterial) {
            // Create a new material instance to ensure proper updates
            const newMaterial = child.material.clone();
            newMaterial.color.set(selectedClothing.color);
            newMaterial.needsUpdate = true;
            child.material = newMaterial;
          }
        });
      }
    }
  }, [selectedClothing, scene]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      <primitive object={scene} ref={ref} />
      <OrbitControls enableRotate enableZoom enablePan />
    </>
  );
};

const TrialRoom: React.FC = () => {
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scene } = useGLTF('/young_male.glb');

  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPhoto(e.target?.result as string);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleClothingSelect = (item: ClothingItem) => {
    setSelectedClothing(item);
    console.log('Selected clothing:', item);
  };

  const testModelUpdate = () => {
    console.log('Testing model update...');
    console.log('Current scene:', scene);
    console.log('Selected clothing:', selectedClothing);
    
    // Force a re-render
    setSelectedClothing(selectedClothing ? { ...selectedClothing } : null);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Virtual Trial Room</h1>
          <p className="text-gray-600">Upload your photo and try on different clothing items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photo Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Your Photo</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {userPhoto ? (
                    <div className="space-y-4">
                      <img 
                        src={userPhoto} 
                        alt="User uploaded" 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setUserPhoto(null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-6xl text-gray-400">📷</div>
                      <p className="text-gray-600">Click to upload your photo</p>
                      <button
                        onClick={triggerFileUpload}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Uploading...' : 'Choose Photo'}
                      </button>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* 3D Model Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3D Model Preview</h2>
              <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                <Canvas
                  camera={{ fov: 75, position: [0, 0, 15] }}
                  className="w-full h-full"
                >
                  <ModelViewer 
                    scene={scene} 
                    selectedClothing={selectedClothing}
                    userPhoto={userPhoto}
                  />
                </Canvas>
              </div>
            </div>
          </div>
        </div>

        {/* Clothing Selection */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choose Your Clothing</h2>
            <div className="mb-4">
              <button
                onClick={testModelUpdate}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Test Model Update
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {clothingItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClothingSelect(item)}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedClothing?.id === item.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="w-full h-20 rounded mb-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Debug Section */}
        <div className="mt-8">
          <SceneDebugger scene={scene} />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Upload your photo using the upload button</li>
            <li>Select a clothing item from the options below</li>
            <li>Use your mouse to rotate and zoom the 3D model</li>
            <li>See how the clothing looks on the model</li>
            <li>Check the debug info below to see available objects</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TrialRoom;