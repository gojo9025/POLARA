'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, Sun, Moon, CloudSnow, Wind, Maximize2, Minimize2 } from 'lucide-react';
import './PolarBearIceberg3D.css';

interface PolarBearSceneProps {
  interactive?: boolean;
  className?: string;
  onTelemetryClick?: () => void;
}

export default function PolarBearIceberg3D({
  interactive = true,
  className = '',
  onTelemetryClick
}: PolarBearSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // HUD Interactive States
  const [atmosphere, setAtmosphere] = useState<'aurora' | 'day' | 'twilight'>('aurora');
  const [weather, setWeather] = useState<'flurry' | 'blizzard' | 'calm'>('flurry');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWalking, setIsWalking] = useState(true);
  const [bearingHeading, setBearingHeading] = useState(78);

  const sceneStateRef = useRef({
    atmosphere: 'aurora',
    weather: 'flurry',
    isWalking: true,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    orbitAngles: { theta: 0.25, phi: 0.35, distance: 11 },
  });

  // Keep ref synchronized with state
  useEffect(() => {
    sceneStateRef.current.atmosphere = atmosphere;
  }, [atmosphere]);

  useEffect(() => {
    sceneStateRef.current.weather = weather;
  }, [weather]);

  useEffect(() => {
    sceneStateRef.current.isWalking = isWalking;
  }, [isWalking]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060f1e, 0.045);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 11);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x406085, 1.2);
    scene.add(ambientLight);

    // Directional Sunlight / Moonlight
    const mainSun = new THREE.DirectionalLight(0xdff0ff, 2.4);
    mainSun.position.set(8, 12, 6);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 1024;
    mainSun.shadow.mapSize.height = 1024;
    mainSun.shadow.camera.near = 0.5;
    mainSun.shadow.camera.far = 30;
    mainSun.shadow.camera.left = -8;
    mainSun.shadow.camera.right = 8;
    mainSun.shadow.camera.top = 8;
    mainSun.shadow.camera.bottom = -8;
    mainSun.shadow.bias = -0.0005;
    scene.add(mainSun);

    // Aurora Borealis Colored Glow Lights
    const auroraGreen = new THREE.PointLight(0x4ade80, 2.5, 20);
    auroraGreen.position.set(-5, 7, -3);
    scene.add(auroraGreen);

    const auroraCyan = new THREE.PointLight(0x38b6e6, 2.8, 24);
    auroraCyan.position.set(4, 8, -4);
    scene.add(auroraCyan);

    const auroraViolet = new THREE.PointLight(0xc084fc, 1.8, 18);
    auroraViolet.position.set(0, 6, -6);
    scene.add(auroraViolet);

    // Under-ice Subsurface Light (gives glacial glow)
    const oceanSubsurface = new THREE.PointLight(0x18a0cb, 3.5, 15);
    oceanSubsurface.position.set(0, -1.5, 0);
    scene.add(oceanSubsurface);

    // 3. Sculpted 3D Iceberg
    const icebergGroup = new THREE.Group();
    scene.add(icebergGroup);

    // Main Iceberg Body (Faceted, crystalline)
    const icebergGeo = new THREE.CylinderGeometry(3.6, 4.4, 2.8, 16, 5);
    // Deform vertices for natural glacial jaggedness
    const posAttr = icebergGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      // Add controlled glacial noise
      const noise = Math.sin(x * 2.1) * 0.25 + Math.cos(z * 1.8) * 0.3 + Math.sin(y * 3.5) * 0.15;
      // Flatten the top walking shelf for the bear
      if (y > 1.0) {
        posAttr.setXYZ(i, x * (1 + noise * 0.3), y + noise * 0.1, z * (1 + noise * 0.3));
      } else {
        posAttr.setXYZ(i, x + noise * 0.45, y, z + noise * 0.45);
      }
    }
    icebergGeo.computeVertexNormals();

    const icebergMat = new THREE.MeshPhysicalMaterial({
      color: 0xebf7fc,
      roughness: 0.28,
      metalness: 0.05,
      transmission: 0.22, // Subsurface light refraction
      ior: 1.31, // Ice refractive index
      thickness: 1.8,
      specularIntensity: 0.9,
      clearcoat: 0.4,
      clearcoatRoughness: 0.15,
      flatShading: true,
    });

    const icebergMesh = new THREE.Mesh(icebergGeo, icebergMat);
    icebergMesh.position.y = 0.2;
    icebergMesh.receiveShadow = true;
    icebergMesh.castShadow = true;
    icebergGroup.add(icebergMesh);

    // Underwater deep-ice glacial mass
    const underIceGeo = new THREE.ConeGeometry(4.2, 3.8, 12);
    const underIceMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c4b6e,
      roughness: 0.3,
      transmission: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    const underIceMesh = new THREE.Mesh(underIceGeo, underIceMat);
    underIceMesh.position.y = -2.1;
    underIceMesh.rotation.x = Math.PI;
    icebergGroup.add(underIceMesh);

    // Surrounding Pack Ice Floes (Small floating chunks)
    const floeMat = new THREE.MeshStandardMaterial({
      color: 0xdaf2fc,
      roughness: 0.4,
      metalness: 0.02,
    });

    const floes: THREE.Mesh[] = [];
    for (let f = 0; f < 8; f++) {
      const angle = (f / 8) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 5.2 + Math.random() * 3.5;
      const size = 0.6 + Math.random() * 0.9;
      const floeGeo = new THREE.CylinderGeometry(size, size * 1.2, 0.25, 7);
      const floeMesh = new THREE.Mesh(floeGeo, floeMat);
      floeMesh.position.set(Math.cos(angle) * dist, -0.05, Math.sin(angle) * dist);
      floeMesh.rotation.y = Math.random() * Math.PI;
      scene.add(floeMesh);
      floes.push(floeMesh);
    }

    // 4. Arctic Undulating Ocean Plane
    const oceanGeo = new THREE.PlaneGeometry(36, 36, 64, 64);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanPos = oceanGeo.attributes.position;
    const oceanInitialY = new Float32Array(oceanPos.count);
    for (let i = 0; i < oceanPos.count; i++) {
      oceanInitialY[i] = oceanPos.getY(i);
    }

    const oceanMat = new THREE.MeshPhysicalMaterial({
      color: 0x041a2e,
      roughness: 0.08,
      metalness: 0.15,
      transmission: 0.5,
      ior: 1.333,
      reflectivity: 0.9,
      clearcoat: 0.85,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.92,
    });

    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.y = 0;
    scene.add(oceanMesh);

    // 5. Articulated Anatomically Accurate 3D Polar Bear (Ursus maritimus)
    const bearGroup = new THREE.Group();
    bearGroup.position.set(0, 1.6, 0); // Position atop the iceberg plateau
    icebergGroup.add(bearGroup);

    // Premium Multi-Layered Polar Bear Fur & Anatomical Materials
    const bearFurMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5f3ea, // Realistic natural creamy-white polar coat
      roughness: 0.74,
      metalness: 0.03,
      sheen: 0.9,
      sheenColor: new THREE.Color(0xffffff),
      sheenRoughness: 0.45,
      clearcoat: 0.05,
      clearcoatRoughness: 0.4,
      flatShading: false,
    });

    const bearFurDenseMat = new THREE.MeshPhysicalMaterial({
      color: 0xeae6da, // Slightly warmer undertone for shoulders and withers
      roughness: 0.78,
      metalness: 0.02,
      sheen: 0.75,
      sheenColor: new THREE.Color(0xfcfbf7),
    });

    const bearMuzzleMat = new THREE.MeshPhysicalMaterial({
      color: 0xfaf9f5, // Clean frosty muzzle fur
      roughness: 0.65,
      metalness: 0.02,
      sheen: 0.8,
      sheenColor: new THREE.Color(0xffffff),
    });

    const bearDarkMat = new THREE.MeshStandardMaterial({
      color: 0x111215, // Leathery charcoal-black for rhinarium (nose) and lips
      roughness: 0.35,
      metalness: 0.15,
    });

    const bearClawMat = new THREE.MeshStandardMaterial({
      color: 0x18181c, // Keratin dark claws
      roughness: 0.28,
      metalness: 0.2,
    });

    const bearEyeMat = new THREE.MeshPhysicalMaterial({
      color: 0x06070a, // Dark expressive polar bear eye
      roughness: 0.03,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });

    // Main Torso Root Group (attached to bearGroup and referenced for breathing/bobbing)
    const torsoMesh = new THREE.Group();
    torsoMesh.position.set(0, 0.82, 0);
    bearGroup.add(torsoMesh);

    // Deep Thoracic Ribcage (polar bears have a deep, hydrodynamic chest for diving and swimming)
    const ribcageGeo = new THREE.CylinderGeometry(0.46, 0.52, 0.92, 18, 6);
    ribcageGeo.rotateZ(Math.PI / 2);
    const ribcage = new THREE.Mesh(ribcageGeo, bearFurMat);
    ribcage.position.set(0.12, 0.02, 0);
    ribcage.scale.set(1.0, 1.14, 0.90);
    ribcage.castShadow = true;
    ribcage.receiveShadow = true;
    torsoMesh.add(ribcage);

    // Pronounced Shoulder Hump (Withers) - Signature of Ursus (polar & grizzly bears)
    const withersGeo = new THREE.SphereGeometry(0.42, 16, 14);
    const withers = new THREE.Mesh(withersGeo, bearFurDenseMat);
    withers.position.set(0.42, 0.32, 0);
    withers.scale.set(1.15, 0.92, 0.82);
    withers.castShadow = true;
    torsoMesh.add(withers);

    // Pectoral Muscle Girdle (under chest between front legs)
    const pectoralGeo = new THREE.BoxGeometry(0.65, 0.30, 0.60);
    const pectoral = new THREE.Mesh(pectoralGeo, bearFurMat);
    pectoral.position.set(0.36, -0.16, 0);
    pectoral.castShadow = true;
    torsoMesh.add(pectoral);

    // Lumbar & Flank (tapers upward into the loin, preventing the flat cow belly)
    const flankGeo = new THREE.CylinderGeometry(0.42, 0.47, 0.62, 16, 4);
    flankGeo.rotateZ(Math.PI / 2);
    const flank = new THREE.Mesh(flankGeo, bearFurMat);
    flank.position.set(-0.46, 0.04, 0);
    flank.scale.set(1.0, 1.05, 0.86);
    flank.castShadow = true;
    torsoMesh.add(flank);

    // Pelvic Haunches / Broad Muscular Rump
    const rumpGeo = new THREE.SphereGeometry(0.48, 16, 14);
    const rump = new THREE.Mesh(rumpGeo, bearFurDenseMat);
    rump.position.set(-0.74, 0.06, 0);
    rump.scale.set(1.08, 1.05, 0.88);
    rump.castShadow = true;
    torsoMesh.add(rump);

    // Stubby Furry Tail (tucked tight against the rump, angled downwards)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(-1.16, 0.12, 0);
    tailGroup.rotation.z = -Math.PI / 3.8;
    const tailGeo = new THREE.ConeGeometry(0.08, 0.20, 10);
    const tailMesh = new THREE.Mesh(tailGeo, bearFurMat);
    tailMesh.position.y = -0.08;
    tailMesh.castShadow = true;
    tailGroup.add(tailMesh);
    torsoMesh.add(tailGroup);

    // Neck & Head Pivot Group (Organically anchored to the shoulder hump)
    const headPivot = new THREE.Group();
    headPivot.position.set(0.80, 1.02, 0);
    bearGroup.add(headPivot);

    // Elongated muscular swimming neck (distinctive to Polar Bears)
    const neckGeo = new THREE.CylinderGeometry(0.30, 0.42, 0.65, 16);
    neckGeo.rotateZ(-Math.PI / 4.2);
    const neckMesh = new THREE.Mesh(neckGeo, bearFurDenseMat);
    neckMesh.position.set(0.18, -0.04, 0);
    neckMesh.scale.set(1.0, 1.15, 0.88);
    neckMesh.castShadow = true;
    headPivot.add(neckMesh);

    // Throat Dewlap / Thick fur along lower neck
    const throatGeo = new THREE.CylinderGeometry(0.22, 0.34, 0.54, 12);
    throatGeo.rotateZ(-Math.PI / 4.4);
    const throatMesh = new THREE.Mesh(throatGeo, bearFurMat);
    throatMesh.position.set(0.18, -0.16, 0);
    throatMesh.scale.set(1.0, 0.8, 0.75);
    headPivot.add(throatMesh);

    // Elongated Roman-Profile Skull (Flat top, sloping brow, wide jaw muscles)
    const skullGroup = new THREE.Group();
    skullGroup.position.set(0.48, 0.16, 0);
    headPivot.add(skullGroup);

    // Cranium
    const craniumGeo = new THREE.SphereGeometry(0.29, 16, 14);
    const cranium = new THREE.Mesh(craniumGeo, bearFurMat);
    cranium.scale.set(1.22, 0.85, 0.86); // Flattened, elongated skull
    cranium.castShadow = true;
    skullGroup.add(cranium);

    // Broad Zygomatic Cheeks (jaw muscle mass)
    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), bearFurMat);
    cheekL.position.set(-0.02, -0.06, 0.17);
    cheekL.scale.set(1.1, 0.8, 0.7);
    skullGroup.add(cheekL);

    const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), bearFurMat);
    cheekR.position.set(-0.02, -0.06, -0.17);
    cheekR.scale.set(1.1, 0.8, 0.7);
    skullGroup.add(cheekR);

    // Substantial Polar Bear Muzzle (Boxy, wedge-shaped predator snout - NOT a cone!)
    const muzzleGeo = new THREE.BoxGeometry(0.40, 0.21, 0.25);
    const muzzle = new THREE.Mesh(muzzleGeo, bearMuzzleMat);
    muzzle.position.set(0.30, -0.04, 0);
    muzzle.castShadow = true;
    skullGroup.add(muzzle);

    // Upper Nasal Bridge (Smooth slope from forehead to nose tip)
    const bridgeGeo = new THREE.CylinderGeometry(0.12, 0.19, 0.36, 12);
    bridgeGeo.rotateZ(-Math.PI / 2);
    const bridge = new THREE.Mesh(bridgeGeo, bearMuzzleMat);
    bridge.position.set(0.22, 0.05, 0);
    bridge.scale.set(1.0, 0.8, 0.95);
    skullGroup.add(bridge);

    // Lower Mandible / Chin with dark lip line
    const chinGeo = new THREE.BoxGeometry(0.32, 0.085, 0.21);
    const chin = new THREE.Mesh(chinGeo, bearMuzzleMat);
    chin.position.set(0.26, -0.145, 0);
    skullGroup.add(chin);

    // Dark Lip Seam (Subtle line between upper muzzle and jaw)
    const lipGeo = new THREE.BoxGeometry(0.34, 0.02, 0.23);
    const lip = new THREE.Mesh(lipGeo, bearDarkMat);
    lip.position.set(0.29, -0.10, 0);
    skullGroup.add(lip);

    // Broad Leathery Polar Bear Nose (Rhinarium)
    const rhinariumGroup = new THREE.Group();
    rhinariumGroup.position.set(0.50, -0.01, 0);
    skullGroup.add(rhinariumGroup);

    const nosePadGeo = new THREE.BoxGeometry(0.08, 0.11, 0.17);
    const nosePad = new THREE.Mesh(nosePadGeo, bearDarkMat);
    nosePad.rotation.z = -0.15;
    rhinariumGroup.add(nosePad);

    // Nostril recesses (left & right)
    const nostrilGeo = new THREE.SphereGeometry(0.022, 8, 8);
    nostrilGeo.scale(0.8, 1.2, 0.7);
    const nostrilL = new THREE.Mesh(nostrilGeo, new THREE.MeshBasicMaterial({ color: 0x050507 }));
    nostrilL.position.set(0.042, -0.01, 0.048);
    rhinariumGroup.add(nostrilL);

    const nostrilR = new THREE.Mesh(nostrilGeo, new THREE.MeshBasicMaterial({ color: 0x050507 }));
    nostrilR.position.set(0.042, -0.01, -0.048);
    rhinariumGroup.add(nostrilR);

    // Eyes: Deep-set, dark almond eyes with dark orbital rim fur
    const createEye = (isLeft: boolean) => {
      const eyeZ = isLeft ? 0.16 : -0.16;
      // Dark orbital fur ring
      const orbitGeo = new THREE.RingGeometry(0.022, 0.052, 12);
      orbitGeo.rotateY(isLeft ? Math.PI / 2 : -Math.PI / 2);
      const orbit = new THREE.Mesh(orbitGeo, bearDarkMat);
      orbit.position.set(0.14, 0.08, eyeZ);
      skullGroup.add(orbit);

      // Eye eyeball
      const eyeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), bearEyeMat);
      eyeSphere.position.set(0.145, 0.08, eyeZ);
      skullGroup.add(eyeSphere);

      // Subtle brow ridge above eye
      const browGeo = new THREE.BoxGeometry(0.11, 0.035, 0.055);
      const brow = new THREE.Mesh(browGeo, bearFurDenseMat);
      brow.position.set(0.12, 0.12, eyeZ);
      brow.rotation.z = 0.15;
      skullGroup.add(brow);
    };
    createEye(true);
    createEye(false);

    // Ears: Small, rounded, thick-furred cups (arctic cold adaptation)
    const createEar = (isLeft: boolean) => {
      const earGroup = new THREE.Group();
      const earZ = isLeft ? 0.21 : -0.21;
      earGroup.position.set(-0.06, 0.23, earZ);
      earGroup.rotation.y = isLeft ? 0.35 : -0.35;
      earGroup.rotation.x = isLeft ? 0.2 : -0.2;

      // Outer fur cup
      const outerEarGeo = new THREE.SphereGeometry(0.08, 10, 10);
      outerEarGeo.scale(0.6, 1.1, 0.7);
      const outerEar = new THREE.Mesh(outerEarGeo, bearFurDenseMat);
      outerEar.castShadow = true;
      earGroup.add(outerEar);

      // Inner ear recess
      const innerEarGeo = new THREE.SphereGeometry(0.05, 8, 8);
      innerEarGeo.scale(0.4, 0.9, 0.5);
      const innerEar = new THREE.Mesh(innerEarGeo, new THREE.MeshStandardMaterial({ color: 0x4a433e, roughness: 0.9 }));
      innerEar.position.set(0.02, 0, 0);
      earGroup.add(innerEar);

      skullGroup.add(earGroup);
    };
    createEar(true);
    createEar(false);

    // Legs & Paws (Front Left, Front Right, Back Left, Back Right)
    const createLeg = (isFront: boolean, isLeft: boolean) => {
      const legGroup = new THREE.Group();
      const zOffset = isLeft ? 0.35 : -0.35;
      const xOffset = isFront ? 0.56 : -0.64;
      legGroup.position.set(xOffset, 0.82, zOffset);

      if (isFront) {
        // FRONT FORELEG: Heavy shoulder deltoid, straight muscular column, huge snowshoe paw
        const deltoidGeo = new THREE.SphereGeometry(0.24, 12, 10);
        deltoidGeo.scale(1.0, 1.25, 0.85);
        const deltoid = new THREE.Mesh(deltoidGeo, bearFurDenseMat);
        deltoid.position.set(0, -0.12, 0);
        deltoid.castShadow = true;
        legGroup.add(deltoid);

        const forearmGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.52, 12);
        const forearm = new THREE.Mesh(forearmGeo, bearFurMat);
        forearm.position.y = -0.44;
        forearm.castShadow = true;
        legGroup.add(forearm);

        // Huge broad snowshoe front paw (up to 30 cm in wild polar bears)
        const pawGroup = new THREE.Group();
        pawGroup.position.set(0.08, -0.74, 0);
        legGroup.add(pawGroup);

        // Main Paw Pad (flattened, rounded)
        const pawPadGeo = new THREE.CylinderGeometry(0.21, 0.23, 0.11, 14);
        pawPadGeo.scale(1.25, 1.0, 0.95);
        const pawPad = new THREE.Mesh(pawPadGeo, bearFurMat);
        pawPad.castShadow = true;
        pawGroup.add(pawPad);

        // Dark sole / plantar pad underneath
        const soleGeo = new THREE.CylinderGeometry(0.17, 0.18, 0.02, 12);
        soleGeo.scale(1.2, 1.0, 0.9);
        const sole = new THREE.Mesh(soleGeo, bearDarkMat);
        sole.position.y = -0.055;
        pawGroup.add(sole);

        // 5 Front Toes with Curved Dark Keratin Claws
        for (let t = 0; t < 5; t++) {
          const toeAngle = ((t - 2) / 2) * 0.42;
          const toeDist = 0.23;
          const tx = Math.cos(toeAngle) * toeDist;
          const tz = Math.sin(toeAngle) * toeDist * 0.9;

          const toeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), bearFurMat);
          toeSphere.position.set(tx, -0.01, tz);
          toeSphere.scale.set(1.1, 0.9, 0.9);
          pawGroup.add(toeSphere);

          const clawGeo = new THREE.ConeGeometry(0.021, 0.08, 6);
          clawGeo.rotateZ(-Math.PI / 2.3);
          const claw = new THREE.Mesh(clawGeo, bearClawMat);
          claw.position.set(tx + 0.06, -0.03, tz);
          pawGroup.add(claw);
        }

        return { group: legGroup, upper: deltoid, lower: forearm, paw: pawGroup };
      } else {
        // HIND LEG: Broad muscular haunch/thigh, angled stifle (knee), backward hock joint
        const thighGeo = new THREE.SphereGeometry(0.27, 12, 10);
        thighGeo.scale(0.9, 1.35, 0.85);
        const thigh = new THREE.Mesh(thighGeo, bearFurDenseMat);
        thigh.position.set(0, -0.12, 0);
        thigh.castShadow = true;
        legGroup.add(thigh);

        // Calf / lower leg with natural stifle angle
        const calfGeo = new THREE.CylinderGeometry(0.17, 0.15, 0.48, 12);
        calfGeo.rotateZ(0.14);
        const calf = new THREE.Mesh(calfGeo, bearFurMat);
        calf.position.set(-0.03, -0.42, 0);
        calf.castShadow = true;
        legGroup.add(calf);

        // Prominent Hock Joint (Bear Heel)
        const hockGeo = new THREE.SphereGeometry(0.10, 8, 8);
        const hock = new THREE.Mesh(hockGeo, bearFurDenseMat);
        hock.position.set(-0.09, -0.55, 0);
        legGroup.add(hock);

        // Elongated Hind Snowshoe Paw
        const pawGroup = new THREE.Group();
        pawGroup.position.set(0.04, -0.74, 0);
        legGroup.add(pawGroup);

        const pawPadGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.10, 14);
        pawPadGeo.scale(1.35, 1.0, 0.88);
        const pawPad = new THREE.Mesh(pawPadGeo, bearFurMat);
        pawPad.castShadow = true;
        pawGroup.add(pawPad);

        const sole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.02, 12), bearDarkMat);
        sole.position.y = -0.052;
        pawGroup.add(sole);

        // 5 Hind Toes with Claws
        for (let t = 0; t < 5; t++) {
          const toeAngle = ((t - 2) / 2) * 0.38;
          const toeDist = 0.21;
          const tx = Math.cos(toeAngle) * toeDist;
          const tz = Math.sin(toeAngle) * toeDist * 0.85;

          const toeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), bearFurMat);
          toeSphere.position.set(tx, -0.01, tz);
          toeSphere.scale.set(1.1, 0.9, 0.9);
          pawGroup.add(toeSphere);

          const clawGeo = new THREE.ConeGeometry(0.019, 0.07, 6);
          clawGeo.rotateZ(-Math.PI / 2.3);
          const claw = new THREE.Mesh(clawGeo, bearClawMat);
          claw.position.set(tx + 0.05, -0.03, tz);
          pawGroup.add(claw);
        }

        return { group: legGroup, upper: thigh, lower: calf, paw: pawGroup };
      }
    };

    const legFL = createLeg(true, true);
    const legFR = createLeg(true, false);
    const legBL = createLeg(false, true);
    const legBR = createLeg(false, false);

    bearGroup.add(legFL.group);
    bearGroup.add(legFR.group);
    bearGroup.add(legBL.group);
    bearGroup.add(legBR.group);

    // 6. Aurora Borealis Sky Ribbons (Undulating Curtains in the Sky)
    const auroraGroup = new THREE.Group();
    scene.add(auroraGroup);

    const auroraCurveCount = 3;
    const auroraMeshes: THREE.Mesh[] = [];

    for (let a = 0; a < auroraCurveCount; a++) {
      const ribbonGeo = new THREE.PlaneGeometry(32, 7, 36, 10);
      const ribbonMat = new THREE.MeshBasicMaterial({
        color: a === 0 ? 0x4ade80 : a === 1 ? 0x2ec4b6 : 0xc084fc,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.position.set(0, 9 + a * 1.5, -8 - a * 4);
      ribbon.rotation.x = Math.PI / 12;
      auroraGroup.add(ribbon);
      auroraMeshes.push(ribbon);
    }

    // 7. Arctic Blizzard / Snow Particles
    const snowCount = 850;
    const snowGeo = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    const snowVelocities: { x: number; y: number; z: number }[] = [];

    for (let s = 0; s < snowCount; s++) {
      snowPositions[s * 3] = (Math.random() - 0.5) * 28;
      snowPositions[s * 3 + 1] = Math.random() * 14;
      snowPositions[s * 3 + 2] = (Math.random() - 0.5) * 28;

      snowVelocities.push({
        x: -0.04 - Math.random() * 0.05,
        y: -0.03 - Math.random() * 0.04,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const snowParticles = new THREE.Points(snowGeo, snowMat);
    scene.add(snowParticles);

    // 8. Event Listeners for Mouse Parallax & Orbit
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      sceneStateRef.current.mouse.targetX = x;
      sceneStateRef.current.mouse.targetY = y;

      if (sceneStateRef.current.isDragging) {
        const dx = e.clientX - sceneStateRef.current.prevMouse.x;
        const dy = e.clientY - sceneStateRef.current.prevMouse.y;
        sceneStateRef.current.orbitAngles.theta += dx * 0.005;
        sceneStateRef.current.orbitAngles.phi = Math.max(
          0.1,
          Math.min(1.2, sceneStateRef.current.orbitAngles.phi - dy * 0.005)
        );
        sceneStateRef.current.prevMouse.x = e.clientX;
        sceneStateRef.current.prevMouse.y = e.clientY;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      sceneStateRef.current.isDragging = true;
      sceneStateRef.current.prevMouse.x = e.clientX;
      sceneStateRef.current.prevMouse.y = e.clientY;
    };

    const handlePointerUp = () => {
      sceneStateRef.current.isDragging = false;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let walkCycle = 0;
    let bearTravelX = 0;
    let bearDirection = 1;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const elapsed = currentTime / 1000;

      // Smooth mouse lerping
      const state = sceneStateRef.current;
      state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
      state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

      // Atmosphere Lighting Interpolation
      if (state.atmosphere === 'day') {
        scene.fog?.color.setHex(0x102b4a);
        ambientLight.color.setHex(0x90bfe6);
        ambientLight.intensity = 1.8;
        mainSun.color.setHex(0xfff7e6);
        mainSun.intensity = 3.2;
        auroraGreen.intensity = 0.2;
        auroraCyan.intensity = 0.3;
        auroraViolet.intensity = 0.1;
      } else if (state.atmosphere === 'twilight') {
        scene.fog?.color.setHex(0x1c102a);
        ambientLight.color.setHex(0x8a6096);
        ambientLight.intensity = 1.3;
        mainSun.color.setHex(0xfb923c);
        mainSun.intensity = 2.0;
        auroraGreen.intensity = 1.2;
        auroraCyan.intensity = 1.4;
        auroraViolet.intensity = 2.0;
      } else {
        // Aurora Night
        scene.fog?.color.setHex(0x040a16);
        ambientLight.color.setHex(0x284366);
        ambientLight.intensity = 1.0;
        mainSun.color.setHex(0x7dd3fc);
        mainSun.intensity = 1.5;
        auroraGreen.intensity = 2.8 + Math.sin(elapsed * 1.5) * 0.8;
        auroraCyan.intensity = 3.0 + Math.cos(elapsed * 1.2) * 0.9;
        auroraViolet.intensity = 2.2 + Math.sin(elapsed * 0.9) * 0.6;
      }

      // Camera Position (Orbit & Parallax)
      const baseDistance = isFullscreen ? 9.5 : 11;
      const targetCamX =
        Math.sin(state.orbitAngles.theta) * Math.cos(state.orbitAngles.phi) * baseDistance +
        state.mouse.x * 0.8;
      const targetCamY =
        Math.sin(state.orbitAngles.phi) * baseDistance + 1.2 + state.mouse.y * 0.5;
      const targetCamZ =
        Math.cos(state.orbitAngles.theta) * Math.cos(state.orbitAngles.phi) * baseDistance;

      camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.05);
      camera.lookAt(0, 1.4, 0);

      // Iceberg Buoyancy Physics (gentle floating)
      icebergGroup.position.y = Math.sin(elapsed * 0.8) * 0.08;
      icebergGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.015;
      icebergGroup.rotation.x = Math.cos(elapsed * 0.6) * 0.012;

      // Pack Ice Floes rotational drift
      floes.forEach((floe, i) => {
        floe.position.y = -0.05 + Math.sin(elapsed * 0.9 + i) * 0.04;
        floe.rotation.y += 0.002 * (i % 2 === 0 ? 1 : -1);
      });

      // Ocean Waves Vertex Displacement
      const pos = oceanMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const w = pos.getZ(i);
        const wave =
          Math.sin(u * 0.6 + elapsed * 1.4) * 0.12 +
          Math.cos(w * 0.5 + elapsed * 1.1) * 0.09 +
          Math.sin((u + w) * 0.4 + elapsed * 0.8) * 0.06;
        pos.setY(i, oceanInitialY[i] + wave);
      }
      oceanMesh.geometry.attributes.position.needsUpdate = true;

      // Polar Bear Walking Kinematics & Movement
      if (state.isWalking) {
        walkCycle += delta * 3.8;

        // Polar Bear traversing back and forth on the iceberg plateau
        bearTravelX += delta * 0.35 * bearDirection;
        if (bearTravelX > 1.2) {
          bearDirection = -1;
        } else if (bearTravelX < -1.1) {
          bearDirection = 1;
        }

        bearGroup.position.x = bearTravelX;
        // Smoothly rotate bear toward walking direction
        const targetRotY = bearDirection > 0 ? 0 : Math.PI;
        bearGroup.rotation.y = THREE.MathUtils.lerp(bearGroup.rotation.y, targetRotY, 0.08);

        // Quadruped Leg Swing (Natural alternating predator gait)
        const swingL = Math.sin(walkCycle) * 0.35;
        const swingR = Math.sin(walkCycle + Math.PI) * 0.35;

        legFL.group.rotation.z = swingL;
        legFL.paw.rotation.z = -swingL * 0.35;
        legBR.group.rotation.z = swingL * 0.82;
        legBR.paw.rotation.z = -swingL * 0.28;

        legFR.group.rotation.z = swingR;
        legFR.paw.rotation.z = -swingR * 0.35;
        legBL.group.rotation.z = swingR * 0.82;
        legBL.paw.rotation.z = -swingR * 0.28;

        // Spine and Torso Natural Bobbing
        torsoMesh.position.y = 0.82 + Math.abs(Math.sin(walkCycle * 2)) * 0.035;
        torsoMesh.rotation.x = Math.sin(walkCycle) * 0.025;
        headPivot.rotation.z = Math.sin(walkCycle) * 0.035;
      } else {
        // Idle breathing when paused
        legFL.group.rotation.z = 0;
        legFL.paw.rotation.z = 0;
        legFR.group.rotation.z = 0;
        legFR.paw.rotation.z = 0;
        legBL.group.rotation.z = 0;
        legBL.paw.rotation.z = 0;
        legBR.group.rotation.z = 0;
        legBR.paw.rotation.z = 0;
        torsoMesh.position.y = 0.82 + Math.sin(elapsed * 1.5) * 0.018;
        headPivot.rotation.z = 0;
      }

      // Breathing Chest Expansion (Organic respiration)
      const breath = 1 + Math.sin(elapsed * 1.8) * 0.028;
      torsoMesh.scale.set(breath, breath, 1);

      // Bear Head Tracking Cursor Position organically
      const headTargetY = (state.mouse.x * 0.45 * bearDirection);
      const headTargetX = (-state.mouse.y * 0.35);
      headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, headTargetY, 0.08);
      headPivot.rotation.x = THREE.MathUtils.lerp(headPivot.rotation.x, headTargetX, 0.08);

      // Update Bearing Heading in state
      const currentHeading = Math.round(((bearGroup.rotation.y + Math.PI) / (Math.PI * 2)) * 360) % 360;
      setBearingHeading(currentHeading);

      // Aurora Borealis Curtains Undulation
      auroraMeshes.forEach((mesh, idx) => {
        mesh.rotation.z = Math.sin(elapsed * 0.3 + idx) * 0.04;
        mesh.position.y = 9 + idx * 1.5 + Math.sin(elapsed * 0.5 + idx * 1.5) * 0.4;
      });

      // Snow Particle Motion
      const snowPosAttr = snowParticles.geometry.attributes.position;
      const windSpeed = state.weather === 'blizzard' ? 2.5 : state.weather === 'calm' ? 0.3 : 1.0;

      for (let s = 0; s < snowCount; s++) {
        let sx = snowPosAttr.getX(s) + snowVelocities[s].x * windSpeed;
        let sy = snowPosAttr.getY(s) + snowVelocities[s].y * (windSpeed * 0.8);
        let sz = snowPosAttr.getZ(s) + snowVelocities[s].z;

        if (sy < 0.1 || sx < -14 || sz < -14 || sz > 14) {
          sx = 14 + Math.random() * 4;
          sy = 12 + Math.random() * 3;
          sz = (Math.random() - 0.5) * 24;
        }

        snowPosAttr.setXYZ(s, sx, sy, sz);
      }
      snowPosAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
    };
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`polar-bear-3d-wrapper ${isFullscreen ? 'fullscreen-mode' : ''} ${className}`}
    >
      <canvas ref={canvasRef} className="polar-bear-canvas" />

      {/* 21st.dev Style Floating Holographic HUD Overlay */}
      <div className="hud-overlay-capsule">
        {/* Left: Station & Bearing Compass */}
        <div className="hud-capsule-item">
          <span className="live-pulse-dot" />
          <div className="hud-metric-col">
            <span className="hud-label">ICE-FLOE GPS</span>
            <span className="hud-val">79°02′N, 11°34′E</span>
          </div>
        </div>

        <div className="hud-capsule-sep" />

        {/* Center: Interactive Mode Switchers */}
        <div className="hud-controls-group">
          {/* Atmosphere Button */}
          <div className="hud-btn-toggle">
            <button
              className={`hud-mode-pill ${atmosphere === 'aurora' ? 'active' : ''}`}
              onClick={() => setAtmosphere('aurora')}
              title="Aurora Borealis Night"
            >
              <Sparkles size={13} />
              <span>Aurora</span>
            </button>
            <button
              className={`hud-mode-pill ${atmosphere === 'twilight' ? 'active' : ''}`}
              onClick={() => setAtmosphere('twilight')}
              title="Arctic Twilight Sunset"
            >
              <Moon size={13} />
              <span>Twilight</span>
            </button>
            <button
              className={`hud-mode-pill ${atmosphere === 'day' ? 'active' : ''}`}
              onClick={() => setAtmosphere('day')}
              title="Midnight Sun Daylight"
            >
              <Sun size={13} />
              <span>Day</span>
            </button>
          </div>

          {/* Weather Toggle */}
          <div className="hud-btn-toggle">
            <button
              className={`hud-mode-pill ${weather === 'flurry' ? 'active' : ''}`}
              onClick={() => setWeather('flurry')}
              title="Flurry Snow"
            >
              <CloudSnow size={13} />
            </button>
            <button
              className={`hud-mode-pill ${weather === 'blizzard' ? 'active' : ''}`}
              onClick={() => setWeather('blizzard')}
              title="Blizzard Gale"
            >
              <Wind size={13} />
            </button>
          </div>

          {/* Bear Walk / Rest Toggle */}
          <button
            className={`hud-action-pill ${isWalking ? 'active' : ''}`}
            onClick={() => setIsWalking(!isWalking)}
            title={isWalking ? 'Pause Polar Bear Movement' : 'Resume Walking'}
          >
            <Eye size={13} />
            <span>{isWalking ? 'Prowling' : 'Resting'}</span>
          </button>
        </div>

        <div className="hud-capsule-sep" />

        {/* Right: Fullscreen Toggle & Bearing */}
        <div className="hud-capsule-item">
          <div className="hud-metric-col" style={{ textAlign: 'right' }}>
            <span className="hud-label">SVALBARD DRIFT</span>
            <span className="hud-val">{bearingHeading}° NNE</span>
          </div>
          <button
            className="hud-expand-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand 3D Scene'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Floating Interactive Callout Pill */}
      <div className="polar-bear-caption-pill">
        <span className="caption-dot" />
        <span>Drag to orbit • Move cursor to guide polar bear gaze</span>
      </div>
    </div>
  );
}
