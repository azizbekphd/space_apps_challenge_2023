import * as THREE from "three";
import { degreesToRadians } from "./degreesToRadians";

export function latLongToXyz(lat: number, lon: number, r: number = 1) {
  return new THREE.Vector3(
    r * Math.sin(Math.PI / 2 - degreesToRadians(lat)) * Math.sin(degreesToRadians(lon)),
    r * Math.cos(Math.PI / 2 - degreesToRadians(lat)),
    r * Math.sin(Math.PI / 2 - degreesToRadians(lat)) * Math.cos(degreesToRadians(lon)),
  );
}
