import { useState, useEffect } from 'react';

export function useWebGLCheck(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setOk(!!gl);
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}
