import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useFactoryStore } from "@/store/useFactoryStore";
import { FactoryLighting } from "./FactoryLighting";
import { ConveyorLine } from "./ConveyorLine";
import { Crate } from "./Crate";
import { GantryCrane, type GantryHandle } from "./GantryCrane";
import { SafetyRails } from "./SafetyRails";

function SceneContent({ gantryRef, meshMap }: { gantryRef: React.RefObject<GantryHandle | null>; meshMap: React.MutableRefObject<Map<number, THREE.Mesh>> }) {
  const count = useFactoryStore((s) => s.workingArray.length);
  const workingArray = useFactoryStore((s) => s.workingArray);
  const generation = useFactoryStore((s) => s.generation);

  // widen view for larger arrays
  const camX = 0;
  const camY = 5.2 + Math.min(2, count * 0.04);
  const camZ = 12 + Math.min(6, count * 0.22);

  return (
    <>
      <PerspectiveCamera makeDefault position={[camX, camY, camZ]} fov={38} near={0.1} far={80} />
      <FactoryLighting />
      <ConveyorLine count={count} />
      <SafetyRails count={count} />
      <GantryCrane ref={gantryRef as never} count={count} />
      {/* crates — key by crate id so physical crate travels with its value */}
      {workingArray.map((crate, i) => (
        <Crate
          key={crate.id}
          index={i}
          value={crate.value}
          count={count}
          generation={generation}
          register={(idx, mesh) => {
            if (mesh) meshMap.current.set(idx, mesh);
            else meshMap.current.delete(idx);
          }}
        />
      ))}
      {/* floor */}
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 24]} />
        <meshStandardMaterial color="#05090C" roughness={0.95} />
      </mesh>
      <gridHelper args={[50, 50, "#0F1E25", "#0A1318"]} position={[0, -1.09, 0]} />
    </>
  );
}

export function FactoryScene({
  gantryRef,
  meshMap,
}: {
  gantryRef: React.RefObject<GantryHandle | null>;
  meshMap: React.MutableRefObject<Map<number, THREE.Mesh>>;
}) {
  const generation = useFactoryStore((s) => s.generation);
  const count = useFactoryStore((s) => s.workingArray.length);
  return (
    <Canvas
      key={`factory-${generation}-${count}`}
      dpr={[1, 1.5]}
      shadows={false}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", display: "block", background: "#05090C" }}
      camera={{ position: [0, 5.5, 12], fov: 38 }}
    >
      <SceneContent gantryRef={gantryRef} meshMap={meshMap} />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={28}
        minPolarAngle={0.12}
        maxPolarAngle={1.38}
        target={[0, 0.35, 0]}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.42}
        zoomSpeed={0.75}
      />
    </Canvas>
  );
}

// Helper hook for executor to resolve slot X — keep for external use
import { getSlotX } from "@/utils/math";
export function useSlotHelper() {
  const count = useFactoryStore((s) => s.workingArray.length);
  return (idx: number) => getSlotX(idx, count);
}
