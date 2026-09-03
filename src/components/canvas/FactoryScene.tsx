import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo, useCallback } from "react";
import { useFactoryStore } from "@/store/useFactoryStore";
import { FactoryLighting } from "./FactoryLighting";
import { ConveyorLine } from "./ConveyorLine";
import { Crate } from "./Crate";
import { GantryCrane, type GantryHandle } from "./GantryCrane";
import { SafetyRails } from "./SafetyRails";
import { DustParticles } from "./DustParticles";
import type { CameraPreset } from "@/types/sorting";

// Structural type for the controls — avoids importing transitive drei internals.
type ControlsHandle = {
  target: THREE.Vector3;
  update: () => void;
};

function presetPose(
  preset: CameraPreset,
  count: number,
  outPos: THREE.Vector3,
  outTarget: THREE.Vector3,
): number {
  const baseY = 5.2 + Math.min(2, count * 0.04);
  const baseZ = 12 + Math.min(6, count * 0.22);
  switch (preset) {
    case "inspection":
      outPos.set(0, 1.9, 5.6);
      outTarget.set(0, 0.18, 0);
      return 34;
    case "gantry":
      outPos.set(0, 3.9, 4.4);
      outTarget.set(0, 1.55, 0);
      return 36;
    case "topo":
      outPos.set(0, 13.5, 0.6);
      outTarget.set(0, 0, 0);
      return 42;
    default:
      outPos.set(0, baseY, baseZ);
      outTarget.set(0, 0.35, 0);
      return 38;
  }
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Transition-only rig: animates ~1.4s after a preset/count change, then
// releases the camera so OrbitControls never fight the user.
function CameraRig() {
  const preset = useFactoryStore((s) => s.cameraPreset);
  const count = useFactoryStore((s) => s.workingArray.length);
  const { camera } = useThree();
  const controls = useThree((s) => s.controls) as unknown as ControlsHandle | null;

  const fromPos = useMemo(() => new THREE.Vector3(), []);
  const fromTarget = useMemo(() => new THREE.Vector3(), []);
  const toPos = useMemo(() => new THREE.Vector3(), []);
  const toTarget = useMemo(() => new THREE.Vector3(), []);
  const progress = useRef(1);
  const fromFov = useRef(38);
  const toFov = useRef(38);
  const prev = useRef({ preset, count });

  useFrame((_, rawDelta) => {
    if (!controls) return;
    const delta = Math.min(rawDelta, 0.05);
    if (prev.current.preset !== preset || prev.current.count !== count) {
      prev.current = { preset, count };
      fromPos.copy(camera.position);
      fromTarget.copy(controls.target);
      fromFov.current = (camera as THREE.PerspectiveCamera).fov ?? 38;
      toFov.current = presetPose(preset, count, toPos, toTarget);
      progress.current = 0;
    }
    if (progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + delta / 1.4);
    const e = easeInOut(progress.current);
    camera.position.lerpVectors(fromPos, toPos, e);
    controls.target.lerpVectors(fromTarget, toTarget, e);
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.fov !== undefined) {
      cam.fov = fromFov.current + (toFov.current - fromFov.current) * e;
      cam.updateProjectionMatrix();
    }
    controls.update();
  });
  return null;
}

function SceneContent({ gantryRef, meshMap }: {
  gantryRef: React.RefObject<GantryHandle | null>;
  meshMap: React.MutableRefObject<Map<number, THREE.Mesh>>;
}) {
  const count = useFactoryStore((s) => s.workingArray.length);
  const workingArray = useFactoryStore((s) => s.workingArray);

  const register = useCallback((idx: number, mesh: THREE.Mesh | null) => {
    if (mesh) meshMap.current.set(idx, mesh);
    else meshMap.current.delete(idx);
  }, [meshMap]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5.2, 12]} fov={38} near={0.1} far={80} />
      <CameraRig />
      <FactoryLighting />
      <ConveyorLine count={count} />
      <SafetyRails count={count} />
      <GantryCrane ref={gantryRef as never} count={count} />
      <DustParticles count={70} />
      {/* crates — key by crate id so the physical crate travels with its value */}
      {workingArray.map((crate, i) => (
        <Crate
          key={crate.id}
          index={i}
          value={crate.value}
          count={count}
          register={register}
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
  // Remount the canvas only when slot layout changes — never on
  // reset/algorithm switch (crate ids already remount the crates).
  const count = useFactoryStore((s) => s.workingArray.length);
  return (
    <Canvas
      key={`factory-${count}`}
      dpr={[1, 1.5]}
      shadows={false}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", display: "block", background: "#05090C" }}
    >
      <SceneContent gantryRef={gantryRef} meshMap={meshMap} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={30}
        minPolarAngle={0.02}
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
