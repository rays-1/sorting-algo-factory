import * as THREE from "three";

// Extracted for §40 DRY — used by GantryCrane.tsx
export function InspectionHead({ position = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={new THREE.Vector3(...position)}>
      <mesh>
        <boxGeometry args={[0.62, 0.28, 0.42]} />
        <meshStandardMaterial color="#111E25" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.08, 16]} />
        <meshStandardMaterial color="#36C7D9" emissive="#36C7D9" emissiveIntensity={1.2} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, -0.26, 0]}>
        <boxGeometry args={[1.0, 0.008, 0.008]} />
        <meshStandardMaterial color="#67E3F2" emissive="#67E3F2" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}
