import { GpuSeller } from '@/types/GpuSeller';
import { SellerPageParser } from '@/parser/seller/SellerPageParser';
import { TsukumoSearchPageParser } from '@/parser/seller/TsukumoSearchPageParser';

export class SellerPageParserFactory {

  create(seller: string): SellerPageParser {
    switch (seller) {
      case GpuSeller.Tsukumo:
        return new TsukumoSearchPageParser();
      case GpuSeller.Dospara:
      case GpuSeller.Ark:
      default:
        throw new Error('not implemented yet');
    }
  }
}
