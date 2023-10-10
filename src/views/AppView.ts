import * as THREE from "three";

import { App } from "../types/App";
import { MVCView } from "../types/MVCView";
import { Runnable } from "../types/Runnable";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "dat.gui";
import { colorFromMagnitude } from "../utils/colorFromMagnitude";
import { degreesToRadians } from "../utils/degreesToRadians";
import { quakeInfo } from "../templates/quakeInfo";

interface ThreeVisuals {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls?: OrbitControls;
  gui?: GUI;
  guiApp?: Element;
}

enum ThreeNamedObjects {
  axesHelper = "axesHelper",
  moon = "moon",
  quake = "quake:",
}

enum GUIFieldNames {
  axesHelper = "Axes helper",
  quakes = "Quakes",
  reliefScale = "Relief scale",
  ambientLightIntensity = "Ambient light",
  directionalLightIntensity = "Directional light",
}

type GUIFields = {
  [GUIFieldNames.axesHelper]: boolean,
  [GUIFieldNames.quakes]: boolean,
  [GUIFieldNames.reliefScale]: number,
  [GUIFieldNames.ambientLightIntensity]: number,
  [GUIFieldNames.directionalLightIntensity]: number,
}

export class AppView implements MVCView, Runnable {
  app: App;
  visuals: ThreeVisuals;

  constructor(app: App) {
    this.app = app;
    this.visuals = {
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000),
      renderer: new THREE.WebGLRenderer(),
    }
    this.visuals.controls = new OrbitControls(this.visuals.camera, this.visuals.renderer.domElement);
    this.animate = this.animate.bind(this);
  }

  setupRenderer() {
    this.visuals.renderer.shadowMap.enabled = true;
    this.visuals.renderer.setSize(window.innerWidth, window.innerHeight);
    this.visuals.renderer.setPixelRatio(window.devicePixelRatio);
    this.visuals.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.visuals.renderer.domElement);
  }

  setupCamera() {
    const cameraAngle = this.app.config.camera.angle;
    const cameraDistance = this.app.config.camera.distance;
    this.visuals.camera.position.z = Math.cos(cameraAngle) * cameraDistance;
    this.visuals.camera.position.y = Math.sin(cameraAngle) * cameraDistance;
    this.visuals.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.visuals.controls!.minDistance = this.app.config.camera.minDistance;
    this.visuals.controls!.maxDistance = this.app.config.camera.maxDistance;
    this.visuals.controls!.zoomSpeed = this.app.config.camera.zoomSpeed;
    this.visuals.controls!.rotateSpeed = this.app.config.camera.rotateSpeed;
    this.visuals.scene.add(this.visuals.camera);
  }

  setupLights() {
    this.app.config.lights.forEach(light => {
      this.visuals.scene.add(light);
    });
  }

  setupMoon() {
    const config = this.app.config.moon.generalView;
    const moonGeometry = new THREE.SphereGeometry(
      config.radius,
      config.widthSegments,
      config.heightSegments,
    );
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(
        this.app.config.moon.generalView.colorMap.path),
      displacementMap: new THREE.TextureLoader().load(
        this.app.config.moon.generalView.displacementMap.path),
      displacementScale: 3,
    });
    moonMaterial.needsUpdate = true;
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonMesh.name = ThreeNamedObjects.moon;
    moonMesh.position.set(0, 0, 0);
    moonMesh.rotateY(-Math.PI / 2);
    moonMesh.castShadow = true;
    this.visuals.scene.add(moonMesh);
  }

  setupQuakes() {
    this.app.model.quakes.forEach(quake => {
      const quakeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(.5, .5, this.app.config.quakes.markerHeight),
        new THREE.MeshToonMaterial({
          color: colorFromMagnitude(
            quake.magnitude,
            this.app.model.quakes.reduce<any>((a, b) =>
                Math.max(a.magnitude, b.magnitude), {magnitude: 0}).magnitude
          ),
        }),
      );
      quakeMesh.name = ThreeNamedObjects.quake + quake._id;
      this.updateQuakesPositions(quake, quakeMesh);
      this.visuals.scene.add(quakeMesh);
    });
  }

  setupHelpers() {
    const axesHelper = new THREE.AxesHelper(50);
    axesHelper.name = ThreeNamedObjects.axesHelper;
    axesHelper.visible = true;
    this.visuals.scene.add(axesHelper);
  }

  setupObjects() {
    this.setupLights();
    this.setupMoon();
    this.setupQuakes();
    this.setupHelpers();
  }

  setupGUI() {
    const fields: GUIFields = {
      [GUIFieldNames.axesHelper]: true,
      [GUIFieldNames.quakes]: true,
      [GUIFieldNames.reliefScale]: 3,
      [GUIFieldNames.ambientLightIntensity]: 0.02,
      [GUIFieldNames.directionalLightIntensity]: 1,
    }

    this.visuals.gui = new GUI();
    const generalFolder = this.visuals.gui?.addFolder("General");
    const axesHelper = this.visuals.scene.getObjectByName(ThreeNamedObjects.axesHelper)!;
    generalFolder.add(fields, GUIFieldNames.axesHelper).onChange(visible => {
      axesHelper.visible = visible;
    });
    generalFolder.add(fields, GUIFieldNames.quakes).onChange(visible => {
      this.app.model.quakes.forEach(quake => {
        this.visuals.scene.getObjectByName(
          ThreeNamedObjects.quake + quake._id,
        )!.visible = visible;
      })
    });
    generalFolder.add(fields, GUIFieldNames.reliefScale, 0, 8).onChange(scale => {
      const moon = this.visuals.scene.getObjectByName(ThreeNamedObjects.moon) as THREE.Mesh;
      (moon.material as THREE.MeshStandardMaterial).displacementScale = scale;
    });

    const lightsFolder = this.visuals.gui?.addFolder("Lights");
    lightsFolder.add(fields, GUIFieldNames.ambientLightIntensity, 0, 2, 0.02).onChange(intensity => {
      const ambientLight =
        this.visuals.scene.getObjectByProperty("type", "AmbientLight") as THREE.AmbientLight;
      ambientLight.intensity = intensity;
    });
    lightsFolder.add(fields, GUIFieldNames.directionalLightIntensity, 0, 2, 0.02).onChange(intensity => {
      const ambientLight =
        this.visuals.scene.getObjectByProperty("type", "DirectionalLight") as THREE.DirectionalLight;
      ambientLight.intensity = intensity;
    });

    this.visuals.gui?.open();
  }
  
  setupListeners() {
    const raycaster = new THREE.Raycaster();
    this.visuals.renderer.domElement.onmousemove = (e) => {
      const x = ( e.clientX / window.innerWidth ) * 2 - 1;
			const y = - ( e.clientY / window.innerHeight ) * 2 + 1;

			raycaster.setFromCamera( new THREE.Vector2(x, y), this.visuals.camera );
      const quakes = this.app.model.quakes.map<THREE.Object3D>(quake => {
        return this.visuals.scene.getObjectByName(
          ThreeNamedObjects.quake + quake._id,
        )!;
      })
			const intersects = raycaster.intersectObjects( quakes, false );
      let pointedObject: string | undefined;
			if ( intersects.length > 0 ) {
        const quakeMesh = intersects[0].object;
        pointedObject = quakeMesh.uuid;
        quakeMesh.scale.set(1.2, 1.2, 1.2);
        const quakeId = quakeMesh.name.split(":")[1];
        const quake = this.app.model.quakes.find(q => q._id == quakeId);
        this.visuals.guiApp!.innerHTML = quakeInfo(quake, {x: e.pageX, y: e.pageY});
			} else {
        this.visuals.guiApp!.innerHTML = "";
      }
      this.app.model.quakes.forEach(quake => {
        const q = this.visuals.scene.getObjectByName(
          ThreeNamedObjects.quake + quake._id,
        )!;
        if (q.uuid != pointedObject) q.scale.set(1, 1, 1);
      })
    }
    
    window.onresize = () => {
      this.visuals.camera.aspect = window.innerWidth / window.innerHeight;
      this.visuals.camera.updateProjectionMatrix();
      this.visuals.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  setupGUIApp() {
    this.visuals.guiApp = document.createElement("div");
    this.visuals.guiApp.id = "app";
    document.body.appendChild(this.visuals.guiApp);
    this.setupListeners();
  }

  updateQuakesPositions(quake: {latitude: number, longitude: number}, quakeMesh: THREE.Mesh) {
      const r = this.app.config.moon.generalView.radius + this.app.config.quakes.markerHeight / 2;
      const c = {lat: quake.latitude, lon: quake.longitude}
      quakeMesh.position.set(
        r * Math.sin(Math.PI / 2 - degreesToRadians(c.lat)) * Math.sin(degreesToRadians(c.lon)),
        r * Math.cos(Math.PI / 2 - degreesToRadians(c.lat)),
        r * Math.sin(Math.PI / 2 - degreesToRadians(c.lat)) * Math.cos(degreesToRadians(c.lon)),
      );
      quakeMesh.lookAt(0, 0, 0);
  }

  animate() {
    requestAnimationFrame(this.animate);

    this.visuals.controls?.update();
    this.visuals.renderer.render(this.visuals.scene, this.visuals.camera);
  }

  setup() {
    this.setupRenderer();
    this.setupCamera();
    this.setupObjects();
    this.setupGUI();
    this.setupGUIApp();
  }

  run() {
    this.setup();
    this.animate();
  }
}

