import { Chipset } from '@/types/Chipset';

export type Gpu = {
  readonly id: number;
  readonly chipset: Chipset;
  readonly products: ReadonlyArray<Product>;
};

export type Product = {
  readonly name: string;
  readonly url: string;
  readonly prices: ReadonlyArray<Price>;
};

export type Price = {
  readonly date: string;
  readonly price: number;
};
