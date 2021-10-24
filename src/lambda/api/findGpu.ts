import { GpuRepository } from '@/model/gpu/GpuRepository';
import { Chipset } from '@/types/Chipset';
import { DateTimeFormatter } from 'js-joda';

const Format = DateTimeFormatter.ofPattern('yyyy-MM-dd');

export const findGpu = async (chipset: Chipset, year: number, month: number) => {

  const gpus = await (new GpuRepository().find(chipset, year, month));
  const nameToDto: { [key: string]: GpuDto } = {};

  gpus.forEach((e) => {
    const dto = nameToDto[e.name];
    if (dto === undefined) {
      nameToDto[e.name] = {
        name: e.name,
        url: e.url,
        maker: e.maker.name,
        chipset: e.chipset,
        prices: new Array({
          price: e.price,
          date: e.createDateTime.format(Format)
        })
      };
      return;
    }

    dto.prices.push({
      price: e.price,
      date: e.createDateTime.format(Format)
    });
  });

  const gpuDtos = Object.entries(nameToDto)
    .map(([_, e]) => e);

  gpuDtos.forEach(e => {
    e.prices.sort((a, b) => {
      if (a.date < b.date) {
        return -1;
      } else if (a.date > b.date) {
        return 1;
      }

      return 0;
    });
  });

  return gpuDtos;
};

export type GpuDto = {
  readonly name: string;
  readonly url: string;
  readonly maker: string;
  readonly chipset: string;
  readonly prices: Price[];
}

type Price = {
  readonly date: string;
  readonly price: number;
}
