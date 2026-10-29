import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ============================================================================
// SCROLL-DRIVEN 3D CAMERA & MODEL STAGES (CONTROLLED: FRONT VIEW & TOP VIEW ONLY)
// ============================================================================
// Stage 0 -> Stage 1: progress 0.00 to 0.30 (Corner icon -> Front view, full-screen)
// Stage 1 -> Stage 2: progress 0.30 to 0.65 (Front view -> Top view, full-screen)
// Stage 2 -> Stage 3: progress 0.65 to 1.00 (Top view -> Back to corner icon)
// ============================================================================

export const STAGE_CONFIG = {
  stage0_corner: 0.00, // Initial static icon in top-right corner
  stage1_front: 0.30,  // Zoomed & rotated into full-screen front view
  stage2_top: 0.65,    // Smooth transition into full-screen top view
  stage3_corner: 1.00, // Reverted and shrunk back into top-right corner icon
};

// Preset exact rotation angles [X, Y, Z] in radians:
// - Front View: [0, 0, 0] faces camera directly
// - Top View: [Math.PI / 2, 0, 0] rotates around X axis by +90° (+1.57 rad) to display top view
// - Corner Pose: [0, 0, 0] clean resting front-facing icon angle
export const ROTATION_PRESETS = {
  frontView: [0, 0, 0],
  topView: [Math.PI / 2, 0, 0],
  cornerPose: [0, 0, 0],
};

// Scale presets:
// - Corner icon: small static icon in top-right
// - Full-screen background: large background behind text overlay
const CORNER_SCALE = 0.38;
const FULLSCREEN_SCALE = 2.15;

// Helper: Power2 In/Out smooth easing curve
function power2InOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Compute top-right corner position dynamically based on camera aspect ratio
function getCornerPosition(aspect) {
  const vFOV = THREE.MathUtils.degToRad(42);
  const halfHeight = Math.tan(vFOV / 2) * 3.2;
  const halfWidth = halfHeight * aspect;
  // Position neatly inside top-right bounds with comfortable margins on all screen sizes
  return [halfWidth * 0.62, halfHeight * 0.50, 0];
}

// Interpolate strictly through the 3 scroll stages
function interpolateScrollStages(progress, cornerPos) {
  const p = Math.max(0, Math.min(1, progress));
  const { stage0_corner, stage1_front, stage2_top, stage3_corner } = STAGE_CONFIG;
  const { frontView, topView, cornerPose } = ROTATION_PRESETS;

  // --------------------------------------------------------------------------
  // STAGE 0 to STAGE 1: Corner Icon (0.00) -> Front View Full Screen (0.30)
  // Zooms and scales from small top-right icon into full-screen front view
  // --------------------------------------------------------------------------
  if (p <= stage1_front) {
    const rawT = (p - stage0_corner) / (stage1_front - stage0_corner);
    const t = power2InOut(Math.max(0, Math.min(1, rawT)));
    return {
      pos: [
        cornerPos[0] * (1 - t),
        cornerPos[1] * (1 - t),
        0
      ],
      rot: [
        cornerPose[0] + (frontView[0] - cornerPose[0]) * t,
        cornerPose[1] + (frontView[1] - cornerPose[1]) * t,
        cornerPose[2] + (frontView[2] - cornerPose[2]) * t,
      ],
      scale: CORNER_SCALE + (FULLSCREEN_SCALE - CORNER_SCALE) * t,
    };
  }

  // --------------------------------------------------------------------------
  // STAGE 1 to STAGE 2: Front View Full Screen (0.30) -> Top View Full Screen (0.65)
  // Stays full-screen background while rotating smoothly from front view to top view
  // --------------------------------------------------------------------------
  if (p <= stage2_top) {
    const rawT = (p - stage1_front) / (stage2_top - stage1_front);
    const t = power2InOut(Math.max(0, Math.min(1, rawT)));
    return {
      pos: [0, 0, 0],
      rot: [
        frontView[0] + (topView[0] - frontView[0]) * t,
        frontView[1] + (topView[1] - frontView[1]) * t,
        frontView[2] + (topView[2] - frontView[2]) * t,
      ],
      scale: FULLSCREEN_SCALE,
    };
  }

  // --------------------------------------------------------------------------
  // STAGE 2 to STAGE 3: Top View Full Screen (0.65) -> Back to Corner Icon (1.00)
  // Rotates back from top view and shrinks back into the top-right corner icon
  // --------------------------------------------------------------------------
  const rawT = (p - stage2_top) / (stage3_corner - stage2_top);
  const t = power2InOut(Math.max(0, Math.min(1, rawT)));
  return {
    pos: [
      cornerPos[0] * t,
      cornerPos[1] * t,
      0
    ],
    rot: [
      topView[0] + (cornerPose[0] - topView[0]) * t,
      topView[1] + (cornerPose[1] - topView[1]) * t,
      topView[2] + (cornerPose[2] - topView[2]) * t,
    ],
    scale: FULLSCREEN_SCALE + (CORNER_SCALE - FULLSCREEN_SCALE) * t,
  };
}

export default function CinematicLogo3DCanvas({ containerRef }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId;
    let isVisible = true;

    // WebGL Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      42,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Premium Lighting Scheme
    // Warm coconut cream ambient
    const ambientLight = new THREE.AmbientLight(0xfaf8f5, 0.95);
    scene.add(ambientLight);

    // Golden Key light (warm harvest tone)
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 1.6);
    keyLight.position.set(3.5, 4.0, 3.5);
    scene.add(keyLight);

    // Cool Rim light (crisp dimensional edge definition)
    const rimLight = new THREE.DirectionalLight(0xe0f2fe, 0.9);
    rimLight.position.set(-3.5, -2.0, -2.5);
    scene.add(rimLight);

    // Warm Earth point light (ground bounce & depth)
    const earthPoint = new THREE.PointLight(0x5d4037, 1.2, 10);
    earthPoint.position.set(0, -2.5, 2.5);
    scene.add(earthPoint);

    // Subtle golden highlight point
    const goldGlint = new THREE.PointLight(0xffd54f, 1.0, 8);
    goldGlint.position.set(1.5, 2.0, 1.5);
    scene.add(goldGlint);

    // Group to hold and manipulate the logo
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    // Load Model using GLTFLoader
    const loader = new GLTFLoader();
    const modelUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/models/logo_3d_color.glb`;

    loader.load(
      modelUrl,
      (gltf) => {
        const logoModel = gltf.scene;

        // Enhance materials without altering original geometry or textures
        logoModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.42;
              child.material.metalness = 0.18;
              child.material.needsUpdate = true;
            }
          }
        });

        // Center the model's pivot
        const bbox = new THREE.Box3().setFromObject(logoModel);
        const center = bbox.getCenter(new THREE.Vector3());
        logoModel.position.x = -center.x;
        logoModel.position.y = -center.y;
        logoModel.position.z = -center.z;

        logoGroup.add(logoModel);

        // Position initial state immediately
        const initialCornerPos = getCornerPosition(camera.aspect);
        const initialTransform = interpolateScrollStages(0, initialCornerPos);
        logoGroup.position.set(...initialTransform.pos);
        logoGroup.rotation.set(...initialTransform.rot);
        logoGroup.scale.setScalar(initialTransform.scale);

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load 3D logo model:', err);
        setLoadError('Failed to load 3D model');
        setLoading(false);
      }
    );

    // Scroll Progress State (Single scrubbed progress, NO mouse-follow, NO continuous spin)
    let targetProgress = 0;
    let lerpedProgress = 0;

    // Calculate Scroll Progress inside the About Us container
    const updateScrollProgress = () => {
      const container = containerRef?.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollable = rect.height - viewportHeight;

      if (totalScrollable <= 0) {
        targetProgress = 0;
        return;
      }

      // Calculate how far container has scrolled through viewport
      const scrolled = Math.max(0, -rect.top);
      const rawProgress = scrolled / totalScrollable;
      targetProgress = Math.max(0, Math.min(1, rawProgress));
    };

    const handleScroll = () => {
      updateScrollProgress();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollProgress();

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      updateScrollProgress();
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(canvas);

    // IntersectionObserver to pause render loop when off-screen
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    if (containerRef?.current) {
      intersectionObserver.observe(containerRef.current);
    }

    // Animation Loop with smooth scrubbed interpolation (scrub: 1 feel, reversible)
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      // Smooth scrub smoothing (equivalent to scrub: 1)
      lerpedProgress += (targetProgress - lerpedProgress) * 0.15;

      // Compute dynamic corner position based on current aspect ratio
      const cornerPos = getCornerPosition(camera.aspect);

      // Sample exact pose: position, rotation, and scale for current scroll progress
      const { pos, rot, scale } = interpolateScrollStages(lerpedProgress, cornerPos);

      // Apply to 3D logo group (Static when stationary; strictly scroll-driven)
      logoGroup.position.set(pos[0], pos[1], pos[2]);
      logoGroup.rotation.set(rot[0], rot[1], rot[2]);
      logoGroup.scale.setScalar(scale);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      // Dispose Three.js objects
      scene.traverse((obj) => {
        if (obj.isMesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
    };
  }, [containerRef]);

  return (
    <div 
      className="w-full h-full pointer-events-none overflow-hidden relative"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.6s ease-in-out',
        }}
      />
      {loadError && (
        <div className="sr-only">Notice: 3D logo preview unavailable.</div>
      )}
    </div>
  );
}
