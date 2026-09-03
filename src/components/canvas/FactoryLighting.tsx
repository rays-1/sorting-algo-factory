import { useMemo } from "react";

export function FactoryLighting() {
  // matte, controlled — not overbright
  const colorCyan = useMemo(() => "#36C7D9", []);
  return (
    <>
      <ambientLight intensity={0.45} color="#0A1217" />
      <directionalLight
        position={[6, 8, 4]}
        intensity={1.1}
        color="#B8D2D8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 4, -3]} intensity={0.35} color={colorCyan} />
      <pointLight position={[0, 4, 0]} intensity={0.6} color={colorCyan} distance={18} decay={2} />
      <pointLight position={[0, 0.2, 1.5]} intensity={0.25} color="#F5A623" distance={8} />
      <hemisphereLight args={["#0D171D", "#05090C", 0.3]} />
    </>
  );
}
