import { useEffect, useState } from 'react';
import * as THREE from 'three';

interface SceneDebuggerProps {
  scene: THREE.Group;
}

const SceneDebugger: React.FC<SceneDebuggerProps> = ({ scene }) => {
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

export default SceneDebugger;