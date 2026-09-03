import { getSlotX } from "@/utils/math";

export function SafetyRails({ count }: { count: number }) {
  if (count <= 0) return null;
  const left = getSlotX(0, count) - 1.2;
  const right = getSlotX(count - 1, count) + 1.2;
  const length = right - left + 0.6;
  return (
    <group>
      {/* front & back rails */}
      <mesh position={[0, 0.42, 0.95]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.06, 0.05]} />
        <meshStandardMaterial color="#18242A" roughness={0.7} metalness={0.45} />
      </mesh>
      <mesh position={[0, 0.42, -0.95]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.06, 0.05]} />
        <meshStandardMaterial color="#18242A" roughness={0.7} metalness={0.45} />
      </mesh>
      {/* vertical struts */}
      {Array.from({ length: Math.max(2, Math.ceil(count / 4) + 1) }).map((_, i) => {
        const t = length ? (i / (Math.max(1, Math.ceil(count / 4)))) : 0;
        const x = left - 0.3 + t * length;
        return (
          <group key={i} position={[x, 0.22, 0]}>
            <mesh position={[0, 0, 0.95]}><boxGeometry args={[0.04, 0.45, 0.04]} /><meshStandardMaterial color="#0F1A1F" /></mesh>
            <mesh position={[0, 0, -0.95]}><boxGeometry args={[0.04, 0.45, 0.04]} /><meshStandardMaterial color="#0F1A1F" /></mesh>
          </group>
        );
      })}
      {/* hazard strip */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length - 0.4, 0.03]} />
        <meshBasicMaterial color="#F5A623" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
