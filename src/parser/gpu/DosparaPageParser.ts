import { GpuPageParser } from '@/parser/gpu/GpuPageParser';
import { Gpu } from '@/model/gpu/Gpu';
import { CheerioAPI } from 'cheerio/lib/load';
import { Maker } from '@/types/Maker';
import { filterAsciiAndKuroutoSikou } from '@/util/filter';
import { Chipset, Chipsets } from '@/types/Chipset';
import cheerio from 'cheerio';
import { DataNode } from 'domhandler';
import { LocalDateTime } from 'js-joda';
import { fetchContent } from '@/util/fetchContent';

export class DosparaPageParser implements GpuPageParser {

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
    }
  }

  private getPrice($: CheerioAPI): number {
    const priceText = $('p.priceTxt > em > span.price')
      .text()
      .replace(/[^\d]/g, '');

    return Number.parseInt(priceText, 10);
  }

  private getMaker($: CheerioAPI): Maker {
    const makerName = $('#detailMain > p.productName > a')
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
    return $('#detailMain > p.productName').contents()
      .filter((_, e): e is DataNode => e instanceof DataNode)
      .toArray()
      .filter(({type}) => type === 'text')
      .map(e => e.data)
      .filter((e) => !/^\s+$/.test(e))
      .pop()
      ?.replace(/^\s+(.*)\s+$/, '$1') ?? 'Cannot find';
  }

  private getChipset($: CheerioAPI): Chipset {
    const chipsetName = $('#itemspec tr > td.detailMainCell:first')
      .text()
      .replace(/[\s]/g, '')
      .replace('NVIDIA', '')
      .replace('GeForce', '');

    const chipset = Chipsets.find(e => e === chipsetName);
    if (chipset === undefined) {
      throw new Error(`chipset '${chipsetName}' is not RTX30 series.`);
    }

    return chipset;
  }


}
