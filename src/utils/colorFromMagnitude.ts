import * as THREE from "three";

export const colorFromMagnitude: (m: number, maxM: number) => THREE.Color = (m, maxM=4) => {
  let [r, g, b] = [0, 0, 0];
  const unit = maxM / 4;
  if (m > unit * 3) {
    r = 255;
    g = 255 - Math.round((m - (unit * 3)) * 255);
    b = 0;
  } else if (m > unit * 2) {
    r = Math.round((m - (unit * 2)) * 255);
    g = 255;
    b = 0;
  } else if (m > unit) {
    r = 0;
    g = 255;
    b = 255 - Math.round((m - (unit * 1)) * 255);
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

