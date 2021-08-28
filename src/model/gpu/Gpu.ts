import { LocalDateTime } from 'js-joda';
import { Maker } from '@/types/Maker';
import { Chipset } from '@/types/Chipset';

export type Gpu = {
  readonly chipset: Chipset;
  readonly maker: Maker;
  readonly name: string;
  readonly price: number;
  readonly createDateTime: LocalDateTime;
}
