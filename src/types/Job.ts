import { GpuSeller } from '@/types/GpuSeller';

export type Job = GetProductLinkJob | GetGpuPriceJob;

export type GetProductLinkJob = {
  readonly type: 'GetProductLink';
  readonly url: string;
  readonly seller: GpuSeller;
}

export type GetGpuPriceJob = {
  readonly type: 'GetGpuPrice';
  readonly url: string;
  readonly seller: GpuSeller;
}
