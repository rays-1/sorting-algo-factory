import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useFactoryStore } from "@/store/useFactoryStore";
import { FactoryLighting } from "./FactoryLighting";
import { ConveyorLine } from "./ConveyorLine";
import { Crate } from "./Crate";
import { GantryCrane, type GantryHandle } from "./GantryCrane";
import { SafetyRails } from "./SafetyRails";

function CameraRig({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const preset = useFactoryStore((s) => s.cameraPreset);
  const count = useFactoryStore((s) => s.workingArray.length);
  const { camera } = useThree();
  const targetVec = useMemo(() => new THREE.Vector3(), []);
  const posVec = useMemo(() => new THREE.Vector3(), []);
  const curPos = useMemo(() => new THREE.Vector3(), []);
  const curTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    // base overview adapts to array size
    const baseY = 5.2 + Math.min(2, count * 0.04);
    const baseZ = 12 + Math.min(6, count * 0.22);
    let tx = 0, ty = baseY, tz = baseZ, lookX = 0, lookY = 0.35, lookZ = 0;
    let fov = 38;
    switch (preset) {
      case "inspection":
        tx = 0; ty = 1.9; tz = 5.6; lookY = 0.18; fov = 34; break;
      case "gantry":
        tx = 0; ty = 3.9; tz = 4.4; lookY = 1.55; fov = 36; break;
      case "topo":
        tx = 0; ty = 13.5; tz = 0.6; lookY = 0; lookZ = 0; fov = 42; break;
      default: // overview
        break;
    }
    targetVec.set(lookX, lookY, lookZ);
    posVec.set(tx, ty, tz);

    // lerp controls target — this drives OrbitControls look
    curTarget.copy(controls.target);
    curTarget.lerp(targetVec, Math.min(1, delta * 1.8));
    controls.target.copy(curTarget);

    // lerp camera position
    curPos.copy(camera.position);
    curPos.lerp(posVec, Math.min(1, delta * 1.6));
    camera.position.copy(curPos);

    // lerp fov
    if ((camera as THREE.PerspectiveCamera).fov !== undefined) {
      const cam = camera as THREE.PerspectiveCamera;
      cam.fov += (fov - cam.fov) * Math.min(1, delta * 1.5);
      cam.updateProjectionMatrix();
    }
    controls.update();
  });
  return null;
}

function SceneContent({ gantryRef, meshMap, controlsRef }: { gantryRef: React.RefObject<GantryHandle | null>; meshMap: React.MutableRefObject<Map<number, THREE.Mesh>>; controlsRef: React.RefObject<any> }) {
  const count = useFactoryStore((s) => s.workingArray.length);
  const workingArray = useFactoryStore((s) => s.workingArray);
  const generation = useFactoryStore((s) => s.generation);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5.2, 12]} fov={38} near={0.1} far={80} />
      <CameraRig controlsRef={controlsRef} />
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
  const controlsRef = useRef<any>(null);
  return (
    <Canvas
      key={`factory-${generation}-${count}`}
      dpr={[1, 1.5]}
      shadows={false}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", display: "block", background: "#05090C" }}
    >
      <SceneContent gantryRef={gantryRef} meshMap={meshMap} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={4}
        maxDistance={30}
        minPolarAngle={0.08}
        maxPolarAngle={1.45}
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
