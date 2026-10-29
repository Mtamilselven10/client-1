import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 8 Cinematic Camera & Model Choreography Stages (Tuned for readability and visual balance)
const CINEMATIC_STAGES = [
  // Stage A: Heroic Opening Reveal (Floating in open space right of the Editorial Headline)
  {
    progress: 0.0,
    cameraPos: [0.6, 0.4, 3.2],
    cameraTarget: [0.8, 0.4, 0.0],
    modelPos: [0.8, 0.4, 0.0],
    modelRot: [0.15, -0.38, 0.04],
    modelScale: 1.25,
  },
  // Stage B: Front View Approach (Gentle frontal alignment as user scrolls into the story)
  {
    progress: 0.15,
    cameraPos: [0.5, 0.2, 3.0],
    cameraTarget: [0.6, 0.2, 0.0],
    modelPos: [0.65, 0.2, 0.0],
    modelRot: [0.02, -0.05, 0.0],
    modelScale: 1.2,
  },
  // Stage C: Three-Quarter / Isometric View (Dimensional structure, framing narrative)
  {
    progress: 0.30,
    cameraPos: [1.8, 0.9, 2.8],
    cameraTarget: [0.6, 0.1, 0.0],
    modelPos: [0.6, 0.1, 0.0],
    modelRot: [-0.22, 0.62, 0.12],
    modelScale: 1.15,
  },
  // Stage D: Side Profile Depth View (Clean extruded edge finish and depth)
  {
    progress: 0.45,
    cameraPos: [2.5, 0.3, 1.2],
    cameraTarget: [0.55, 0.0, 0.0],
    modelPos: [0.55, 0.0, 0.0],
    modelRot: [0.04, 1.54, -0.02],
    modelScale: 1.2,
  },
  // Stage E: Elevated Top-Down View (Contour, symmetry & organic flow)
  {
    progress: 0.60,
    cameraPos: [0.5, 2.8, 1.4],
    cameraTarget: [0.5, 0.0, 0.0],
    modelPos: [0.5, 0.0, 0.0],
    modelRot: [1.3, 0.1, -0.08],
    modelScale: 1.15,
  },
  // Stage F: Opposite Three-Quarter View (Sweeping orbit with warm rim lighting)
  {
    progress: 0.75,
    cameraPos: [-1.4, 0.6, 2.6],
    cameraTarget: [0.35, 0.1, 0.0],
    modelPos: [0.35, 0.1, 0.0],
    modelRot: [0.12, -0.68, -0.05],
    modelScale: 1.2,
  },
  // Stage G: Macro Zoom Detail View (Surface craftsmanship & golden bevel close-up)
  {
    progress: 0.88,
    cameraPos: [0.45, 0.25, 1.9],
    cameraTarget: [0.35, 0.15, 0.0],
    modelPos: [0.35, 0.15, 0.0],
    modelRot: [-0.12, 0.35, 0.04],
    modelScale: 1.55,
  },
  // Stage H: Final Heroic Reveal (Grand anchor framing the Flagship Store section)
  {
    progress: 1.0,
    cameraPos: [0.0, 0.35, 3.1],
    cameraTarget: [0.0, 0.35, 0.0],
    modelPos: [0.0, 0.35, 0.0],
    modelRot: [0.05, 0.0, 0.0],
    modelScale: 1.35,
  },
];

// Helper: Smooth Hermite interpolation
function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

// Helper: Multi-keyframe linear/smoothstep interpolation
function sampleStages(stages, progress) {
  const p = Math.max(0, Math.min(1, progress));
  
  if (p <= stages[0].progress) return stages[0];
  if (p >= stages[stages.length - 1].progress) return stages[stages.length - 1];

  let i = 0;
  while (i < stages.length - 1 && stages[i + 1].progress < p) {
    i++;
  }

  const s0 = stages[i];
  const s1 = stages[i + 1];
  const rawRatio = (p - s0.progress) / (s1.progress - s0.progress);
  const t = smoothStep(rawRatio);

  const lerp = (a, b) => a + (b - a) * t;
  const lerp3 = (a, b) => [lerp(a[0], b[0]), lerp(a[1], b[1]), lerp(a[2], b[2])];

  return {
    cameraPos: lerp3(s0.cameraPos, s1.cameraPos),
    cameraTarget: lerp3(s0.cameraTarget, s1.cameraTarget),
    modelPos: lerp3(s0.modelPos, s1.modelPos),
    modelRot: lerp3(s0.modelRot, s1.modelRot),
    modelScale: lerp(s0.modelScale, s1.modelScale),
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
    camera.position.set(1.2, 0.4, 3.4);

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

    let logoModel = null;

    loader.load(
      modelUrl,
      (gltf) => {
        logoModel = gltf.scene;

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
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load 3D logo model:', err);
        setLoadError('Failed to load 3D model');
        setLoading(false);
      }
    );

    // Interactive Scroll & Parallax State
    let targetProgress = 0;
    let lerpedProgress = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

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

      // Calculate how far container has scrolled into and through viewport
      const scrolled = -rect.top;
      const rawProgress = scrolled / totalScrollable;
      targetProgress = Math.max(0, Math.min(1, rawProgress));
    };

    const handleScroll = () => {
      updateScrollProgress();
    };

    const handleMouseMove = (e) => {
      // Normalized coordinates: -1 to 1
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
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

    // Animation Loop with 60fps lerp interpolation
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth buttery lerping for scroll progress (responsive yet cinematic)
      lerpedProgress += (targetProgress - lerpedProgress) * 0.085;

      // Mouse parallax lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Sample choreographed stages
      const current = sampleStages(CINEMATIC_STAGES, lerpedProgress);

      // Subtle atmospheric breathing motion
      const breath = Math.sin(elapsedTime * 1.6) * 0.02;
      const microTilt = Math.cos(elapsedTime * 1.2) * 0.015;

      // Position, Rotation & Scale
      logoGroup.position.set(
        current.modelPos[0] + mouseX * 0.06,
        current.modelPos[1] + mouseY * 0.05 + breath,
        current.modelPos[2]
      );

      logoGroup.rotation.set(
        current.modelRot[0] + mouseY * 0.08 + microTilt,
        current.modelRot[1] + mouseX * 0.12,
        current.modelRot[2]
      );

      logoGroup.scale.setScalar(current.modelScale);

      // Camera orchestration
      camera.position.set(
        current.cameraPos[0] + mouseX * 0.12,
        current.cameraPos[1] + mouseY * 0.08,
        current.cameraPos[2]
      );
      camera.lookAt(
        current.cameraTarget[0],
        current.cameraTarget[1],
        current.cameraTarget[2]
      );

      // Dynamic light movement following the logo
      keyLight.position.x = 3.5 + mouseX * 0.8;
      keyLight.position.y = 4.0 + mouseY * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
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
