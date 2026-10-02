'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface IceBreak3DSceneProps {
  isBreaking: boolean;
  onBreakComplete: () => void;
  soundEnabled: boolean;
}

interface IceChunk {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotVelocity: THREE.Vector3;
  initialPos: THREE.Vector3;
  initialRot: THREE.Euler;
  shattered: boolean;
}

export default function IceBreak3DScene({
  isBreaking,
  onBreakComplete,
  soundEnabled,
}: IceBreak3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound generator
  const playIceImpactSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // 1. Deep Sub-bass Impact Boom (bear hitting the ice)
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boomOsc.type = 'sawtooth';
      boomOsc.frequency.setValueAtTime(170, now);
      boomOsc.frequency.exponentialRampToValueAtTime(26, now + 1.3);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      boomGain.gain.setValueAtTime(0.95, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      boomOsc.connect(filter);
      filter.connect(boomGain);
      boomGain.connect(ctx.destination);
      boomOsc.start(now);
      boomOsc.stop(now + 1.35);

      // 2. High Frequency Ice Shatter / Crystal Cracks
      for (let i = 0; i < 16; i++) {
        const ping = ctx.createOscillator();
        const pGain = ctx.createGain();
        const pDelay = now + 0.02 + Math.random() * 0.45;
        ping.type = 'triangle';
        ping.frequency.setValueAtTime(1600 + Math.random() * 3400, pDelay);
        ping.frequency.exponentialRampToValueAtTime(300, pDelay + 0.28);

        pGain.gain.setValueAtTime(0.28, pDelay);
        pGain.gain.exponentialRampToValueAtTime(0.001, pDelay + 0.32);

        ping.connect(pGain);
        pGain.connect(ctx.destination);
        ping.start(pDelay);
        ping.stop(pDelay + 0.35);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 1.85, 7.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // 2. Arctic Lighting Setup (#000000, #0B192C, #1E3E62, #FF6500)
    const ambientLight = new THREE.AmbientLight(0x1e3e62, 2.2);
    scene.add(ambientLight);

    const mainMoon = new THREE.DirectionalLight(0xf0f9ff, 3.8);
    mainMoon.position.set(5, 12, 7);
    mainMoon.castShadow = true;
    scene.add(mainMoon);

    // Deep Polar Steel & Midnight Accent Lights
    const auroraCyan = new THREE.PointLight(0x1e3e62, 5.0, 28);
    auroraCyan.position.set(-5, 6, -1);
    scene.add(auroraCyan);

    const auroraGreen = new THREE.PointLight(0x0b192c, 4.2, 24);
    auroraGreen.position.set(5, 7, -3);
    scene.add(auroraGreen);

    const glacialGlow = new THREE.PointLight(0x1e3e62, 5.2, 18);
    glacialGlow.position.set(0, -0.6, 2.2);
    scene.add(glacialGlow);

    // Explosive Impact Strobe Flash Light (sparks when paws smash the ice - #FF6500)
    const impactFlash = new THREE.PointLight(0xff6500, 0, 32);
    impactFlash.position.set(0, 1.5, 0.8);
    scene.add(impactFlash);

    // 3. Waving Sky Ribbon in Background (#1E3E62)
    const auroraGeo = new THREE.PlaneGeometry(36, 12, 32, 12);
    const auroraPos = auroraGeo.attributes.position;
    for (let i = 0; i < auroraPos.count; i++) {
      const x = auroraPos.getX(i);
      const y = auroraPos.getY(i);
      auroraPos.setZ(i, Math.sin(x * 0.3) * 2.5);
    }
    auroraGeo.computeVertexNormals();

    const auroraMat = new THREE.MeshBasicMaterial({
      color: 0x1e3e62,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      wireframe: false,
    });
    const auroraRibbon = new THREE.Mesh(auroraGeo, auroraMat);
    auroraRibbon.position.set(0, 5, -12);
    scene.add(auroraRibbon);

    // 4. Glacial Floor / Ice Floe Ground (#0B192C)
    const groundGeo = new THREE.PlaneGeometry(32, 32, 24, 24);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.7) * 0.2 + Math.cos(y * 0.5) * 0.15);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b192c,
      roughness: 0.18,
      metalness: 0.12,
      transmission: 0.3,
      ior: 1.31,
      clearcoat: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.55;
    ground.receiveShadow = true;
    scene.add(ground);

    // 5. Background Iceberg Peaks (#1E3E62)
    const icebergMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3e62,
      roughness: 0.28,
      metalness: 0.08,
      clearcoat: 0.8,
      flatShading: true,
    });

    const leftBerg = new THREE.Mesh(new THREE.ConeGeometry(5.2, 9.5, 7), icebergMat);
    leftBerg.position.set(-6.8, 2.6, -4.5);
    leftBerg.rotation.y = 0.5;
    scene.add(leftBerg);

    const rightBerg = new THREE.Mesh(new THREE.ConeGeometry(5.8, 10.5, 8), icebergMat);
    rightBerg.position.set(7.2, 3.2, -5.5);
    rightBerg.rotation.y = -0.3;
    scene.add(rightBerg);

    // 6. Build 3D Articulated Polar Bear Group
    const bearGroup = new THREE.Group();
    bearGroup.position.set(0, 0, -1.2); // Positioned closely behind the ice wall
    scene.add(bearGroup);

    const bearFurMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.78,
      metalness: 0.06,
    });

    const bearDarkMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.25,
      metalness: 0.1,
    });

    // Massive Muscular Torso
    const torsoGeo = new THREE.CapsuleGeometry(0.85, 2.0, 16, 16);
    torsoGeo.rotateX(Math.PI / 2);
    const torso = new THREE.Mesh(torsoGeo, bearFurMat);
    torso.position.set(0, 1.45, 0);
    torso.castShadow = true;
    bearGroup.add(torso);

    // Massive Shoulders
    const shoulderGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const shoulder = new THREE.Mesh(shoulderGeo, bearFurMat);
    shoulder.position.set(0, 1.65, 0.75);
    shoulder.scale.set(1.25, 1.05, 0.95);
    bearGroup.add(shoulder);

    // Neck & Head Pivot
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.82, 1.25);
    bearGroup.add(headPivot);

    const neckGeo = new THREE.CylinderGeometry(0.52, 0.68, 0.8, 14);
    neckGeo.rotateX(Math.PI / 4);
    const neck = new THREE.Mesh(neckGeo, bearFurMat);
    neck.position.set(0, 0.16, 0.24);
    headPivot.add(neck);

    // Bear Head
    const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
    headGeo.scale(1.05, 0.95, 1.2);
    const head = new THREE.Mesh(headGeo, bearFurMat);
    head.position.set(0, 0.38, 0.65);
    head.castShadow = true;
    headPivot.add(head);

    // Snout
    const snoutGeo = new THREE.ConeGeometry(0.28, 0.6, 14);
    snoutGeo.rotateX(Math.PI / 2);
    const snout = new THREE.Mesh(snoutGeo, bearFurMat);
    snout.position.set(0, 0.3, 1.15);
    headPivot.add(snout);

    // Roaring Jaw (lowered slightly during the roar smash)
    const jawGeo = new THREE.BoxGeometry(0.26, 0.14, 0.45);
    const jaw = new THREE.Mesh(jawGeo, bearFurMat);
    jaw.position.set(0, 0.16, 1.05);
    headPivot.add(jaw);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.095, 10, 10);
    const nose = new THREE.Mesh(noseGeo, bearDarkMat);
    nose.position.set(0, 0.3, 1.46);
    headPivot.add(nose);

    // Eyes with subtle cyan eye-shine
    const eyeGeo = new THREE.SphereGeometry(0.048, 8, 8);
    const eyeL = new THREE.Mesh(eyeGeo, bearDarkMat);
    eyeL.position.set(0.26, 0.48, 0.95);
    headPivot.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, bearDarkMat);
    eyeR.position.set(-0.26, 0.48, 0.95);
    headPivot.add(eyeR);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.13, 10, 10);
    earGeo.scale(0.8, 1, 0.5);
    const earL = new THREE.Mesh(earGeo, bearFurMat);
    earL.position.set(0.38, 0.72, 0.5);
    headPivot.add(earL);

    const earR = new THREE.Mesh(earGeo, bearFurMat);
    earR.position.set(-0.38, 0.72, 0.5);
    headPivot.add(earR);

    // Massive Front Paws (that smash through the ice)
    const createFrontPaw = (isLeft: boolean) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(isLeft ? 0.78 : -0.78, 1.55, 0.75);

      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.26, 0.9, 12),
        bearFurMat
      );
      upperArm.position.y = -0.4;
      armGroup.add(upperArm);

      const foreArmGroup = new THREE.Group();
      foreArmGroup.position.set(0, -0.8, 0);
      armGroup.add(foreArmGroup);

      const foreArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.24, 0.8, 12),
        bearFurMat
      );
      foreArm.position.y = -0.34;
      foreArmGroup.add(foreArm);

      // Huge Ice-Crushing Claw / Paw
      const paw = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.2, 0.48),
        bearFurMat
      );
      paw.position.set(0, -0.75, 0.14);
      paw.castShadow = true;
      foreArmGroup.add(paw);

      // Claws
      for (let c = -2; c <= 2; c++) {
        const claw = new THREE.Mesh(
          new THREE.ConeGeometry(0.028, 0.16, 6),
          bearDarkMat
        );
        claw.rotation.x = Math.PI / 2;
        claw.position.set(c * 0.09, -0.75, 0.4);
        foreArmGroup.add(claw);
      }

      bearGroup.add(armGroup);
      return { armGroup, foreArmGroup };
    };

    const leftArm = createFrontPaw(true);
    const rightArm = createFrontPaw(false);

    // Initial stance
    leftArm.armGroup.rotation.x = -0.4;
    rightArm.armGroup.rotation.x = -0.4;

    // 7. Crystalline Ice Wall (36 Glowing Faceted Diamond Ice Blocks)
    const iceWallGroup = new THREE.Group();
    iceWallGroup.position.set(0, 1.55, 0.6); // Centered right in front of bear
    scene.add(iceWallGroup);

    // Translucent radiant ice material with clearcoat sheen (#1E3E62 tone)
    const iceCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x93b5d8,
      roughness: 0.1,
      metalness: 0.08,
      transmission: 0.45,
      ior: 1.31,
      thickness: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      emissive: 0x1e3e62,
      emissiveIntensity: 0.25,
      flatShading: true,
      transparent: true,
      opacity: 0.92,
    });

    const iceChunks: IceChunk[] = [];
    const rows = 6;
    const cols = 6;
    const blockWidth = 0.92;
    const blockHeight = 0.68;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const xPos = (c - (cols - 1) / 2) * blockWidth + (Math.random() - 0.5) * 0.08;
        const yPos = (r - (rows - 1) / 2) * blockHeight + (Math.random() - 0.5) * 0.08;

        const shardGeo = new THREE.DodecahedronGeometry(
          0.46 + Math.random() * 0.14,
          0
        );
        shardGeo.scale(1.15 + Math.random() * 0.25, 0.9 + Math.random() * 0.25, 0.5);

        const shardMesh = new THREE.Mesh(shardGeo, iceCrystalMat);
        shardMesh.position.set(xPos, yPos, (Math.random() - 0.5) * 0.12);
        shardMesh.rotation.set(
          Math.random() * 0.15,
          Math.random() * 0.15,
          Math.random() * Math.PI
        );
        shardMesh.castShadow = true;
        shardMesh.receiveShadow = true;
        iceWallGroup.add(shardMesh);

        // Explosive outward blast vector radiating from the center impact
        const distFromCenter = Math.sqrt(xPos * xPos + yPos * yPos) + 0.15;
        const blastX = (xPos / distFromCenter) * (5.5 + Math.random() * 6.5);
        const blastY = (yPos / distFromCenter) * (4.2 + Math.random() * 5.2) + 1.4;
        const blastZ = 5.5 + Math.random() * 7.5; // Blast straight forward into the camera!

        iceChunks.push({
          mesh: shardMesh,
          velocity: new THREE.Vector3(blastX, blastY, blastZ),
          rotVelocity: new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ),
          initialPos: shardMesh.position.clone(),
          initialRot: shardMesh.rotation.clone(),
          shattered: false,
        });
      }
    }

    // 8. Swirling Snow Particle Atmosphere
    const snowCount = 1000;
    const snowGeo = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    const snowSpeeds = new Float32Array(snowCount);

    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 24;
      snowPositions[i * 3 + 1] = Math.random() * 15;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      snowSpeeds[i] = 0.035 + Math.random() * 0.055;
    }

    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.075,
      transparent: true,
      opacity: 0.9,
    });
    const snowPoints = new THREE.Points(snowGeo, snowMat);
    scene.add(snowPoints);

    // 9. Animation Loop
    let clock = new THREE.Clock();
    let shatterProgress = 0;
    let hasPlayedSound = false;
    let cameraShake = 0;

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Atmospheric Aurora color pulses and gentle sky waving
      auroraCyan.intensity = 4.5 + Math.sin(time * 2.2) * 1.5;
      auroraGreen.intensity = 3.8 + Math.cos(time * 1.8) * 1.2;
      auroraRibbon.rotation.z = Math.sin(time * 0.5) * 0.04;

      // Update falling snow
      const pAttr = snowGeo.attributes.position;
      for (let i = 0; i < snowCount; i++) {
        let y = pAttr.getY(i) - snowSpeeds[i];
        if (y < -0.5) y = 15;
        pAttr.setY(i, y);
        pAttr.setX(i, pAttr.getX(i) + Math.sin(time + i) * 0.006);
      }
      pAttr.needsUpdate = true;

      // Idle Bear Animation (Breathing & Head look)
      if (!isBreaking) {
        torso.scale.x = 1 + Math.sin(time * 2) * 0.02;
        headPivot.rotation.y = Math.sin(time * 1.2) * 0.08;
        headPivot.rotation.x = Math.sin(time * 1.5) * 0.05;

        // Subtle paw flexing against the ice
        leftArm.armGroup.rotation.x = -0.4 + Math.sin(time * 2.5) * 0.04;
        rightArm.armGroup.rotation.x = -0.4 - Math.sin(time * 2.5) * 0.04;
      } else {
        // BREAKING SEQUENCE IN 3D!
        shatterProgress += delta;

        if (!hasPlayedSound) {
          playIceImpactSound();
          hasPlayedSound = true;
          cameraShake = 0.45;
          impactFlash.intensity = 18; // Massive blinding crystalline impact flash!
        } else {
          impactFlash.intensity *= 0.88; // Quick strobe fade
        }

        if (shatterProgress < 0.35) {
          // Wind-up: Bear rears up and lunges forward!
          const t = shatterProgress / 0.35;
          bearGroup.position.z = -1.2 + t * 1.2; // Rushing forward
          headPivot.rotation.x = -0.35 + t * 0.65; // Roaring forward
          jaw.position.y = 0.16 - t * 0.12; // Roaring open mouth!
          leftArm.armGroup.rotation.x = -0.4 - t * 0.85; // Raising paws high
          rightArm.armGroup.rotation.x = -0.4 - t * 0.85;
          leftArm.armGroup.rotation.z = -t * 0.35;
          rightArm.armGroup.rotation.z = t * 0.35;
        } else if (shatterProgress < 0.7) {
          // IMPACT SMASH: Paws slam forward through the ice!
          const t = (shatterProgress - 0.35) / 0.35;
          bearGroup.position.z = 0.0 + t * 1.8; // Breaking right through the ice plane!
          bearGroup.position.y = Math.sin(t * Math.PI) * 0.45;
          leftArm.armGroup.rotation.x = -1.25 + t * 1.55; // Slamming forward down
          rightArm.armGroup.rotation.x = -1.25 + t * 1.55;
          headPivot.rotation.x = 0.3 - t * 0.4;
        } else {
          // Full forward lunge through the shattered portal toward camera
          const t = Math.min((shatterProgress - 0.7) / 1.0, 1);
          bearGroup.position.z = 1.8 + t * 3.4;
          camera.position.z = 7.8 - t * 3.6; // Camera rushes forward into the website
        }

        // Apply physical explosive trajectories to all 3D ice chunks
        if (shatterProgress >= 0.28) {
          const physDelta = delta * 1.8;
          iceChunks.forEach((chunk) => {
            // Apply 3D velocity
            chunk.mesh.position.x += chunk.velocity.x * physDelta;
            chunk.mesh.position.y += chunk.velocity.y * physDelta;
            chunk.mesh.position.z += chunk.velocity.z * physDelta;

            // Apply gravity
            chunk.velocity.y -= 8.5 * physDelta;

            // Apply tumbling spin
            chunk.mesh.rotation.x += chunk.rotVelocity.x * physDelta;
            chunk.mesh.rotation.y += chunk.rotVelocity.y * physDelta;
            chunk.mesh.rotation.z += chunk.rotVelocity.z * physDelta;

            // Shimmering fade out as they fly past
            chunk.mesh.scale.multiplyScalar(0.982);
          });
        }

        // Camera Shake effect during initial impact
        if (cameraShake > 0.01) {
          camera.position.x = (Math.random() - 0.5) * cameraShake;
          camera.position.y = 1.85 + (Math.random() - 0.5) * cameraShake;
          cameraShake *= 0.91;
        } else {
          camera.position.x = 0;
          camera.position.y = 1.85;
        }

        // Complete callback
        if (shatterProgress >= 1.65) {
          onBreakComplete();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isBreaking, onBreakComplete, soundEnabled]);

  return (
    <div ref={containerRef} className="ice-break-3d-canvas-container">
      <canvas ref={canvasRef} className="ice-break-3d-canvas" />
    </div>
  );
}
