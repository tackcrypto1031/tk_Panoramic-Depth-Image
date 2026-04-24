import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MathUtils } from 'three';
import type { Item, ViewerSettings } from '@shared/types';
import { LIMITS } from '@shared/types';

interface Props {
  item: Item;
  settings: ViewerSettings;
  onFovChange: (fov: number) => void;
}

export function PanoramaScene({ item, settings, onFovChange }: Props) {
  return (
    <Canvas
      camera={{ fov: settings.fov, position: [0, 0, 0.01], near: 0.01, far: 1000 }}
      style={{ background: '#000' }}
    >
      <CameraFovSync fov={settings.fov} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate
        rotateSpeed={-0.5}
        autoRotate={settings.autoRotate}
        autoRotateSpeed={settings.autoRotateSpeed}
        target={[0, 0, 0]}
      />
      <ambientLight intensity={1} />
      <Suspense fallback={null}>
        <PanoramaSphere item={item} settings={settings} />
      </Suspense>
      {item.depth && !settings.autoRotate && <MouseParallax amount={settings.parallaxAmount} />}
      <WheelFovHandler fov={settings.fov} onChange={onFovChange} />
    </Canvas>
  );
}

function PanoramaSphere({ item, settings }: { item: Item; settings: ViewerSettings }) {
  const panoramaUrl = `/uploads/${item.id}/${item.panorama.filename}`;
  const depthUrl = item.depth
    ? `/uploads/${item.id}/${item.depth.filename}`
    : '/placeholder-depth.png';
  const [panoramaTex, depthTex] = useTexture([panoramaUrl, depthUrl]) as [THREE.Texture, THREE.Texture];

  const effectiveScale = item.depth
    ? (settings.invertDepth ? -1 : 1) * settings.depthScale * 50
    : 0;

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 128, 64]} />
      <meshStandardMaterial
        map={panoramaTex}
        displacementMap={item.depth ? depthTex : undefined}
        displacementScale={effectiveScale}
        side={THREE.BackSide}
        toneMapped={false}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function CameraFovSync({ fov }: { fov: number }) {
  const { camera } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }, [fov, camera]);
  return null;
}

function MouseParallax({ amount }: { amount: number }) {
  const { camera, gl } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    const onLeave = () => {
      mouse.current.x = 0;
      mouse.current.y = 0;
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [gl]);

  useFrame((_state, delta) => {
    const strength = amount * 3;
    target.current.x = mouse.current.x * strength;
    target.current.y = -mouse.current.y * strength;
    camera.position.x = MathUtils.damp(camera.position.x, target.current.x, 5, delta);
    camera.position.y = MathUtils.damp(camera.position.y, target.current.y, 5, delta);
  });

  return null;
}

function WheelFovHandler({ fov, onChange }: { fov: number; onChange: (v: number) => void }) {
  const { gl } = useThree();
  const fovRef = useRef(fov);
  fovRef.current = fov;

  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 2 : -2;
      const next = Math.max(LIMITS.fovMin, Math.min(LIMITS.fovMax, fovRef.current + delta));
      if (next !== fovRef.current) onChange(next);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [gl, onChange]);

  return null;
}
