import * as THREE from "three";
import moon_color_map from "../public/textures/moon_color_map.jpg";
import moon_height_map from "../public/textures/moon_height_map.jpg";

const appConfig = {
  camera: {
    angle: Math.PI / 6,
    distance: 100,
  },

  lights: (() => {
    const lights: (THREE.Light | THREE.Object3D)[] = [];

    const sunlight = new THREE.DirectionalLight(
      new THREE.Color(0xffffff),
      1,
    );
    sunlight.position.set(300, 0, 0);
    const sunlightColor = 0xfdfbd8;
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshBasicMaterial({
        color: sunlightColor,
      }),
    );
    sunlight.add(sun);
    lights.push(sunlight);

    const ambient = new THREE.AmbientLight(
      new THREE.Color(0xffffff),
      0.02,
    );
    lights.push(ambient);

    return lights;
  })(),

  moon: {
    generalView: {
      radius: 30,
      widthSegments: 1024,
      heightSegments: 1024,
      colorMap: {
        path: moon_color_map,
      },
      displacementMap: {
        path: moon_height_map,
      }
    },
  }
}

export { appConfig };

