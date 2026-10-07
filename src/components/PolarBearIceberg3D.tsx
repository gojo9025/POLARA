'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
  const [atmosphere, setAtmosphere] = useState<'aurora' | 'day' | 'twilight'>('day');
  const [weather, setWeather] = useState<'flurry' | 'blizzard' | 'calm'>('flurry');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWalking, setIsWalking] = useState(true);
  const [bearingHeading, setBearingHeading] = useState(78);

  const sceneStateRef = useRef({
    atmosphere: 'day',
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
    // Limit pixel ratio to 1.5 for better mobile/laptop performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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
    mainSun.shadow.mapSize.width = 512;
    mainSun.shadow.mapSize.height = 512;
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

    // 4. Arctic Undulating Ocean Plane (Lower resolution for performance)
    const oceanGeo = new THREE.PlaneGeometry(36, 36, 32, 32);
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

    // 5. Realistic 3D Polar Bear Model Loading
    const bearGroup = new THREE.Group();
    bearGroup.position.set(0, 1.6, 0); // Position atop the iceberg plateau
    icebergGroup.add(bearGroup);

    // Procedural Penguins
    function createPenguin() {
      const group = new THREE.Group();
      
      // Body (Black Capsule)
      const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.6, 4, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.6;
      group.add(body);

      // Belly (White Capsule)
      const bellyGeo = new THREE.CapsuleGeometry(0.26, 0.55, 4, 12);
      const bellyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 });
      const belly = new THREE.Mesh(bellyGeo, bellyMat);
      belly.position.set(0, 0.58, 0.1);
      group.add(belly);

      // Eyes (White spheres)
      const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const pupilGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.12, 1.05, 0.25);
      const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
      rightPupil.position.set(0.01, 0, 0.04);
      rightEye.add(rightPupil);
      group.add(rightEye);

      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.12, 1.05, 0.25);
      const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
      leftPupil.position.set(-0.01, 0, 0.04);
      leftEye.add(leftPupil);
      group.add(leftEye);

      // Beak (Orange Cone)
      const beakGeo = new THREE.ConeGeometry(0.08, 0.2, 8);
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xff8800 });
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 0.95, 0.35);
      group.add(beak);

      // Flippers (Black flattened capsules)
      const flipperGeo = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
      const rightFlipper = new THREE.Mesh(flipperGeo, bodyMat);
      rightFlipper.position.set(0.35, 0.6, 0);
      rightFlipper.rotation.z = -Math.PI / 8;
      group.add(rightFlipper);

      const leftFlipper = new THREE.Mesh(flipperGeo, bodyMat);
      leftFlipper.position.set(-0.35, 0.6, 0);
      leftFlipper.rotation.z = Math.PI / 8;
      group.add(leftFlipper);

      // Feet (Orange flattened cones)
      const footGeo = new THREE.ConeGeometry(0.15, 0.3, 3);
      const rightFoot = new THREE.Mesh(footGeo, beakMat);
      rightFoot.rotation.x = -Math.PI / 2;
      rightFoot.position.set(0.15, 0.05, 0.15);
      group.add(rightFoot);

      const leftFoot = new THREE.Mesh(footGeo, beakMat);
      leftFoot.rotation.x = -Math.PI / 2;
      leftFoot.position.set(-0.15, 0.05, 0.15);
      group.add(leftFoot);

      // Enable shadows (Disabled for penguins to optimize performance)
      group.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      // Scale down to match realistic size compared to bear
      group.scale.set(0.5, 0.5, 0.5);

      return group;
    }

    const penguins: THREE.Group[] = [];
    const penguinPositions = [
      { x: 1.5, z: 2.5, rotY: -Math.PI / 4 },
      { x: -2.0, z: 1.8, rotY: Math.PI / 3 },
      { x: 2.2, z: -1.5, rotY: -Math.PI * 0.8 },
      { x: -1.2, z: -2.2, rotY: Math.PI * 0.9 },
      { x: 2.5, z: 2.0, rotY: -Math.PI / 3 },
    ];

    penguinPositions.forEach(pos => {
      const penguin = createPenguin();
      penguin.position.set(pos.x, 1.4, pos.z);
      penguin.rotation.y = pos.rotY;
      icebergGroup.add(penguin);
      penguins.push(penguin);
    });

    let mixer: THREE.AnimationMixer | null = null;
    let bearModel: THREE.Object3D | null = null;
    
    // Fallback mesh while loading or if missing
    const fallbackGeo = new THREE.CylinderGeometry(0.5, 0.8, 1.5, 16);
    const fallbackMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, transmission: 0.9, thickness: 0.5 });
    const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
    fallbackMesh.position.y = 0.75;
    bearGroup.add(fallbackMesh);

    try {
      const loader = new GLTFLoader();
      loader.load(
        '/images/polar.glb',
        (gltf) => {
          bearGroup.remove(fallbackMesh);
          bearModel = gltf.scene;
          
          // Auto-scale and center the model dynamically regardless of its original exported size
          const box = new THREE.Box3().setFromObject(bearModel);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const center = box.getCenter(new THREE.Vector3());
          
          const targetSize = 2.2; // Ideal size for the iceberg
          const scale = targetSize / maxDim;
          bearModel.scale.setScalar(scale);
          
          bearModel.position.x = -center.x * scale;
          bearModel.position.y = -center.y * scale + (size.y * scale) / 2; // Sit on top of ice
          bearModel.position.z = -center.z * scale;
          
          bearModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          bearGroup.add(bearModel);

          // Setup Animations if present
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(bearModel);
            // Try to find a walking animation, fallback to first
            const walkAnim = gltf.animations.find(a => a.name.toLowerCase().includes('walk')) || gltf.animations[0];
            const action = mixer.clipAction(walkAnim);
            action.play();
          }
        },
        undefined,
        (error) => {
          console.warn("Could not load polar_bear.glb. Ensure it is placed in public/images/", error);
        }
      );
    } catch (e) {
      console.error(e);
    }

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

    // 7. Arctic Blizzard / Snow Particles (Reduced count for performance)
    const snowCount = 250;
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

      // Animate Penguins waddling/breathing
      penguins.forEach((penguin, i) => {
        const offset = i * Math.PI / 2;
        penguin.rotation.z = Math.sin(elapsed * 2 + offset) * 0.05;
        penguin.position.y = 1.4 + Math.abs(Math.sin(elapsed * 4 + offset)) * 0.03;
      });

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

      // Polar Bear Kinematics & Movement (GLTF)
      if (mixer) {
        mixer.update(delta);
      }

      if (state.isWalking) {
        // Polar Bear traversing back and forth on the iceberg plateau
        bearTravelX += delta * 0.35 * bearDirection;
        if (bearTravelX > 1.2) {
          bearDirection = -1;
        } else if (bearTravelX < -1.1) {
          bearDirection = 1;
        }

        bearGroup.position.x = bearTravelX;
        
        // Ensure bear turns around properly. Most downloaded GLTFs face +Z.
        // If walking +X, it needs to rotate Math.PI/2.
        const targetRotY = bearDirection > 0 ? Math.PI / 2 : -Math.PI / 2;
        bearGroup.rotation.y = THREE.MathUtils.lerp(bearGroup.rotation.y, targetRotY, 0.08);
      }

      // Bear Tracking Cursor Position slightly
      const targetZ = (state.mouse.x * 0.1 * bearDirection);
      const targetX = (-state.mouse.y * 0.1);
      bearGroup.rotation.z = THREE.MathUtils.lerp(bearGroup.rotation.z, targetX, 0.05);

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
    </div>
  );
}
