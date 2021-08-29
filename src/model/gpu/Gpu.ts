import { LocalDateTime } from 'js-joda';
import { Maker } from '@/types/Maker';
import { Chipset } from '@/types/Chipset';
import { GpuSeller } from '@/types/GpuSeller';

export type Gpu = {
  readonly chipset: Chipset;
  readonly maker: Maker;
  readonly seller: GpuSeller,
  readonly name: string;
  readonly price: number;
  readonly createDateTime: LocalDateTime;
  readonly url: string;
}
