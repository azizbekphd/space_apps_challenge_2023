import * as THREE from "three";

export const colorFromMagnitude: (m: number, maxM: number) => THREE.Color = (m, maxM=4) => {
  let [r, g, b] = [0, 0, 0];
  if (m > maxM * 3 / 4) {
    r = 255;
    g = Math.round((m - 3) * 255);
    b = 0;
  } else if (m > maxM * 2 / 4) {
    r = Math.round((m - 2) * 255);
    g = 255;
    b = 0;
  } else if (m > maxM / 4) {
    r = 0;
    g = 255;
    b = Math.round((m - 1) * 255);
  } else {
    r = 0;
    g = Math.round(m * 255);
    b = 255;
  }

  const color = new THREE.Color(
    "#" +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  );
  return color;
}

