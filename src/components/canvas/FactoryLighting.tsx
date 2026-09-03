export function FactoryLighting() {
  return (
    <>
      <ambientLight intensity={1.15} color="#9EB8C2" />
      <directionalLight position={[8, 10, 6]} intensity={1.35} color="#E6F2F6" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-7, 6, -5]} intensity={0.7} color="#36C7D9" />
      <pointLight position={[0, 4.5, 0]} intensity={0.9} color="#36C7D9" distance={22} decay={2} />
      <hemisphereLight args={["#B8D2D8", "#05090C", 0.55]} />
    </>
  );
}
