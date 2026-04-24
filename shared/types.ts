export type ItemId = string;

export interface ImageMeta {
  filename: string;
  width: number;
  height: number;
  mimeType: string;
  originalWidth?: number;
  originalHeight?: number;
}

export interface ViewerSettings {
  depthScale: number;
  parallaxAmount: number;
  fov: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  invertDepth: boolean;
  depthMode: boolean;
}

export interface ThumbnailMeta {
  filename: string;
  width: number;
  height: number;
}

export interface Item {
  id: ItemId;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  panorama: ImageMeta;
  depth: ImageMeta | null;
  thumbnail: ThumbnailMeta;
  viewerSettings: ViewerSettings;
}

export interface ItemsFile {
  version: 1;
  items: Item[];
}

export type ApiErrorCode =
  | 'INVALID_RATIO'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_MIME'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'INTERNAL';

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export const DEFAULT_VIEWER_SETTINGS: ViewerSettings = {
  depthScale: 0.5,
  parallaxAmount: 0.3,
  fov: 75,
  autoRotate: false,
  autoRotateSpeed: 0.5,
  invertDepth: false,
  depthMode: false,
};

export const LIMITS = {
  titleMaxLen: 100,
  tagMaxLen: 30,
  tagsMaxCount: 10,
  fileMaxBytes: 50 * 1024 * 1024,
  imageMaxW: 8192,
  imageMaxH: 4096,
  ratioMin: 1.9,
  ratioMax: 2.1,
  thumbW: 480,
  thumbH: 240,
  fovMin: 50,
  fovMax: 110,
  autoRotateSpeedMin: 0.1,
  autoRotateSpeedMax: 5,
  trashTtlDays: 7,
} as const;
