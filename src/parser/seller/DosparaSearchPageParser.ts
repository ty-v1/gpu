import cheerio from 'cheerio';
import { SellerPageParser } from '@/parser/seller/SellerPageParser';
import { CheerioAPI } from 'cheerio/lib/load';
import { fetchContent } from '@/util/fetchContent';
import { sleep } from '@/util/sleep';

export class DosparaSearchPageParser implements SellerPageParser {

  async* parse(url: string): AsyncGenerator<readonly string[]> {
    for await (const $ of this.fetchPages(url)) {
      yield $('.itemSearchTable tbody > tr> td.ttl > a')
        .toArray()
        .map((e) => `https://www.dospara.co.jp${e.attribs['href']}&lf=0`);
    }
  }

  async* fetchPages(baseUrl: string): AsyncGenerator<CheerioAPI> {

    for (let i = 1; ; i++) {
      const url = `${baseUrl}/?cate=bg1&br=31&sbr=1487&page=${i}`;
      const $ = cheerio.load(await fetchContent(url));

      yield $;

      if (this.isLastPage($)) {
        break;
      }

      await sleep(1000);
    }
  }

  private isLastPage($: CheerioAPI): boolean {
    return $('dl.pageNav > dd > ul > li.next > a').length === 0;
  }
}
