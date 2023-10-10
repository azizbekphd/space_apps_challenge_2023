import * as THREE from "three";
import moon_color_map from "/textures/moon_color_map.jpg";
import moon_height_map from "/textures/moon_height_map.jpg";

const appConfig = {
  camera: {
    angle: Math.PI / 10,
    distance: 100,
    minDistance: 50,
    maxDistance: 200,
    zoomSpeed: 0.3,
    rotateSpeed: 0.3,
  },

  lights: (() => {
    const lights: (THREE.Light | THREE.Object3D)[] = [];

    const sunlight = new THREE.DirectionalLight(
      new THREE.Color(0xffffff),
      1,
    );
    sunlight.position.set(0, 0, 300);
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
  },

  quakes: {
    markerHeight: 4,
  }
}

export { appConfig };

