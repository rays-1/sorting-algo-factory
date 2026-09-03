import { PlaybackControls } from "./PlaybackControls";
import type { GantryHandle } from "@/components/canvas/GantryCrane";
import type * as THREE from "three";

export function ControlDesk(props: {
  gantryRef: React.RefObject<GantryHandle | null>;
  meshMap: React.MutableRefObject<Map<number, THREE.Mesh>>;
}) {
  return <PlaybackControls {...props} />;
}
