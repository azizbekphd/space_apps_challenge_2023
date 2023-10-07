import * as THREE from "three";

import { App } from "../types/App";
import { MVCView } from "../types/MVCView";
import { Runnable } from "../types/Runnable";
import { AppConfig } from "../types/AppConfig";

class ThreeVisuals {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor () {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
  }

  setupRenderer () {
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
  }

  setupCamera (config: AppConfig) {
    const cameraAngle = config.camera.angle;
    const cameraDistance = config.camera.distance;
    this.camera.position.z = Math.cos( cameraAngle ) * cameraDistance;
    this.camera.position.y = - Math.sin( cameraAngle ) * cameraDistance;
    this.camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
    this.scene.add(this.camera);
  }

  setupLights (config: AppConfig) {
    config.lights.forEach(light => {
      this.scene.add(light);
    });
  }

  animate () {
    requestAnimationFrame(this.animate);

    this.renderer.render(this.scene, this.camera);
  }

  setup (config: AppConfig) {
    this.setupRenderer();
    this.setupCamera(config);
    this.setupLights(config);
  }
}

export class AppView implements MVCView, Runnable {
  app: App;
  visuals: ThreeVisuals;

  constructor (app: App) {
    this.app = app;
    this.visuals = new ThreeVisuals();
  }

  run () {
    this.visuals.setup(this.app.config);
  }
}

