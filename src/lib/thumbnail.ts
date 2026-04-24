import * as THREE from 'three';
import { DEFAULT_VIEWER_SETTINGS, LIMITS } from '@shared/types';

async function loadTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject);
  });
}

async function fileToUrl(file: File): Promise<string> {
  return URL.createObjectURL(file);
}

export async function renderThumbnail(panoramaFile: File, depthFile: File | null): Promise<Blob> {
  const width = LIMITS.thumbW;
  const height = LIMITS.thumbH;

  const panoUrl = await fileToUrl(panoramaFile);
  const depthUrl = depthFile ? await fileToUrl(depthFile) : null;

  try {
    const panoTex = await loadTexture(panoUrl);
    const depthTex = depthUrl ? await loadTexture(depthUrl) : null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      DEFAULT_VIEWER_SETTINGS.fov,
      width / height,
      0.01,
      1000
    );
    camera.position.set(0, 0, 0.01);
    camera.lookAt(1, 0, 0);

    const geo = new THREE.SphereGeometry(500, 64, 32);
    const mat = new THREE.MeshStandardMaterial({
      map: panoTex,
      displacementMap: depthTex ?? undefined,
      displacementScale: depthTex ? DEFAULT_VIEWER_SETTINGS.depthScale * 50 : 0,
      side: THREE.BackSide,
      roughness: 1,
      metalness: 0,
    });
    mat.toneMapped = false;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(-1, 1, 1);
    scene.add(mesh);

    renderer.render(scene, camera);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('thumbnail blob failed'))),
        'image/webp',
        0.85
      );
    });

    // cleanup
    geo.dispose();
    mat.dispose();
    panoTex.dispose();
    depthTex?.dispose();
    renderer.dispose();

    return blob;
  } finally {
    URL.revokeObjectURL(panoUrl);
    if (depthUrl) URL.revokeObjectURL(depthUrl);
  }
}
