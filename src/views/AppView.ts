import * as THREE from "three";

import { App } from "../types/App";
import { MVCView } from "../types/MVCView";
import { Runnable } from "../types/Runnable";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI, GUIController } from "dat.gui";
import { colorFromMagnitude } from "../utils/colorFromMagnitude";
import { appTemplates } from "../templates";
import gsap from "gsap";
import { xyzToLatLong } from "../utils/xyzToLatLong";
import { latLongToXyz } from "../utils/latLongToXyz";

enum AppComponents {
  quakeInfo = "quakeInfo",
  viewportData = "viewportData",
  magnitudeGradient = "magnitudeGradient",
}

interface ThreeVisuals {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  guiComponents: {[key in AppComponents]?: HTMLElement};
  controls?: OrbitControls;
  gui?: {
    gui: GUI;
    controllers: {[key in GUIFieldNames]?: GUIController};
  };
}

enum ThreeNamedObjects {
  axesHelper = "axesHelper",
  moon = "moon",
  moonHelper = "moonHelper",
  quake = "quake:",
  pointerHelper = "pointerHelper",
  sunGroup = "sunGroup",
  selectedQuakeHelper = "selectedQuakeHelper",
}

enum GUIFieldNames {
  axesHelper = "Axes helper",
  quakes = "Quakes",
  reliefScale = "Relief scale",
  ambientLightIntensity = "Ambient light",
  directionalLightIntensity = "Directional light",
  moonPhase = "Moon phase",
}

type GUIFields = {
  [GUIFieldNames.axesHelper]: boolean,
  [GUIFieldNames.quakes]: boolean,
  [GUIFieldNames.reliefScale]: number,
  [GUIFieldNames.ambientLightIntensity]: number,
  [GUIFieldNames.directionalLightIntensity]: number,
  [GUIFieldNames.moonPhase]: number,
}

export class AppView implements MVCView, Runnable {
  app: App;
  visuals: ThreeVisuals;
  cache: any;

  constructor(app: App) {
    this.app = app;
    this.visuals = {
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000),
      renderer: new THREE.WebGLRenderer(),
      guiComponents: {},
    }
    this.visuals.controls = new OrbitControls(this.visuals.camera, this.visuals.renderer.domElement);
    this.animate = this.animate.bind(this);
    this.cache = {};
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
      if (light instanceof THREE.DirectionalLight) {
        const sunGroup = new THREE.Group();
        sunGroup.name = ThreeNamedObjects.sunGroup;
        sunGroup.position.set(0, 0, 0);
        sunGroup.add(light);
        this.visuals.scene.add(sunGroup);
        return;
      }
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
      displacementScale: 1,
    });
    moonMaterial.needsUpdate = true;
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonMesh.name = ThreeNamedObjects.moon;
    moonMesh.position.set(0, 0, 0);
    moonMesh.rotateY(-Math.PI / 2);
    moonMesh.castShadow = true;
    this.visuals.scene.add(moonMesh);

    const moonHelperGeometry = new THREE.SphereGeometry(
      config.helperRadius,
      config.helperWidthSegments,
      config.helperHeightSegments,
    );
    const moonHelperMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });
    const moonHelperMesh = new THREE.Mesh(moonHelperGeometry, moonHelperMaterial);
    moonHelperMesh.name = ThreeNamedObjects.moonHelper;
    moonHelperMesh.position.set(0, 0, 0);
    this.visuals.scene.add(moonHelperMesh)
  }

  setupQuakes() {
    this.app.model.quakes.forEach(quake => {
      const quakeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(.5, .5, this.app.config.quakes.markerHeight),
        new THREE.MeshBasicMaterial({
          color: colorFromMagnitude(
            quake.magnitude,
            this.app.model.quakes.reduce<any>((a, b) =>
                a.magnitude > b.magnitude ? a : b, {magnitude: 0}).magnitude
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

    const pointerHelperConfig = this.app.config.moon.pointerLight;
    const pointerHelper = new THREE.PointLight(
      new THREE.Color(pointerHelperConfig.color),
      pointerHelperConfig.intensity,
      pointerHelperConfig.distance,
      pointerHelperConfig.decay,
    );
    pointerHelper.name = ThreeNamedObjects.pointerHelper;
    pointerHelper.visible = false;
    this.visuals.scene.add(pointerHelper);

    const selectedQuakeHelperConfig = this.app.config.quakes.selectedQuakeLight;
    const selectedQuakeHelper = new THREE.PointLight(
      new THREE.Color(selectedQuakeHelperConfig.color),
      pointerHelperConfig.intensity,
      pointerHelperConfig.distance,
      pointerHelperConfig.decay,
    );
    selectedQuakeHelper.name = ThreeNamedObjects.selectedQuakeHelper;
    selectedQuakeHelper.visible = false;
    this.visuals.scene.add(selectedQuakeHelper);
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
      [GUIFieldNames.reliefScale]: 1,
      [GUIFieldNames.ambientLightIntensity]: 0.02,
      [GUIFieldNames.directionalLightIntensity]: 1,
      [GUIFieldNames.moonPhase]: 50,
    }

    this.visuals.gui = {
      gui: new GUI(),
      controllers: {},
    };
    const generalFolder = this.visuals.gui?.gui?.addFolder("General");
    const axesHelper = this.visuals.scene.getObjectByName(ThreeNamedObjects.axesHelper)!;
    generalFolder.add(fields, GUIFieldNames.axesHelper).onChange(visible => {
      axesHelper.visible = visible;
    });
    generalFolder.add(fields, GUIFieldNames.quakes).onChange(visible => {
      this.app.model.quakes.forEach(quake => {
        this.visuals.scene.getObjectByName(
          ThreeNamedObjects.quake + quake._id,
        )!.visible = visible;
      });
      this.visuals.guiComponents.magnitudeGradient!.style!.display =
        visible ? "block" : "none";
    });
    generalFolder.add(fields, GUIFieldNames.reliefScale, 0, 8).onChange(scale => {
      const moon = this.visuals.scene.getObjectByName(ThreeNamedObjects.moon) as THREE.Mesh;
      (moon.material as THREE.MeshStandardMaterial).displacementScale = scale;
      (moon.material as THREE.MeshStandardMaterial).displacementBias = - scale / 2;
    });

    const lightsFolder = this.visuals.gui?.gui?.addFolder("Lights");
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

    const advancedFolder = this.visuals.gui?.gui?.addFolder("Advanced");
    this.visuals.gui!.controllers![GUIFieldNames.moonPhase] =
    advancedFolder.add(fields, GUIFieldNames.moonPhase, 0, 100, 1).onChange(phase => {
      if (this.cache.manualMoonPhaseChange) {
        this.cache.manualMoonPhaseChange = false;
        return;
      }
      this.app.controller.setMoonPhase(phase);
    });

    this.visuals.gui?.gui?.open();
  }
  
  setupListeners() {
    window.onload = () => {
      const magnitudeGradient = document.createElement("div");
      magnitudeGradient.innerHTML = appTemplates.magnitudeGradient({
        visible: true,
        min: 0,
        max: this.app.model.quakes.reduce<any>((a, b) =>
          a.magnitude > b.magnitude ? a : b, {magnitude: 0}).magnitude,
      });
      document.body.appendChild(magnitudeGradient);
      this.visuals.guiComponents.magnitudeGradient = magnitudeGradient;
      const cameraCoords = xyzToLatLong(
        this.visuals.camera.position,
        this.visuals.camera.position.distanceTo(new THREE.Vector3(0,0,0)));
      this.visuals.guiComponents.viewportData!.innerHTML = appTemplates.viewportData(
        {lat: cameraCoords[0], lon: cameraCoords[1]},
      );
    }

    const raycaster = new THREE.Raycaster();
    const onPointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
			const y = - (e.clientY / window.innerHeight) * 2 + 1;

			raycaster.setFromCamera(new THREE.Vector2(x, y), this.visuals.camera);
      const quakes = this.app.model.quakes.map<THREE.Object3D>(quake => {
        return this.visuals.scene.getObjectByName(
          ThreeNamedObjects.quake + quake._id,
        )!;
      })
      const moonHelper = this.visuals.scene.getObjectByName(ThreeNamedObjects.moonHelper)!;
			const intersects = raycaster.intersectObjects(
          [...quakes, moonHelper], false);
      let pointedObject: string | undefined;
			if (intersects.length > 0) {
        const pointedMesh = intersects[0].object;
        document.body.style.cursor = "pointer";

        if (pointedMesh.name.startsWith(ThreeNamedObjects.quake)) {
          pointedObject = pointedMesh.uuid;
          pointedMesh.scale.set(1.2, 1.2, 1.2);
          const pointerHelper = this.visuals.scene.getObjectByName(
            ThreeNamedObjects.pointerHelper)! as THREE.PointLight;
          pointerHelper.color = ((pointedMesh as
            THREE.Mesh).material as THREE.MeshBasicMaterial).color;
          const quakeId = pointedMesh.name.split(":")[1];
          const quake = this.app.model.quakes.find(q => q._id == quakeId);
          this.visuals.guiComponents.quakeInfo!.innerHTML =
            appTemplates.quakeInfo(quake, {x: e.pageX, y: e.pageY});
        } else {
          const pointerHelper = this.visuals.scene.getObjectByName(
            ThreeNamedObjects.pointerHelper)! as THREE.PointLight;
          pointerHelper.color = new THREE.Color(
            this.app.config.moon.pointerLight.color);
          this.visuals.guiComponents.quakeInfo!.innerHTML = "";
        }

        const moonHelper = intersects.find(i => {
          return i.object.name === ThreeNamedObjects.moonHelper;
        });
        if (!moonHelper) return;
        const point = moonHelper.point;
        const pointerCoords = xyzToLatLong(point,
            this.app.config.moon.generalView.helperRadius);
        const cameraCoords = xyzToLatLong(
          this.visuals.camera.position,
          this.visuals.camera.position.distanceTo(new THREE.Vector3(0,0,0)));
        this.visuals.guiComponents.viewportData!.innerHTML = appTemplates.viewportData(
          {lat: cameraCoords[0], lon: cameraCoords[1]},
          {lat: pointerCoords[0], lon: pointerCoords[1]},
        );
        const pointerHelper = this.visuals.scene.getObjectByName(
          ThreeNamedObjects.pointerHelper) as THREE.PointLight;
        point.multiplyScalar(this.app.config.moon.pointerLight.bias);
        pointerHelper.visible = true;
        pointerHelper.position.set(point.x, point.y, point.z);
			} else {
        document.body.style.cursor = "auto";
        this.visuals.guiComponents.quakeInfo!.innerHTML = "";
        const cameraCoords = xyzToLatLong(
          this.visuals.camera.position,
          this.visuals.camera.position.distanceTo(new THREE.Vector3(0,0,0)));
        this.visuals.guiComponents.viewportData!.innerHTML = appTemplates.viewportData(
          {lat: cameraCoords[0], lon: cameraCoords[1]},
        );
        const pointerHelper = this.visuals.scene.getObjectByName(
          ThreeNamedObjects.pointerHelper) as THREE.PointLight;
        pointerHelper.visible = false;
      }
      this.app.model.quakes.forEach(quake => {
        const q = this.visuals.scene.getObjectByName(
          ThreeNamedObjects.quake + quake._id,
        )!;
        if (q.uuid != pointedObject) q.scale.set(1, 1, 1);
      })
    }
    window.onpointermove = onPointerMove;
    
    let downTime = Date.now();
    window.onpointerdown = () => {
      downTime = Date.now();

      const pointerHelper = this.visuals.scene.getObjectByName(
        ThreeNamedObjects.pointerHelper) as THREE.PointLight;
      pointerHelper.color = new THREE.Color(
        this.app.config.moon.pointerLight.downColor);
    }

    window.onpointerup = (e) => {
      const pointerHelper = this.visuals.scene.getObjectByName(
        ThreeNamedObjects.pointerHelper) as THREE.PointLight;
      pointerHelper.color = new THREE.Color(
        this.app.config.moon.pointerLight.color);

      if ((Date.now() - downTime) > this.app.config.camera.maximumClickTime) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
			const y = - (e.clientY / window.innerHeight) * 2 + 1;

			raycaster.setFromCamera(new THREE.Vector2(x, y), this.visuals.camera);
      const quakes = this.app.model.quakes.map<THREE.Object3D>(quake => {
        return this.visuals.scene.getObjectByName(
          ThreeNamedObjects.quake + quake._id,
        )!;
      })
      const moonHelper = this.visuals.scene.getObjectByName(ThreeNamedObjects.moonHelper)!;
			const intersects = raycaster.intersectObjects(
          [...quakes, moonHelper], false);
			if (intersects.length > 0) {
        const pointedMesh = intersects[0].object;
        const angles = new THREE.Vector3(0, 0, 0);
        const cameraDistance = this.visuals.camera.position.distanceTo(
          new THREE.Vector3(0, 0, 0),
        );
        if (pointedMesh.name.startsWith(ThreeNamedObjects.quake)) {
          const point = pointedMesh.position;
          const r = this.app.config.moon.generalView.helperRadius;
          angles.set(
            point.x / r,
            point.y / r,
            point.z / r,
          );
          this.app.controller.selectQuake(pointedMesh.name.split(":")[1]);
        } else {
          this.app.controller.selectQuake();
        }
        if (pointedMesh.name === ThreeNamedObjects.moonHelper) {
          const point = intersects[0].point;
          const r = this.app.config.moon.generalView.helperRadius;
          angles.set(
            point.x / r,
            point.y / r,
            point.z / r,
          );
        }
        this.visuals.controls!.enabled = false;
        gsap.to(this.visuals.camera.position, {
          x: angles.x * cameraDistance,
          y: angles.y * cameraDistance,
          z: angles.z * cameraDistance,
          duration: this.app.config.camera.animationDuration,
          ease: "rough",
          onUpdate: () => {
            onPointerMove(e);
          },
          onComplete: () => {
            this.visuals.controls!.enabled = true;
          }
        })
      } else {
        this.app.controller.selectQuake();
      }
    }
    
    window.onresize = () => {
      this.visuals.camera.aspect = window.innerWidth / window.innerHeight;
      this.visuals.camera.updateProjectionMatrix();
      this.visuals.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  setupGUIApp() {
    Object.values(AppComponents).forEach(id => {
      const component = document.createElement("div");
      component.id = id;
      document.body.appendChild(component);
      this.visuals.guiComponents![id] = component;
    });
    this.setupListeners();
  }

  updateQuakesPositions(quake: {latitude: number, longitude: number}, quakeMesh: THREE.Mesh) {
      const r = this.app.config.moon.generalView.radius;
      const c = {lat: quake.latitude, lon: quake.longitude}
      quakeMesh.position.copy(latLongToXyz(c.lat, c.lon, r));
      quakeMesh.lookAt(0, 0, 0);
  }

  updateSelectedQuake() {
    const selectedQuake = this.app.model.selectedQuake;
    const helper = this.visuals.scene.getObjectByName(
      ThreeNamedObjects.selectedQuakeHelper)! as THREE.PointLight;
    if (!selectedQuake) {
      helper.visible = false;
      return;
    }
    helper.visible = true;
    helper.color = colorFromMagnitude(
      selectedQuake.magnitude,
      this.app.model.quakes.reduce<any>((a, b) =>
          a.magnitude > b.magnitude ? a : b, {magnitude: 0}).magnitude
    );
    helper.position.copy(latLongToXyz(
      selectedQuake.latitude,
      selectedQuake.longitude,
      this.app.config.moon.generalView.helperRadius *
        this.app.config.quakes.selectedQuakeLight.bias,
    ));
  }

  updateMoonAge() {
    const moonAge = this.app.model.moonAge;
    const sunGroup = this.visuals.scene.getObjectByName(ThreeNamedObjects.sunGroup)!;
    gsap.to(sunGroup.rotation, {
      y: - ((moonAge + 0.5) * Math.PI * 2) % (Math.PI * 2),
      duration: this.app.config.camera.animationDuration,
      ease: "rough",
    });
    this.cache.manualMoonPhaseChange = true;
    this.visuals.gui!.controllers[GUIFieldNames.moonPhase]!.setValue(moonAge * 100);
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

