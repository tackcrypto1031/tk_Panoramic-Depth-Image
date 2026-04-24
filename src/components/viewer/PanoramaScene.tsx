import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Item, ViewerSettings } from '@shared/types';
import { LIMITS } from '@shared/types';

interface Props {
  item: Item;
  settings: ViewerSettings;
  onFovChange: (fov: number) => void;
}

export function PanoramaScene({ item, settings, onFovChange }: Props) {
  const depthModeActive = !!item.depth && settings.depthMode;
  return (
    <Canvas
      camera={{ fov: settings.fov, position: [0, 0, 0.01], near: 0.01, far: 1000 }}
      style={{ background: '#000' }}
    >
      <CameraFovSync fov={settings.fov} />
      {!depthModeActive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate
          rotateSpeed={-1}
          enableDamping={false}
          autoRotate={settings.autoRotate}
          autoRotateSpeed={settings.autoRotateSpeed}
          target={[0, 0, 0]}
        />
      )}
      <Suspense fallback={null}>
        {item.depth ? (
          <PanoramaSphereWithDepth item={item} settings={settings} />
        ) : (
          <PanoramaSphereOnly item={item} />
        )}
      </Suspense>
      {depthModeActive && <DepthParallaxCamera strength={settings.parallaxAmount} />}
      <WheelFovHandler fov={settings.fov} onChange={onFovChange} />
    </Canvas>
  );
}

const DEPTH_SCALE_MULTIPLIER = 250;

function usePanoramaTexture(url: string): THREE.Texture {
  const tex = useTexture(url) as THREE.Texture;
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
  }, [tex]);
  return tex;
}

function PanoramaSphereOnly({ item }: { item: Item }) {
  const panoramaUrl = `/uploads/${item.id}/${item.panorama.filename}`;
  const panoramaTex = usePanoramaTexture(panoramaUrl);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 128, 64]} />
      <meshBasicMaterial map={panoramaTex} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

function PanoramaSphereWithDepth({
  item,
  settings,
}: {
  item: Item;
  settings: ViewerSettings;
}) {
  const panoramaUrl = `/uploads/${item.id}/${item.panorama.filename}`;
  const depthUrl = `/uploads/${item.id}/${item.depth!.filename}`;
  const panoramaTex = usePanoramaTexture(panoramaUrl);
  const depthTex = useTexture(depthUrl) as THREE.Texture;

  const effectiveScale =
    (settings.invertDepth ? 1 : -1) * settings.depthScale * DEPTH_SCALE_MULTIPLIER;

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 256, 128]} />
      <meshStandardMaterial
        emissive={'#ffffff'}
        emissiveMap={panoramaTex}
        emissiveIntensity={1}
        displacementMap={depthTex}
        displacementScale={effectiveScale}
        side={THREE.BackSide}
        toneMapped={false}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

const PARALLAX_MAX_OFFSET = 120;

function DepthParallaxCamera({ strength }: { strength: number }) {
  const { camera, gl } = useThree();
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const current = useRef(new THREE.Vector2(0, 0));
  const basePos = useRef(new THREE.Vector3());
  const baseQuat = useRef(new THREE.Quaternion());
  const right = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3());

  useEffect(() => {
    basePos.current.copy(camera.position);
    baseQuat.current.copy(camera.quaternion);
    right.current.set(1, 0, 0).applyQuaternion(baseQuat.current);
    up.current.set(0, 1, 0).applyQuaternion(baseQuat.current);
    current.current.set(0, 0);
    mouseTarget.current.set(0, 0);

    const el = gl.domElement;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseTarget.current.set(nx, -ny);
    };
    const onLeave = () => {
      mouseTarget.current.set(0, 0);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      camera.position.copy(basePos.current);
      camera.quaternion.copy(baseQuat.current);
    };
  }, [camera, gl]);

  useFrame((_state, delta) => {
    const smoothing = 1 - Math.pow(0.001, delta);
    current.current.lerp(mouseTarget.current, smoothing);

    const range = PARALLAX_MAX_OFFSET * strength;
    camera.quaternion.copy(baseQuat.current);
    camera.position
      .copy(basePos.current)
      .addScaledVector(right.current, current.current.x * range)
      .addScaledVector(up.current, current.current.y * range);
  });

  return null;
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
