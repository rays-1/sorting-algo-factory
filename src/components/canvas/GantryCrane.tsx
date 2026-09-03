import { useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

export type GantryHandle = {
  carriage: THREE.Group;
  head: THREE.Group;
};

export const GantryCrane = forwardRef<GantryHandle, { count: number }>(
  ({ count }, ref) => {
    const carriageRef = useRef<THREE.Group>(null!);
    const headRef = useRef<THREE.Group>(null!);

    useImperativeHandle(ref, () => ({
      get carriage() {
        return carriageRef.current;
      },
      get head() {
        return headRef.current;
      },
    }));

    const width = (count - 1) * 1.6 + 4;

    return (
      <group>
        {/* overhead rail */}
        <mesh position={[0, 3.1, 0]}>
          <boxGeometry args={[width, 0.14, 0.22]} />
          <meshStandardMaterial color="#0F1A1F" roughness={0.6} metalness={0.55} />
        </mesh>
        {/* rail emissive underside */}
        <mesh position={[0, 3.02, 0]}>
          <boxGeometry args={[width - 0.4, 0.02, 0.08]} />
          <meshStandardMaterial color="#36C7D9" emissive="#36C7D9" emissiveIntensity={0.7} />
        </mesh>

        {/* carriage */}
        <group ref={carriageRef} position={[0, 3.1, 0]}>
          {/* carriage body */}
          <mesh position={[0, -0.14, 0]}>
            <boxGeometry args={[0.9, 0.22, 0.55]} />
            <meshStandardMaterial color="#18242A" roughness={0.55} metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <boxGeometry args={[0.92, 0.04, 0.57]} />
            <meshStandardMaterial color="#36C7D9" emissive="#36C7D9" emissiveIntensity={1.0} />
          </mesh>
          {/* winch cables */}
          <mesh position={[-0.18, -0.7, 0]}>
            <boxGeometry args={[0.014, 1.1, 0.014]} />
            <meshStandardMaterial color="#2A3A42" />
          </mesh>
          <mesh position={[0.18, -0.7, 0]}>
            <boxGeometry args={[0.014, 1.1, 0.014]} />
            <meshStandardMaterial color="#2A3A42" />
          </mesh>
          {/* head */}
          <group ref={headRef} position={[0, -1.25, 0]}>
            {/* housing */}
            <mesh>
              <boxGeometry args={[0.62, 0.28, 0.42]} />
              <meshStandardMaterial color="#111E25" roughness={0.6} metalness={0.4} />
            </mesh>
            {/* inspection lens */}
            <mesh position={[0, -0.16, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.08, 16]} />
              <meshStandardMaterial color="#36C7D9" emissive="#36C7D9" emissiveIntensity={1.2} transparent opacity={0.92} />
            </mesh>
            <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.14, 0.17, 24]} />
              <meshBasicMaterial color="#67E3F2" transparent opacity={0.55} />
            </mesh>
            {/* clamp arms */}
            <mesh position={[-0.24, 0.02, 0]} rotation={[0, 0, 0.18]}>
              <boxGeometry args={[0.06, 0.22, 0.06]} />
              <meshStandardMaterial color="#1E2F38" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0.24, 0.02, 0]} rotation={[0, 0, -0.18]}>
              <boxGeometry args={[0.06, 0.22, 0.06]} />
              <meshStandardMaterial color="#1E2F38" metalness={0.6} roughness={0.4} />
            </mesh>
            {/* scan line */}
            <mesh position={[0, -0.26, 0]}>
              <boxGeometry args={[1.0, 0.008, 0.008]} />
              <meshStandardMaterial color="#67E3F2" emissive="#67E3F2" emissiveIntensity={1.6} />
            </mesh>
          </group>
        </group>
      </group>
    );
  },
);
GantryCrane.displayName = "GantryCrane";
