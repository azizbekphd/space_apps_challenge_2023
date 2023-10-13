import * as THREE from "three";

export function xyzToLatLong(point: THREE.Vector3, radius: number) {
  const lat = Math.asin(point.y / radius);
  const lon = Math.atan(point.x / point.z) - (point.z > 0 ? 0 : Math.PI);
  return [THREE.MathUtils.radToDeg(lat), THREE.MathUtils.radToDeg(lon)];
}

