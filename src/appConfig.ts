import * as THREE from "three";
import moon_color_map from "/textures/moon_color_map.jpg";
import moon_height_map from "/textures/moon_height_map.jpg";
import getRandomStarField from "./utils/getRandomStarField";

const appConfig = {
  camera: {
    angle: Math.PI / 10,
    distance: 100,
    minDistance: 50,
    maxDistance: 200,
    zoomSpeed: 0.3,
    rotateSpeed: 0.3,
    maximumClickTime: 200,
    animationDuration: 0.5,
  },

  lights: (() => {
    const lights: (THREE.Light | THREE.Object3D)[] = [];

    const sunlight = new THREE.DirectionalLight(
      new THREE.Color(0xffffff),
      1,
    );
    const skyBox = new THREE.BoxGeometry(1300, 1300, 1300);
    const skyBoxMaterial = new THREE.MeshBasicMaterial({
      map: getRandomStarField(600, 2048, 2048),
    	side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyBox, skyBoxMaterial);
    sky.position.set(0, 0, -600);
    sunlight.add(sky);
    sunlight.position.set(0, 0, 600);
    const sunlightColor = 0xffdd00;
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2, 64, 64),
      new THREE.MeshBasicMaterial({
        color: sunlightColor,
      }),
    );
    sunlight.add(sun);

    const sunGlowings = [
      new THREE.Mesh(
        new THREE.SphereGeometry(10, 64, 64),
        new THREE.MeshBasicMaterial({
          color: sunlightColor,
          transparent: true,
          opacity: 0.2,
        }),
      ),
      new THREE.Mesh(
        new THREE.SphereGeometry(20, 64, 64),
        new THREE.MeshBasicMaterial({
          color: sunlightColor,
          transparent: true,
          opacity: 0.1,
        }),
      ),
      new THREE.Mesh(
        new THREE.SphereGeometry(40, 64, 64),
        new THREE.MeshBasicMaterial({
          color: sunlightColor,
          transparent: true,
          opacity: 0.05,
        }),
      ),
    ];
    sunGlowings.forEach(g => sunlight.add(g));
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
      helperRadius: 30,
      helperWidthSegments: 32,
      helperHeightSegments: 32,
      colorMap: {
        path: moon_color_map,
      },
      displacementMap: {
        path: moon_height_map,
      }
    },
    pointerLight: {
      intensity: 6,
      color: 0xffffff,
      downColor: 0xffff00,
      distance: 0,
      angle: Math.PI / 4,
      penumbra: 0,
      decay: 2,
      factor: 1.05,
    }
  },

  quakes: {
    markerHeight: 4,
    selectedQuakeLight: {
      color: 0xff0000,
      intensity: 6,
      distance: 0,
      angle: Math.PI / 4,
      penumbra: 0,
      decay: 2,
      factor: 1.05,
    },
  }
}

export { appConfig };

