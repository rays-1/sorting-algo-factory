import { getSlotX } from "@/utils/math";
import { Text } from "@react-three/drei";

export function ConveyorLine({ count }: { count: number }) {
  const width = (count - 1) * 1.6 + 2.4;
  const slotPos = (i: number) => getSlotX(i, count);

  return (
    <group>
      {/* base plinth */}
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <boxGeometry args={[width, 0.24, 2.0]} />
        <meshStandardMaterial color="#0A1217" roughness={0.85} metalness={0.15} />
      </mesh>
      {/* belt surface */}
      <mesh position={[0, -0.065, 0]} receiveShadow>
        <boxGeometry args={[width - 0.2, 0.08, 1.7]} />
        <meshStandardMaterial color="#0D171D" roughness={0.9} metalness={0.12} />
      </mesh>
      {/* side guide rails with emissive strip */}
      <mesh position={[0, 0.08, 0.86]}>
        <boxGeometry args={[width - 0.1, 0.06, 0.04]} />
        <meshStandardMaterial color="#18242A" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.08, -0.86]}>
        <boxGeometry args={[width - 0.1, 0.06, 0.04]} />
        <meshStandardMaterial color="#18242A" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* embedded cyan light strip */}
      <mesh position={[0, 0.12, 0.86]}>
        <boxGeometry args={[width - 0.6, 0.012, 0.012]} />
        <meshStandardMaterial color="#36C7D9" emissive="#36C7D9" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, 0.12, -0.86]}>
        <boxGeometry args={[width - 0.6, 0.012, 0.012]} />
        <meshStandardMaterial color="#36C7D9" emissive="#36C7D9" emissiveIntensity={1.2} />
      </mesh>
      {/* rollers */}
      {Array.from({ length: Math.max(0, count * 2) }).map((_, i) => {
        const x = -width / 2 + 0.5 + (i * (width - 1)) / Math.max(1, count * 2 - 1);
        return (
          <mesh key={i} position={[x, -0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 1.72, 10]} />
            <meshStandardMaterial color="#1A2A32" roughness={0.55} metalness={0.35} />
          </mesh>
        );
      })}
      {/* slot markers + coordinate labels */}
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} position={[slotPos(i), -0.055, 0]}>
          {/* slot plate */}
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[1.18, 0.015, 1.46]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#121F25" : "#0F1C22"} roughness={0.8} />
          </mesh>
          {/* thin border */}
          <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.18, 1.46]} />
            <meshBasicMaterial color="#1E333C" transparent opacity={0.0} />
          </mesh>
          {/* LED */}
          <mesh position={[0, 0.03, 0.66]}>
            <boxGeometry args={[0.28, 0.012, 0.012]} />
            <meshStandardMaterial color="#36C7D9" emissive="#36C7D9" emissiveIntensity={0.9} />
          </mesh>
          {/* coordinate text */}
          <Text
            position={[0, 0.035, 0.5]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.16}
            color="#5A727B"
            anchorX="center"
            anchorY="middle"
            font="/fonts/ibm-plex-mono.woff"
            // fallback if font missing — drei will use default
          >
            {String(i + 1).padStart(2, "0")}
          </Text>
          {/* world coordinate tiny label */}
          <Text
            position={[0, 0.035, -0.55]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.08}
            color="#2C444E"
            anchorX="center"
          >
            {`S${String(i).padStart(2, "0")}`}
          </Text>
        </group>
      ))}
      {/* structural supports */}
      {Array.from({ length: Math.max(2, Math.ceil(count / 3) + 1) }).map((_, i) => {
        const cnt = Math.ceil(count / 3) + 1;
        const x = -width / 2 + 0.4 + (i * (width - 0.8)) / Math.max(1, cnt - 1);
        return (
          <mesh key={`sup-${i}`} position={[x, -0.55, 0]}>
            <boxGeometry args={[0.16, 0.7, 1.2]} />
            <meshStandardMaterial color="#080D10" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}
