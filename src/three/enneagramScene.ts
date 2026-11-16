import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ENNEAGRAM_PROFILES, getProfileByNumber } from '../data/enneagramData';
import {
  createBrushedMetalTexture,
  createContactShadowTexture,
  createEnneagramDialTexture,
} from './proceduralTextures';

export type CameraPreset = 'overview' | 'focus' | 'zenith';

interface TotemEntry {
  number: number;
  group: THREE.Group;
  crownGroup: THREE.Group;
  haloMesh: THREE.Mesh;
  baseAngle: number;
  worldPos: THREE.Vector3;
  proxyMesh: THREE.Mesh;
}

interface ArcEntry {
  from: number;
  to: number;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}

// Pre-allocated scratch math helpers (Zero GC in render loop)
const _camGoalPos = new THREE.Vector3();
const _camGoalTarget = new THREE.Vector3();
const _scratchVec = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();

const RING_RADIUS = 3.85;

function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function getEnneagramNodePosition(num: number, radius = RING_RADIUS): { x: number; z: number; angle: number } {
  const index = num === 9 ? 0 : num;
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / 9;
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    angle,
  };
}

export class EnneagramSceneController {
  private container: HTMLElement;
  private onSelectProfile: (num: number) => void;
  private onHoverProfile?: (num: number | null) => void;
  private onContextIssue?: (lost: boolean) => void;

  private isSoftwareGl: boolean;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private pmremEnv?: THREE.Texture;

  private totems: TotemEntry[] = [];
  private arcs: ArcEntry[] = [];
  private spireGroup!: THREE.Group;
  private motesMesh!: THREE.InstancedMesh;
  private moteOffsets: Array<{ r: number; y: number; speed: number; phase: number }> = [];

  private activeNumber = 1;
  private hoveredNumber: number | null = null;
  private cameraPreset: CameraPreset = 'overview';
  private isTransitioningCam = false;
  private reducedMotion = false;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private lastHoverCheck = 0;
  private pointerDownPos = new THREE.Vector2();

  private clock = new THREE.Clock();
  private frameId = 0;
  private disposed = false;

  private disposables: Array<{ dispose: () => void }> = [];

  constructor(options: {
    container: HTMLElement;
    initialNumber: number;
    onSelectProfile: (num: number) => void;
    onHoverProfile?: (num: number | null) => void;
    onContextIssue?: (lost: boolean) => void;
  }) {
    this.container = options.container;
    this.activeNumber = options.initialNumber;
    this.onSelectProfile = options.onSelectProfile;
    this.onHoverProfile = options.onHoverProfile;
    this.onContextIssue = options.onContextIssue;

    this.isSoftwareGl = detectSoftwareGl();
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  private init(): void {
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    this.container.appendChild(canvas);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111318);
    this.scene.fog = new THREE.FogExp2(0x111318, 0.026);

    // Studio IBL environment via RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.pmremEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.pmremEnv;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    this.camera.position.set(0, 5.4, 9.6);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI * 0.46;
    this.controls.minPolarAngle = 0.15;
    this.controls.minDistance = 4.2;
    this.controls.maxDistance = 16.5;
    this.controls.enablePan = false;
    this.controls.target.set(0, 0.6, 0);

    // Cancel automatic camera glide if user grabs the scene
    this.controls.addEventListener('start', () => {
      this.isTransitioningCam = false;
    });

    this.raycaster.layers.set(1);

    this.buildLighting();
    this.buildStageAndAstrolabe();
    this.buildTotems();
    this.buildConnectingArcs();
    this.buildDustMotes();

    this.updateArcHighlights();
    this.computeCameraGoal(this.cameraPreset, this.activeNumber);
    _camGoalPos.copy(_camGoalPos);
    this.camera.position.copy(_camGoalPos);
    this.controls.target.copy(_camGoalTarget);
    this.controls.update();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    window.addEventListener('resize', this.handleResize);
    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointermove', this.handlePointerMove);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('webglcontextlost', this.handleContextLost);
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored);

    this.clock.start();
    this.tick();
  }

  private buildLighting(): void {
    // Cool sky/ground hemisphere fill
    const hemi = new THREE.HemisphereLight(0xa3b9d9, 0x241e18, 0.72);
    this.scene.add(hemi);

    // Warm directional key light with tight shadow frustum
    const keyLight = new THREE.DirectionalLight(0xfff0d6, 2.3);
    keyLight.position.set(6.5, 10.5, 5.5);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 28;
    const d = 7.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Subtle cool rim light from behind to separate basalt silhouettes
    const rimLight = new THREE.DirectionalLight(0xb8cbe8, 0.95);
    rimLight.position.set(-7, 5.5, -7.5);
    this.scene.add(rimLight);

    // Studio softbox highlight on GPU devices
    if (!this.isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xffe8c2, 2.4, 6, 3);
      softbox.position.set(-4, 6.2, 4);
      softbox.lookAt(0, 0.4, 0);
      this.scene.add(softbox);
    }
  }

  private buildStageAndAstrolabe(): void {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const dialTex = createEnneagramDialTexture(maxAniso);
    const brushedTex = createBrushedMetalTexture(maxAniso);
    const shadowTex = createContactShadowTexture();
    this.disposables.push(dialTex, brushedTex, shadowTex);

    // Architectural gallery floor
    const floorGeo = new THREE.CircleGeometry(28, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x12141a,
      roughness: 0.92,
      metalness: 0.06,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.44;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.disposables.push(floorGeo, floorMat);

    // Soft radial contact shadow under the plinth
    const contactGeo = new THREE.PlaneGeometry(12.2, 12.2);
    const contactMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.58,
    });
    const contactMesh = new THREE.Mesh(contactGeo, contactMat);
    contactMesh.rotation.x = -Math.PI / 2;
    contactMesh.position.y = -0.42;
    this.scene.add(contactMesh);
    this.disposables.push(contactGeo, contactMat);

    // Central Composite Astrolabe Plinth (6 parts)
    const plinthGroup = new THREE.Group();

    const basaltMat = new THREE.MeshStandardMaterial({
      color: 0x1c1f26,
      roughness: 0.84,
      metalness: 0.08,
      bumpMap: brushedTex,
      bumpScale: 0.008,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc99c4a,
      roughness: 0.26,
      metalness: 0.9,
      roughnessMap: brushedTex,
    });
    const dialMat = new THREE.MeshStandardMaterial({
      map: dialTex,
      roughness: 0.62,
      metalness: 0.22,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.disposables.push(basaltMat, brassMat, dialMat);

    // Part 1: Lower stepped basalt foundation
    const baseStepGeo = new THREE.CylinderGeometry(5.15, 5.42, 0.24, 72);
    const baseStep = new THREE.Mesh(baseStepGeo, basaltMat);
    baseStep.position.y = -0.32;
    baseStep.receiveShadow = true;
    baseStep.castShadow = true;
    plinthGroup.add(baseStep);

    // Part 2: Main plinth body
    const bodyStepGeo = new THREE.CylinderGeometry(4.78, 4.92, 0.2, 72);
    const bodyStep = new THREE.Mesh(bodyStepGeo, basaltMat);
    bodyStep.position.y = -0.1;
    bodyStep.receiveShadow = true;
    plinthGroup.add(bodyStep);

    // Part 3: Brushed brass perimeter bezel torus
    const bezelGeo = new THREE.TorusGeometry(4.76, 0.045, 16, 96);
    const bezel = new THREE.Mesh(bezelGeo, brassMat);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.y = 0.0;
    plinthGroup.add(bezel);

    // Part 4: Engraved Enneagram slate dial plate
    const dialGeo = new THREE.CylinderGeometry(4.68, 4.68, 0.02, 72);
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.y = 0.005;
    dial.receiveShadow = true;
    plinthGroup.add(dial);

    // Part 5: Inner brass compass ring
    const innerRingGeo = new THREE.TorusGeometry(1.12, 0.028, 14, 64);
    const innerRing = new THREE.Mesh(innerRingGeo, brassMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.03;
    plinthGroup.add(innerRing);

    this.disposables.push(baseStepGeo, bodyStepGeo, bezelGeo, dialGeo, innerRingGeo);

    // Part 6: Central kinetic astrolabe spire (multi-part)
    this.spireGroup = new THREE.Group();
    this.spireGroup.position.y = 0.02;

    const spireBaseGeo = new THREE.CylinderGeometry(0.32, 0.48, 0.18, 24);
    const spireBase = new THREE.Mesh(spireBaseGeo, basaltMat);
    spireBase.position.y = 0.09;
    this.spireGroup.add(spireBase);

    const gimbalOuterGeo = new THREE.TorusGeometry(0.68, 0.022, 14, 64);
    const gimbalOuter = new THREE.Mesh(gimbalOuterGeo, brassMat);
    gimbalOuter.position.y = 0.92;
    this.spireGroup.add(gimbalOuter);

    const gimbalInnerGeo = new THREE.TorusGeometry(0.46, 0.018, 12, 48);
    const gimbalInner = new THREE.Mesh(gimbalInnerGeo, brassMat);
    gimbalInner.position.y = 0.92;
    gimbalInner.rotation.y = Math.PI / 3;
    this.spireGroup.add(gimbalInner);

    const coreCrystalGeo = new THREE.OctahedronGeometry(0.24, 0);
    const coreCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6c178,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      transmission: this.isSoftwareGl ? 0 : 0.72,
      transparent: this.isSoftwareGl,
      opacity: this.isSoftwareGl ? 0.65 : 1,
      ior: 1.65,
      thickness: 0.8,
      emissive: 0x3b280c,
      emissiveIntensity: 0.6,
    });
    const coreCrystal = new THREE.Mesh(coreCrystalGeo, coreCrystalMat);
    coreCrystal.position.y = 0.92;
    this.spireGroup.add(coreCrystal);

    this.disposables.push(spireBaseGeo, gimbalOuterGeo, gimbalInnerGeo, coreCrystalGeo, coreCrystalMat);

    plinthGroup.add(this.spireGroup);
    this.scene.add(plinthGroup);
  }

  private buildTotems(): void {
    const basaltMat = new THREE.MeshStandardMaterial({
      color: 0x20242c,
      roughness: 0.86,
      metalness: 0.08,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc99c4a,
      roughness: 0.25,
      metalness: 0.92,
    });
    const latheProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.26, 0.0),
      new THREE.Vector2(0.22, 0.08),
      new THREE.Vector2(0.14, 0.18),
      new THREE.Vector2(0.11, 0.56),
      new THREE.Vector2(0.18, 0.66),
      new THREE.Vector2(0.0, 0.68),
    ];
    const shaftGeo = new THREE.LatheGeometry(latheProfile, 24);
    const baseCollarGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.1, 24);
    const trimRingGeo = new THREE.TorusGeometry(0.21, 0.018, 12, 32);
    const haloGeo = new THREE.RingGeometry(0.42, 0.48, 36);
    const proxyGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.85, 12);
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });

    this.disposables.push(
      basaltMat,
      brassMat,
      shaftGeo,
      baseCollarGeo,
      trimRingGeo,
      haloGeo,
      proxyGeo,
      proxyMat
    );

    ENNEAGRAM_PROFILES.forEach((profile) => {
      const { x, z, angle } = getEnneagramNodePosition(profile.number);
      const group = new THREE.Group();
      group.position.set(x, 0.015, z);

      // Part 1: Grounded basalt collar (bottom-center pivot)
      const collar = new THREE.Mesh(baseCollarGeo, basaltMat);
      collar.position.y = 0.05;
      collar.castShadow = true;
      collar.receiveShadow = true;
      group.add(collar);

      // Part 2: Lathe-turned bronze column shaft
      const shaft = new THREE.Mesh(shaftGeo, brassMat);
      shaft.position.y = 0.1;
      shaft.castShadow = true;
      group.add(shaft);

      // Part 3: Mid-collar brass trim ring
      const trim = new THREE.Mesh(trimRingGeo, brassMat);
      trim.rotation.x = Math.PI / 2;
      trim.position.y = 0.74;
      group.add(trim);

      // Part 4: Ground selection halo ring on dial
      const haloMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(profile.accentHex),
        emissive: new THREE.Color(profile.accentHex),
        emissiveIntensity: 0.15,
        roughness: 0.4,
        metalness: 0.5,
        side: THREE.DoubleSide,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = -Math.PI / 2;
      haloMesh.position.y = 0.012;
      group.add(haloMesh);
      this.disposables.push(haloMat);

      // Part 5+: Unique composite sculptural crown per Enneatype
      const crownGroup = this.createUniqueCrown(profile.number, profile.accentHex, basaltMat, brassMat);
      crownGroup.position.y = 0.84;
      group.add(crownGroup);

      // Invisible raycast proxy on layer 1
      const proxyMesh = new THREE.Mesh(proxyGeo, proxyMat);
      proxyMesh.position.y = 0.92;
      proxyMesh.layers.set(1);
      proxyMesh.userData.enneatypeNumber = profile.number;
      group.add(proxyMesh);

      this.scene.add(group);
      this.totems.push({
        number: profile.number,
        group,
        crownGroup,
        haloMesh,
        baseAngle: angle,
        worldPos: new THREE.Vector3(x, 0.85, z),
        proxyMesh,
      });
    });
  }

  private createUniqueCrown(
    num: number,
    accentHex: string,
    basaltMat: THREE.Material,
    brassMat: THREE.Material
  ): THREE.Group {
    const crown = new THREE.Group();
    const accentMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accentHex),
      roughness: 0.22,
      metalness: 0.45,
      clearcoat: 0.7,
    });
    this.disposables.push(accentMat);

    switch (num) {
      case 1: {
        // Alabaster plumb bob + precision caliper frame
        const bobGeo = new THREE.OctahedronGeometry(0.22, 0);
        const bob = new THREE.Mesh(bobGeo, accentMat);
        bob.scale.set(0.85, 1.45, 0.85);
        bob.position.y = 0.36;
        bob.castShadow = true;
        crown.add(bob);

        const ringGeo = new THREE.TorusGeometry(0.32, 0.02, 12, 40);
        const ring = new THREE.Mesh(ringGeo, brassMat);
        ring.position.y = 0.36;
        crown.add(ring);
        this.disposables.push(bobGeo, ringGeo);
        break;
      }
      case 2: {
        // Two intertwined warm terracotta & bronze arcs
        const arcGeo = new THREE.TorusGeometry(0.22, 0.045, 14, 36, Math.PI * 1.35);
        const arcA = new THREE.Mesh(arcGeo, accentMat);
        arcA.position.set(-0.08, 0.34, 0);
        arcA.rotation.z = -0.35;
        arcA.castShadow = true;
        crown.add(arcA);

        const arcB = new THREE.Mesh(arcGeo, brassMat);
        arcB.position.set(0.08, 0.34, 0);
        arcB.rotation.z = Math.PI - 0.35;
        arcB.castShadow = true;
        crown.add(arcB);
        this.disposables.push(arcGeo);
        break;
      }
      case 3: {
        // Faceted obsidian & gold obelisk prism
        const baseConeGeo = new THREE.CylinderGeometry(0.14, 0.22, 0.32, 6);
        const baseCone = new THREE.Mesh(baseConeGeo, basaltMat);
        baseCone.position.y = 0.18;
        baseCone.castShadow = true;
        crown.add(baseCone);

        const tipConeGeo = new THREE.ConeGeometry(0.14, 0.42, 6);
        const tipCone = new THREE.Mesh(tipConeGeo, accentMat);
        tipCone.position.y = 0.55;
        tipCone.castShadow = true;
        crown.add(tipCone);
        this.disposables.push(baseConeGeo, tipConeGeo);
        break;
      }
      case 4: {
        // Smoked indigo vessel + delicate asymmetric crest
        const vesselProfile = [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0.16, 0.04),
          new THREE.Vector2(0.22, 0.2),
          new THREE.Vector2(0.1, 0.36),
          new THREE.Vector2(0.13, 0.44),
          new THREE.Vector2(0.0, 0.44),
        ];
        const vesselGeo = new THREE.LatheGeometry(vesselProfile, 24);
        const vessel = new THREE.Mesh(vesselGeo, accentMat);
        vessel.position.y = 0.06;
        vessel.castShadow = true;
        crown.add(vessel);

        const stemGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.46, 8);
        const stem = new THREE.Mesh(stemGeo, brassMat);
        stem.position.set(0.04, 0.48, 0);
        stem.rotation.z = -0.18;
        crown.add(stem);
        this.disposables.push(vesselGeo, stemGeo);
        break;
      }
      case 5: {
        // Armillary nested rings + central core
        const r1Geo = new THREE.TorusGeometry(0.28, 0.02, 12, 44);
        const r1 = new THREE.Mesh(r1Geo, brassMat);
        r1.position.y = 0.34;
        crown.add(r1);

        const r2 = new THREE.Mesh(r1Geo, accentMat);
        r2.position.y = 0.34;
        r2.rotation.y = Math.PI / 2;
        r2.rotation.x = 0.45;
        crown.add(r2);

        const coreGeo = new THREE.IcosahedronGeometry(0.1, 0);
        const core = new THREE.Mesh(coreGeo, accentMat);
        core.position.y = 0.34;
        crown.add(core);
        this.disposables.push(r1Geo, coreGeo);
        break;
      }
      case 6: {
        // Interlocking keystone arch pillars
        const archGeo = new THREE.TorusGeometry(0.24, 0.04, 12, 32, Math.PI);
        const arch1 = new THREE.Mesh(archGeo, accentMat);
        arch1.position.y = 0.18;
        arch1.castShadow = true;
        crown.add(arch1);

        const arch2 = new THREE.Mesh(archGeo, brassMat);
        arch2.position.y = 0.18;
        arch2.rotation.y = Math.PI / 2;
        arch2.castShadow = true;
        crown.add(arch2);

        const keystoneGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const keystone = new THREE.Mesh(keystoneGeo, basaltMat);
        keystone.position.y = 0.44;
        crown.add(keystone);
        this.disposables.push(archGeo, keystoneGeo);
        break;
      }
      case 7: {
        // Brass lattice & citrine dodecahedron crystal
        const gemGeo = new THREE.DodecahedronGeometry(0.22, 0);
        const gem = new THREE.Mesh(gemGeo, accentMat);
        gem.position.y = 0.35;
        gem.castShadow = true;
        crown.add(gem);

        const cageGeo = new THREE.IcosahedronGeometry(0.3, 0);
        const cageMat = new THREE.MeshStandardMaterial({
          color: 0xd4a853,
          wireframe: true,
          roughness: 0.3,
          metalness: 0.9,
        });
        const cage = new THREE.Mesh(cageGeo, cageMat);
        cage.position.y = 0.35;
        crown.add(cage);
        this.disposables.push(gemGeo, cageGeo, cageMat);
        break;
      }
      case 8: {
        // Twin split basalt monolith slabs + central hammered copper seam
        const slabGeo = new THREE.BoxGeometry(0.13, 0.56, 0.24);
        const leftSlab = new THREE.Mesh(slabGeo, basaltMat);
        leftSlab.position.set(-0.09, 0.32, 0);
        leftSlab.castShadow = true;
        crown.add(leftSlab);

        const rightSlab = new THREE.Mesh(slabGeo, basaltMat);
        rightSlab.position.set(0.09, 0.32, 0);
        rightSlab.castShadow = true;
        crown.add(rightSlab);

        const seamGeo = new THREE.BoxGeometry(0.06, 0.58, 0.2);
        const seam = new THREE.Mesh(seamGeo, accentMat);
        seam.position.set(0, 0.33, 0);
        crown.add(seam);
        this.disposables.push(slabGeo, seamGeo);
        break;
      }
      case 9:
      default: {
        // Stacked balanced river stones + bronze resonance ring
        const s1Geo = new THREE.SphereGeometry(0.2, 24, 16);
        const s1 = new THREE.Mesh(s1Geo, basaltMat);
        s1.scale.set(1.2, 0.45, 1.2);
        s1.position.y = 0.14;
        s1.castShadow = true;
        crown.add(s1);

        const s2 = new THREE.Mesh(s1Geo, accentMat);
        s2.scale.set(0.9, 0.4, 0.9);
        s2.position.y = 0.29;
        s2.castShadow = true;
        crown.add(s2);

        const s3 = new THREE.Mesh(s1Geo, brassMat);
        s3.scale.set(0.6, 0.35, 0.6);
        s3.position.y = 0.42;
        s3.castShadow = true;
        crown.add(s3);
        this.disposables.push(s1Geo);
        break;
      }
    }

    return crown;
  }

  private buildConnectingArcs(): void {
    const connections: Array<[number, number]> = [
      [9, 3],
      [3, 6],
      [6, 9],
      [1, 4],
      [4, 2],
      [2, 8],
      [8, 5],
      [5, 7],
      [7, 1],
    ];

    connections.forEach(([from, to]) => {
      const pA = getEnneagramNodePosition(from, RING_RADIUS);
      const pB = getEnneagramNodePosition(to, RING_RADIUS);
      const midX = (pA.x + pB.x) * 0.5;
      const midZ = (pA.z + pB.z) * 0.5;
      const dist = Math.hypot(pB.x - pA.x, pB.z - pA.z);
      const archHeight = 0.18 + dist * 0.08;

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(pA.x, 0.12, pA.z),
        new THREE.Vector3(midX, archHeight, midZ),
        new THREE.Vector3(pB.x, 0.12, pB.z)
      );

      const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.016, 8, false);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x6f685a,
        roughness: 0.45,
        metalness: 0.75,
        transparent: true,
        opacity: 0.32,
      });
      const mesh = new THREE.Mesh(tubeGeo, mat);
      this.scene.add(mesh);
      this.disposables.push(tubeGeo, mat);

      this.arcs.push({ from, to, mesh, material: mat });
    });
  }

  private buildDustMotes(): void {
    const count = 60;
    const moteGeo = new THREE.OctahedronGeometry(0.024, 0);
    const moteMat = new THREE.MeshStandardMaterial({
      color: 0xd4a853,
      roughness: 0.25,
      metalness: 0.85,
      emissive: 0x3b2a0a,
      emissiveIntensity: 0.4,
    });
    this.motesMesh = new THREE.InstancedMesh(moteGeo, moteMat, count);
    this.motesMesh.frustumCulled = false;

    for (let i = 0; i < count; i++) {
      const r = 1.4 + Math.random() * 4.8;
      const y = 0.25 + Math.random() * 2.8;
      const speed = (0.04 + Math.random() * 0.08) * (i % 2 === 0 ? 1 : -1);
      const phase = Math.random() * Math.PI * 2;
      this.moteOffsets.push({ r, y, speed, phase });

      _dummyObj.position.set(Math.cos(phase) * r, y, Math.sin(phase) * r);
      _dummyObj.scale.setScalar(0.6 + Math.random() * 0.8);
      _dummyObj.updateMatrix();
      this.motesMesh.setMatrixAt(i, _dummyObj.matrix);
    }
    this.motesMesh.instanceMatrix.needsUpdate = true;
    this.motesMesh.computeBoundingSphere();

    this.scene.add(this.motesMesh);
    this.disposables.push(moteGeo, moteMat);
  }

  public setActiveProfile(num: number): void {
    if (num === this.activeNumber) return;
    this.activeNumber = num;
    this.updateArcHighlights();
    if (this.cameraPreset === 'focus') {
      this.computeCameraGoal('focus', num);
      this.isTransitioningCam = true;
    }
  }

  public setCameraPreset(preset: CameraPreset): void {
    this.cameraPreset = preset;
    this.computeCameraGoal(preset, this.activeNumber);
    this.isTransitioningCam = true;
  }

  private computeCameraGoal(preset: CameraPreset, activeNum: number): void {
    if (preset === 'zenith') {
      _camGoalPos.set(0, 11.4, 0.01);
      _camGoalTarget.set(0, 0, 0);
    } else if (preset === 'focus') {
      const pos = getEnneagramNodePosition(activeNum, RING_RADIUS);
      const dirLen = Math.hypot(pos.x, pos.z) || 1;
      const nx = pos.x / dirLen;
      const nz = pos.z / dirLen;
      _camGoalPos.set(pos.x + nx * 3.1, 2.35, pos.z + nz * 3.1);
      _camGoalTarget.set(pos.x * 0.72, 0.82, pos.z * 0.72);
    } else {
      _camGoalPos.set(0, 5.4, 9.6);
      _camGoalTarget.set(0, 0.5, 0);
    }
  }

  private updateArcHighlights(): void {
    const profile = getProfileByNumber(this.activeNumber);
    const integTarget = profile.integration.targetNumber;
    const disintegTarget = profile.disintegration.targetNumber;

    this.arcs.forEach((arc) => {
      const isIntegration =
        (arc.from === this.activeNumber && arc.to === integTarget) ||
        (arc.to === this.activeNumber && arc.from === integTarget);
      const isDisintegration =
        (arc.from === this.activeNumber && arc.to === disintegTarget) ||
        (arc.to === this.activeNumber && arc.from === disintegTarget);

      if (isIntegration) {
        arc.material.color.setHex(0xe5b85c);
        arc.material.emissive.setHex(0x8c6318);
        arc.material.emissiveIntensity = 0.85;
        arc.material.opacity = 0.96;
      } else if (isDisintegration) {
        arc.material.color.setHex(0xc86454);
        arc.material.emissive.setHex(0x6b261c);
        arc.material.emissiveIntensity = 0.65;
        arc.material.opacity = 0.88;
      } else {
        arc.material.color.setHex(0x6f685a);
        arc.material.emissive.setHex(0x000000);
        arc.material.emissiveIntensity = 0;
        arc.material.opacity = 0.25;
      }
    });
  }

  private handleResize = (): void => {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private updatePointer(event: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private pickTotem(event: PointerEvent): number | null {
    this.updatePointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const proxies = this.totems.map((t) => t.proxyMesh);
    const hits = this.raycaster.intersectObjects(proxies, false);
    if (hits.length > 0) {
      return Number(hits[0].object.userData.enneatypeNumber ?? 0) || null;
    }
    return null;
  }

  private handlePointerDown = (event: PointerEvent): void => {
    this.pointerDownPos.set(event.clientX, event.clientY);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    const now = performance.now();
    if (now - this.lastHoverCheck < 50) return;
    this.lastHoverCheck = now;

    const hit = this.pickTotem(event);
    if (hit !== this.hoveredNumber) {
      this.hoveredNumber = hit;
      this.renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
      this.onHoverProfile?.(hit);
    }
  };

  private handlePointerUp = (event: PointerEvent): void => {
    const dist = Math.hypot(
      event.clientX - this.pointerDownPos.x,
      event.clientY - this.pointerDownPos.y
    );
    if (dist > 6) return; // Dragged camera, not a click

    const hit = this.pickTotem(event);
    if (hit) {
      this.onSelectProfile(hit);
    }
  };

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.onContextIssue?.(true);
  };

  private handleContextRestored = (): void => {
    this.onContextIssue?.(false);
    this.tick();
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.ALREADY_SIGNALED;
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = (): void => {
    if (this.disposed) return;

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // Smooth camera preset damping
    if (this.isTransitioningCam) {
      const k = 4.8;
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camGoalPos.x, k, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camGoalPos.y, k, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camGoalPos.z, k, dt);

      this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, _camGoalTarget.x, k, dt);
      this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, _camGoalTarget.y, k, dt);
      this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, _camGoalTarget.z, k, dt);

      if (
        this.camera.position.distanceTo(_camGoalPos) < 0.03 &&
        this.controls.target.distanceTo(_camGoalTarget) < 0.03
      ) {
        this.isTransitioningCam = false;
      }
    }

    // Animate central kinetic spire gently
    if (!this.reducedMotion) {
      this.spireGroup.children[1].rotation.y = elapsed * 0.22;
      this.spireGroup.children[1].rotation.x = Math.sin(elapsed * 0.35) * 0.25;
      this.spireGroup.children[2].rotation.y = -elapsed * 0.32;
      this.spireGroup.children[3].rotation.y = elapsed * 0.45;
    }

    // Animate 9 totems (damped elevation & rotation for active/hovered node)
    for (let i = 0; i < this.totems.length; i++) {
      const t = this.totems[i];
      const isActive = t.number === this.activeNumber;
      const isHovered = t.number === this.hoveredNumber;

      const targetY = isActive ? 0.22 : isHovered ? 0.1 : 0.015;
      const targetScale = isActive ? 1.14 : isHovered ? 1.06 : 1.0;

      t.group.position.y = THREE.MathUtils.damp(t.group.position.y, targetY, 6.5, dt);
      const s = THREE.MathUtils.damp(t.group.scale.x, targetScale, 6.5, dt);
      t.group.scale.setScalar(s);

      if (!this.reducedMotion) {
        t.crownGroup.rotation.y += dt * (isActive ? 0.65 : 0.18);
      }

      const haloMat = t.haloMesh.material as THREE.MeshStandardMaterial;
      const targetEmissive = isActive ? 1.15 : isHovered ? 0.55 : 0.15;
      haloMat.emissiveIntensity = THREE.MathUtils.damp(haloMat.emissiveIntensity, targetEmissive, 6.0, dt);
    }

    // Animate atmospheric dust motes
    if (!this.reducedMotion) {
      for (let i = 0; i < this.moteOffsets.length; i++) {
        const m = this.moteOffsets[i];
        const a = m.phase + elapsed * m.speed;
        _scratchVec.set(
          Math.cos(a) * m.r,
          m.y + Math.sin(elapsed * 0.7 + m.phase) * 0.12,
          Math.sin(a) * m.r
        );
        _dummyObj.position.copy(_scratchVec);
        _dummyObj.rotation.set(elapsed * 0.4, a, 0);
        _dummyObj.scale.setScalar(0.85);
        _dummyObj.updateMatrix();
        this.motesMesh.setMatrixAt(i, _dummyObj.matrix);
      }
      this.motesMesh.instanceMatrix.needsUpdate = true;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    const canvas = this.renderer.domElement;
    window.removeEventListener('resize', this.handleResize);
    canvas.removeEventListener('pointerdown', this.handlePointerDown);
    canvas.removeEventListener('pointermove', this.handlePointerMove);
    canvas.removeEventListener('pointerup', this.handlePointerUp);
    canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.controls.dispose();
    this.pmremEnv?.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();

    if (canvas.parentElement === this.container) {
      this.container.removeChild(canvas);
    }
  }
}
