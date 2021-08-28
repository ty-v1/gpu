export const Chipsets = [
  'RTX3060',
  'RTX3060Ti',
  'RTX3070',
  'RTX3070Ti',
  'RTX3080',
  'RTX3080Ti',
  'RTX3090',
  'RTX3090Ti',
] as const;

export type Chipset = typeof Chipsets[number];
