import { AppsyncResolver } from '@/lambda/resolver/AppsyncResolver';
import { Chipsets } from '@/types/Chipset';
import { findGpu } from '@/lambda/api/findGpu';
import { LocalDate } from 'js-joda';
import { Gpu } from '@/lambda/resolver/Schema';

export const handler: AppsyncResolver<AllGpuRequest, AllGpuResponse> = async (event) => {
  console.info('event', JSON.stringify(event));

  const gpus = Chipsets.map((e, i) => ({
    id: i,
    chipset: e
  }));

  const now = LocalDate.now();
  const { year, month } = {
    year: now.year(),
    month: now.monthValue(),
    ...event.arguments
  };

  const response = new Array<Gpu>();
  for await (const gpu of gpus) {
    const dto = await findGpu(gpu.chipset, year, month);
    response.push({
      id: gpu.id,
      chipset: gpu.chipset,
      products: dto.map(e => ({
        name: e.name,
        url: e.url,
        prices: e.prices
      })),
    });
    console.log(`Done: ${gpu.chipset}`);
  }

  return response;
};

type AllGpuRequest = {
  readonly year?: number;
  readonly month?: number;
};

type AllGpuResponse = ReadonlyArray<Gpu>
