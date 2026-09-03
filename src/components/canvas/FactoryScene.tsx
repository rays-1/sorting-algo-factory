import { useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useFactoryStore } from "@/store/useFactoryStore";
import { getSlotX } from "@/utils/math";
import { FactoryLighting } from "./FactoryLighting";
import { ConveyorLine } from "./ConveyorLine";
import { Crate } from "./Crate";
import { GantryCrane, type GantryHandle } from "./GantryCrane";
import { SafetyRails } from "./SafetyRails";
import { DustParticles } from "./DustParticles";

function CameraRig({ preset }: { preset: string }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    let tx = 0, ty = 2.8, tz = 10, lookY = 0.6;
    switch (preset) {
      case "inspection":
        tx = 0; ty = 1.6; tz = 6.5; lookY = 0.2; break;
      case "gantry":
        tx = 0; ty = 3.4; tz = 4.5; lookY = 1.6; break;
      case "topo":
        tx = 0; ty = 8.5; tz = 0.4; lookY = -1; break;
      default: // overview
        tx = 2.2; ty = 3.8; tz = 11; lookY = 0.6;
    }
    target.set(tx, lookY, 0);
    camPos.set(tx, ty, tz);
    camera.position.lerp(camPos, Math.min(1, delta * 1.2));
    camera.lookAt(target);
  });
  return null;
}

function SceneContent({ gantryRef, meshMap }: { gantryRef: React.RefObject<GantryHandle | null>; meshMap: React.MutableRefObject<Map<number, THREE.Mesh>> }) {
  const count = useFactoryStore((s) => s.workingArray.length);
  const workingArray = useFactoryStore((s) => s.workingArray);
  const preset = useFactoryStore((s) => s.cameraPreset);

  return (
    <>
      <PerspectiveCamera makeDefault position={[2.2, 3.8, 11]} fov={42} near={0.1} far={60} />
      <CameraRig preset={preset} />
      <FactoryLighting />
      <ConveyorLine count={count} />
      <SafetyRails count={count} />
      <GantryCrane ref={gantryRef as never} count={count} />
      <DustParticles count={70} />
      <Environment preset="studio" environmentIntensity={0.18} />
      {/* crates */}
      {workingArray.map((v, i) => (
        <Crate
          key={`${i}-${v}-${count}`}
          index={i}
          value={v}
          count={count}
          register={(idx, mesh) => {
            if (mesh) meshMap.current.set(idx, mesh);
            else meshMap.current.delete(idx);
          }}
        />
      ))}
      {/* floor */}
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#05090C" roughness={0.92} />
      </mesh>
      {/* grid overlay */}
      <gridHelper args={[40, 40, "#0F1E25", "#0A1318"]} position={[0, -1.09, 0]} />
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
  const count = useFactoryStore((s) => s.workingArray.length);
  const key = `factory-${count}`;

  return (
    <Canvas
      key={key}
      dpr={[1, 1.5]}
      shadows
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ background: "#05090C" }}
    >
      <SceneContent gantryRef={gantryRef} meshMap={meshMap} />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={18}
        minPolarAngle={0.18}
        maxPolarAngle={1.35}
        target={[0, 0.5, 0]}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.45}
        zoomSpeed={0.7}
      />
    </Canvas>
  );
}

// Helper hook for executor to resolve slot X
export function useSlotHelper() {
  const count = useFactoryStore((s) => s.workingArray.length);
  return (idx: number) => getSlotX(idx, count);
}
