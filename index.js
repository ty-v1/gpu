const https = require('https');
const cheerio = require('cheerio');

exports.handler = async ({url}) => {
    const body = await getGpuPage(url);
    const $ = cheerio.load(body);
    const priceText = $('table.product-price-select__price-frame tr:first-child')
        .text()
        .replace(/[\s,¥]/g, '')
        .replace(/\(税[込抜]\)/, '');

    return {
        price: Number.parseInt(priceText),
        stock: !/在庫なし/.test($('.product-price-option__stock-number').text())
    };
    sdss
};

/**
 * @return Promise<string>
 */
const getGpuPage = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => resolve(data));

        }).on('error', (err) => reject(err));
    })
}
