import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function DustParticles({ count = 90 }: { count?: number }) {
  const ptsRef = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 1] = Math.random() * 3 + 0.2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ptsRef.current) return;
    const t = state.clock.elapsedTime;
    ptsRef.current.rotation.y = Math.sin(t * 0.03) * 0.06;
    // subtle drift
    const pos = ptsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      pos.setY(i, y + Math.sin(t * 0.2 + i) * 0.0003);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ptsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#1E333C" transparent opacity={0.28} sizeAttenuation depthWrite={false} />
    </points>
  );
}
