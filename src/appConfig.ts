import * as THREE from "three";

const appConfig = {
  camera: {
    angle: Math.PI / 3,
    distance: 40,
  },

  lights: (() => {
    const lights: THREE.Light[] = [];

    const sun = new THREE.PointLight(
      new THREE.Color(0xfdfbd3),
    );
    lights.push(sun);

    return lights;
  })()
}

export { appConfig };

