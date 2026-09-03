import { useMemo, useRef } from "react";
import { Text, Edges } from "@react-three/drei";
import * as THREE from "three";
import { getSlotX } from "@/utils/math";
import { useFactoryStore } from "@/store/useFactoryStore";

type CrateState = "idle" | "compare" | "swap" | "pivot" | "sorted";

type Props = {
  index: number;
  value: number;
  count: number;
  register: (idx: number, mesh: THREE.Mesh | null) => void;
};

const BASE_H = 0.52;
const STEP = 0.018;
const W = 1.02;
const D = 1.0;

export function Crate({ index, value, count, register }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const compareIndices = useFactoryStore((s) => s.compareIndices);
  const swapIndices = useFactoryStore((s) => s.swapIndices);
  const pivotIndex = useFactoryStore((s) => s.pivotIndex);
  const sortedSet = useFactoryStore((s) => s.sortedIndices);

  const h = BASE_H + value * STEP;
  const x = getSlotX(index, count);

  let state: CrateState = "idle";
  if (sortedSet.has(index)) state = "sorted";
  else if (pivotIndex === index) state = "pivot";
  else if (swapIndices && (swapIndices[0] === index || swapIndices[1] === index)) state = "swap";
  else if (compareIndices && (compareIndices[0] === index || compareIndices[1] === index)) state = "compare";

  const matColor = useMemo(() => {
    switch (state) {
      case "sorted": return "#0E2A24";
      case "pivot": return "#2B1A13";
      case "swap": return "#2A2010";
      case "compare": return "#0F2228";
      default: return "#0E1A1F";
    }
  }, [state]);

  const emissive = useMemo(() => {
    switch (state) {
      case "sorted": return "#42C6A5";
      case "pivot": return "#E04B4B";
      case "swap": return "#F5A623";
      case "compare": return "#36C7D9";
      default: return "#18242A";
    }
  }, [state]);

  const emissiveIntensity = state === "idle" ? 0.18 : state === "sorted" ? 0.55 : 0.85;

  // avoid re-creating geometry per frame
  const geom = useMemo(() => new THREE.BoxGeometry(W, h, D), [h]);

  return (
    <mesh
      ref={(m) => {
        // @ts-expect-error assignment
        meshRef.current = m;
        register(index, m);
        if (m) {
          m.position.x = x;
          m.position.y = h / 2 - 0.055;
          m.position.z = 0;
        }
      }}
      geometry={geom}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={matColor}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.72}
        metalness={0.28}
      />
      <Edges color={state === "idle" ? "#1E333C" : emissive} threshold={12} />
      {/* top plate highlight */}
      <mesh position={[0, h / 2 - 0.025, 0]}>
        <boxGeometry args={[W - 0.06, 0.02, D - 0.06]} />
        <meshStandardMaterial color="#0A1217" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* numeric readout — holographic style */}
      <group position={[0, h / 2 + 0.18, 0]}>
        <mesh>
          <planeGeometry args={[0.9, 0.38]} />
          <meshBasicMaterial color="#05090C" transparent opacity={0.82} />
        </mesh>
        <Text
          position={[0, 0.04, 0.01]}
          fontSize={0.22}
          color={state === "sorted" ? "#42C6A5" : state === "pivot" ? "#E88A7A" : "#B8D2D8"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#05090C"
        >
          {String(value).padStart(3, "0")}
        </Text>
        <Text
          position={[0, -0.11, 0.01]}
          fontSize={0.07}
          color="#5A727B"
          anchorX="center"
          letterSpacing={0.04}
        >
          {`UNIT ${String(index + 1).padStart(2, "0")}`}
        </Text>
      </group>
      {/* side indicator dots */}
      <mesh position={[W / 2 - 0.08, -h / 2 + 0.2, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.5]} />
        <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={emissiveIntensity + 0.6} />
      </mesh>
      <mesh position={[-W / 2 + 0.08, -h / 2 + 0.2, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.5]} />
        <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={emissiveIntensity + 0.6} />
      </mesh>
      {/* sorted lock clamp */}
      {state === "sorted" && (
        <group position={[0, -h / 2 + 0.08, 0]}>
          <mesh position={[0, 0, 0.52]}>
            <boxGeometry args={[W + 0.04, 0.06, 0.06]} />
            <meshStandardMaterial color="#42C6A5" emissive="#42C6A5" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, 0, -0.52]}>
            <boxGeometry args={[W + 0.04, 0.06, 0.06]} />
            <meshStandardMaterial color="#42C6A5" emissive="#42C6A5" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}
    </mesh>
  );
}
