import { GpuSeller } from '@/types/GpuSeller';
import { SellerPageParser } from '@/parser/seller/SellerPageParser';
import { TsukumoSearchPageParser } from '@/parser/seller/TsukumoSearchPageParser';
import { DosparaSearchPageParser } from '@/parser/seller/DosparaSearchPageParser';

export class SellerPageParserFactory {

  create(seller: string): SellerPageParser {
    switch (seller) {
      case GpuSeller.Tsukumo:
        return new TsukumoSearchPageParser();
      case GpuSeller.Dospara:
        return new DosparaSearchPageParser();
      case GpuSeller.Ark:
      default:
        throw new Error('not implemented yet');
    }
  }
}
