export interface SellerPageParser {
  parse(url: string): AsyncGenerator<readonly string[]>;
}
