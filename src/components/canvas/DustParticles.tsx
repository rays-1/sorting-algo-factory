import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Ambient particulates — static buffer, rotation-only drift.
// No per-frame attribute writes: the GPU buffer is uploaded once.
export function DustParticles({ count = 70 }: { count?: number }) {
  const ptsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    // deterministic LCG so renders are stable (and lint-clean)
    let seed = 0x2f6e2b1;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 28;
      arr[i * 3 + 1] = rand() * 3 + 0.2;
      arr[i * 3 + 2] = (rand() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ptsRef.current) return;
    ptsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
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
