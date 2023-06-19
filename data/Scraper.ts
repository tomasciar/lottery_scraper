import { MongoClient } from 'mongodb';
import Balls from '../types/Balls';
import { CheerioCrawler, log } from 'crawlee';
import { Actor } from 'apify';

/**
 * @class Scraper
 */
export default class Scraper {
  client: MongoClient;

  constructor(client: MongoClient) {
    this.client = client;
  }

  /**
   * @function scrape
   */
  async scrape(): Promise<Array<Balls>> {
    const winningBalls: Array<Balls> = [];

    const crawler = new CheerioCrawler({
      minConcurrency: 1,
      maxConcurrency: 1,
      maxRequestRetries: 1,
      requestHandlerTimeoutSecs: 30,

      /**
       * @function requestHandler called for each URL to crawl
       * @param Object that has the following properties:
       * - request: an instance of the Request class
       * - $: the cheerio object containing parsed HTML
       */
      requestHandler: async ({ request, $ }) => {
        log.debug(`Processing ${request.url}...`);

        const tableRows = $('tbody').children().toArray();

        for (const row of tableRows) {
          if ($(row).hasClass('noBox')) continue;

          const balls: Balls = {
            drawDate: $(row).find('a').text(),
            results: $(row)
              .find('ul.balls')
              .children()
              .toArray()
              .map(ball => parseInt($(ball).text())),
            bonus: parseInt($(row).find('li.bonus-ball').text()),
            jackpot: parseInt($(row).find('td[data-title="Jackpot"]').text()),
            outcome: $(row).find('td[data-title="Outcome"]').text()
          };

          winningBalls.push(balls);
        }
      }
    });

    const startUrls: Array<string> = await this.getStartUrls();
    await crawler.run(startUrls);

    console.log(winningBalls);

    if (winningBalls.length > 0) await this.postData(winningBalls);
    return winningBalls;
  }

  /**
   * @function postMatches
   */
  async postData(items: Array<Balls>): Promise<void> {
    await this.client.db('lottery').collection('balls').insertMany(items);
  }

  /**
   * @function getStartUrls
   */
  async getStartUrls(): Promise<Array<string>> {
    const urls: Array<string> = [];
    for (let i = 1982; i < 2024; i++) {
      urls.push(`https://www.national-lottery.com/canada-6-49/results/${i}-archive`);
    }
    return urls;
  }
}
