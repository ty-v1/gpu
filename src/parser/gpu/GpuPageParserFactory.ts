import { GpuPageParser } from './GpuPageParser';
import { TsukumoPageParser } from './TsukumoPageParser';
import { GpuSeller } from '@/types/GpuSeller';

export class GpuPageParserFactory {

  create(seller: string): GpuPageParser {
    switch (seller) {
      case GpuSeller.Tsukumo:
        return new TsukumoPageParser();
      case GpuSeller.Dospara:
      case GpuSeller.Ark:
      default:
        throw new Error('not implemented yet');
    }
  }
}
