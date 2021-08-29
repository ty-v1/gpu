import { GpuPageParser } from './GpuPageParser';
import { TsukumoPageParser } from './TsukumoPageParser';
import { GpuSeller } from '@/types/GpuSeller';
import { DosparaPageParser } from '@/parser/gpu/DosparaPageParser';

export class GpuPageParserFactory {

  create(seller: string): GpuPageParser {
    switch (seller) {
      case GpuSeller.Tsukumo:
        return new TsukumoPageParser();
      case GpuSeller.Dospara:
        return new DosparaPageParser();
      case GpuSeller.Ark:
      default:
        throw new Error('not implemented yet');
    }
  }
}
