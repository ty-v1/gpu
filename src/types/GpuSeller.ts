export const GpuSeller = {
  Tsukumo: 'tsukumo',
  Dospara: 'dospara',
  Ark: 'ark',
} as const;

export type GpuSeller = typeof GpuSeller[keyof typeof GpuSeller];
