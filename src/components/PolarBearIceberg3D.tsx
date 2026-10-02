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

    // 5. Articulated High-Fidelity 3D Polar Bear
    const bearGroup = new THREE.Group();
    bearGroup.position.set(0, 1.6, 0); // Position atop the iceberg plateau
    icebergGroup.add(bearGroup);

    // Bear Materials (Soft polar fur with sheen and rim light response)
    const bearFurMat = new THREE.MeshStandardMaterial({
      color: 0xf5f8fc,
      roughness: 0.82,
      metalness: 0.04,
      bumpScale: 0.03,
    });

    const bearDarkMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      roughness: 0.35,
      metalness: 0.1,
    });

    // Main Torso
    const torsoGeo = new THREE.CapsuleGeometry(0.55, 1.45, 12, 16);
    torsoGeo.rotateZ(Math.PI / 2);
    const torsoMesh = new THREE.Mesh(torsoGeo, bearFurMat);
    torsoMesh.position.set(0, 0.8, 0);
    torsoMesh.castShadow = true;
    bearGroup.add(torsoMesh);

    // Shoulder & Hip Musculature
    const shoulderGeo = new THREE.SphereGeometry(0.52, 12, 12);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, bearFurMat);
    shoulderMesh.position.set(0.65, 0.85, 0);
    bearGroup.add(shoulderMesh);

    const hipGeo = new THREE.SphereGeometry(0.54, 12, 12);
    const hipMesh = new THREE.Mesh(hipGeo, bearFurMat);
    hipMesh.position.set(-0.65, 0.82, 0);
    bearGroup.add(hipMesh);

    // Neck & Head Pivot Group
    const headPivot = new THREE.Group();
    headPivot.position.set(1.05, 0.95, 0);
    bearGroup.add(headPivot);

    const neckGeo = new THREE.CylinderGeometry(0.32, 0.44, 0.55, 12);
    neckGeo.rotateZ(-Math.PI / 4);
    const neckMesh = new THREE.Mesh(neckGeo, bearFurMat);
    neckMesh.position.set(0.12, 0.05, 0);
    headPivot.add(neckMesh);

    // Head Skull
    const headGeo = new THREE.SphereGeometry(0.34, 12, 12);
    const headMesh = new THREE.Mesh(headGeo, bearFurMat);
    headMesh.position.set(0.38, 0.22, 0);
    headMesh.scale.set(1.15, 0.9, 0.85);
    headMesh.castShadow = true;
    headPivot.add(headMesh);

    // Snout / Muzzle
    const snoutGeo = new THREE.ConeGeometry(0.18, 0.38, 10);
    snoutGeo.rotateZ(-Math.PI / 2);
    const snoutMesh = new THREE.Mesh(snoutGeo, bearFurMat);
    snoutMesh.position.set(0.64, 0.18, 0);
    headPivot.add(snoutMesh);

    // Black Nose Pad
    const noseGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const noseMesh = new THREE.Mesh(noseGeo, bearDarkMat);
    noseMesh.position.set(0.82, 0.18, 0);
    headPivot.add(noseMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.038, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, bearDarkMat);
    leftEye.position.set(0.5, 0.28, 0.18);
    headPivot.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, bearDarkMat);
    rightEye.position.set(0.5, 0.28, -0.18);
    headPivot.add(rightEye);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.09, 8, 8);
    earGeo.scale(0.8, 1.2, 0.5);
    const leftEar = new THREE.Mesh(earGeo, bearFurMat);
    leftEar.position.set(0.32, 0.48, 0.24);
    headPivot.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, bearFurMat);
    rightEar.position.set(0.32, 0.48, -0.24);
    headPivot.add(rightEar);

    // Legs & Paws (Front Left, Front Right, Back Left, Back Right)
    const createLeg = (isFront: boolean, isLeft: boolean) => {
      const legGroup = new THREE.Group();

      const upperGeo = new THREE.CylinderGeometry(0.19, 0.16, 0.55, 10);
      const upper = new THREE.Mesh(upperGeo, bearFurMat);
      upper.position.y = -0.25;
      upper.castShadow = true;
      legGroup.add(upper);

      const lowerGeo = new THREE.CylinderGeometry(0.16, 0.15, 0.45, 10);
      const lower = new THREE.Mesh(lowerGeo, bearFurMat);
      lower.position.y = -0.65;
      lower.castShadow = true;
      legGroup.add(lower);

      // Wide snowshoe-like Polar Bear Paw
      const pawGeo = new THREE.BoxGeometry(0.28, 0.12, 0.22);
      const paw = new THREE.Mesh(pawGeo, bearFurMat);
      paw.position.set(0.06, -0.88, 0);
      paw.castShadow = true;
      legGroup.add(paw);

      const zOffset = isLeft ? 0.32 : -0.32;
      const xOffset = isFront ? 0.65 : -0.65;
      legGroup.position.set(xOffset, 0.85, zOffset);

      return { group: legGroup, upper, lower, paw };
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

        // Quadruped Leg Swing (Natural alternating gait)
        const swingL = Math.sin(walkCycle) * 0.38;
        const swingR = Math.sin(walkCycle + Math.PI) * 0.38;

        legFL.group.rotation.z = swingL;
        legBR.group.rotation.z = swingL * 0.85;

        legFR.group.rotation.z = swingR;
        legBL.group.rotation.z = swingR * 0.85;

        // Spine and Torso Natural Bobbing
        torsoMesh.position.y = 0.8 + Math.abs(Math.sin(walkCycle * 2)) * 0.04;
        torsoMesh.rotation.x = Math.sin(walkCycle) * 0.03;
      } else {
        // Idle breathing when paused
        legFL.group.rotation.z = 0;
        legFR.group.rotation.z = 0;
        legBL.group.rotation.z = 0;
        legBR.group.rotation.z = 0;
        torsoMesh.position.y = 0.8 + Math.sin(elapsed * 1.5) * 0.02;
      }

      // Breathing Chest Expansion
      const breath = 1 + Math.sin(elapsed * 1.8) * 0.035;
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
