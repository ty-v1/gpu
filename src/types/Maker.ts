export const Maker = {
  GIGABYTE: {
    name: 'GIGABYTE',
    code: '01FE6AKD51Y2K1ZYSGS3K15NQG',
  },
  MSI: {
    name: 'MSI',
    code: '01FE6AKD51G1NYAPH9RTNSDHDJ',
  },
  ASUS: {
    name: 'ASUS',
    code: '01FE6AKD51KJ47TASSHRW7TNXM',
  },
  ZOTAC: {
    name: 'ZOTAC',
    code: '01FE6AKD51WVR8WY8H1WBTNJ23',
  },
  KuroutoSikou: {
    name: '玄人志向',
    code: '01FE6AKD51WYE2205RVMEM6V56',
  },
  inno3D: {
    name: 'inno3D',
    code: '01FE6AKD51933KGPZ4CBJGXTGB',
  },
  Gainward: {
    name: 'Gainward',
    code: '01FE6AKD51HWV2C6BNJAR7SAYF',
  },
  Colorful: {
    name: 'Colorful',
    code: '01FE6AKD514VHW34GCD4XXD3GG',
  },
  Palit: {
    name: 'Palit',
    code: '01FE6AKD51CA38K1NBPWADS7T1',
  },
  ELSA: {
    name: 'ELSA',
    code: '01FE8V355806NCDV93YWFTD371',
  },
} as const;

export type Maker = typeof Maker[keyof typeof Maker];
