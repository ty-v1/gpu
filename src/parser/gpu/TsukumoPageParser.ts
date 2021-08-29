import { GpuPageParser } from './GpuPageParser';
import cheerio from 'cheerio';
import { Gpu } from '@/model/gpu/Gpu';
import { CheerioAPI } from 'cheerio/lib/load';
import { Maker } from '@/types/Maker';
import { Chipset, Chipsets } from '@/types/Chipset';
import { filterAsciiAndKuroutoSikou } from '@/util/filter';
import { LocalDateTime } from 'js-joda';
import { fetchContent } from '@/util/fetchContent';
import { GpuSeller } from '@/types/GpuSeller';

export class TsukumoPageParser implements GpuPageParser {
  async parse(url: string): Promise<Gpu> {
    const content = await fetchContent(url);
    const $ = cheerio.load(content);

    return {
      maker: this.getMaker($),
      price: this.getPrice($),
      chipset: this.getChipset($),
      name: this.getName($),
      createDateTime: LocalDateTime.now(),
      url,
      seller: GpuSeller.Tsukumo,
    }
  }

  private getPrice($: CheerioAPI): number {
    const priceText = $('table.product-price-select__price-frame tr:first-child')
      .text()
      .replace(/[\s,¥]/g, '')
      .replace(/\(税[込抜]\)/, '');

    return Number.parseInt(priceText, 10);
  }

  private getMaker($: CheerioAPI): Maker {
    const makerName = $('.main-contents__product-title > h1 > span:first')
      .text()
      .replace(/[\s]/g, '')
      .split('')
      .filter(filterAsciiAndKuroutoSikou)
      .join('');

    const maker = Object.entries(Maker)
      .map(([_, e]) => e)
      .find((e) => e.name === makerName)

    if (maker === undefined) {
      throw new Error(`${makerName} is not gpu maker`);
    }

    return maker
  }

  private getName($: CheerioAPI): string {
    return $('.main-contents__product-title > h1 > span:last').text();
  }

  private getChipset($: CheerioAPI): Chipset {
    const chipsetName = $('section.main-contents__spec-frame tr:first').children('td:last')
      .text()
      .replace(/[\s]/g, '')
      .replace('GeForce', '');

    const chipset = Chipsets.find(e => e === chipsetName);
    if (chipset === undefined) {
      throw new Error(`chipset '${chipsetName}' is not RTX30 series.`);
    }

    return chipset;
  }

}
