import { AppsyncResolver } from '@/lambda/resolver/AppsyncResolver';
import { Chipsets } from '@/types/Chipset';
import { findGpu } from '@/lambda/api/findGpu';
import { LocalDate } from 'js-joda';
import { Gpu } from '@/lambda/resolver/Schema';
import { HttpError } from '@/error/HttpError';

export const handler: AppsyncResolver<GpuRequest, GpuResponse> = async (event) => {
  console.info('event', JSON.stringify(event));
  const gpu = Chipsets[event.arguments.id];
  if (gpu === undefined) {
    throw new HttpError(400, `cannot find gpu (id = ${event.arguments.id})`);
  }

  const now = LocalDate.now();
  const { year, month } = {
    year: now.year(),
    month: now.monthValue(),
    ...event.arguments
  };

  const dto = await findGpu(gpu, year, month);

  return {
    id: event.arguments.id,
    chipset: gpu,
    products: dto.map(e => ({
      name: e.name,
      url: e.url,
      prices: e.prices
    })),
  };
};

type GpuRequest = {
  readonly id: number;
  readonly year?: number;
  readonly month?: number;
};

type GpuResponse = Gpu;
