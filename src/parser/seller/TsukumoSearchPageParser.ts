import cheerio from 'cheerio';
import { SellerPageParser } from '@/parser/seller/SellerPageParser';
import { CheerioAPI } from 'cheerio/lib/load';
import { fetchContent } from '@/util/fetchContent';
import { sleep } from '@/util/sleep';

export class TsukumoSearchPageParser implements SellerPageParser {

  async* parse(url: string): AsyncGenerator<readonly string[]> {
    for await (const $ of this.fetchPages(url)) {
      yield $('.search-box__product-list')
        .find('.search-box__product-name > a.product-link')
        .toArray()
        .map((e) => e.attribs['href']);
    }
  }

  async* fetchPages(baseUrl: string): AsyncGenerator<CheerioAPI> {

    for (let i = 1; ; i++) {
      const url = `${baseUrl}/p${i}/?sort=publish_date%20desc`;
      const $ = cheerio.load(await fetchContent(url));

      yield $;

      if (this.isLastPage($)) {
        break;
      }

      await sleep(1000);
    }
  }

  private isLastPage($: CheerioAPI): boolean {
    return $('ul.search-default__number-pager:first').find('li > a:contains(">")')
      .length === 0
  }
}
