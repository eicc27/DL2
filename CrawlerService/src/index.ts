import IndexCrawler from "./IndexCrawler.js";
import * as fs from "fs";
import AsyncPool from "../utils/AsyncPool.js";
import PaperCrawler from "./PaperCrawler.js";
import { FIELDS, PWCPAGES } from "../utils/Constants.js";
import SotACrawler from "./SotACrawler.js";
import chalk from "chalk";
import CitationsCrawler from "./CitationsCrawler.js";



async function main() {
    // crawling HTML, HyperText Mardown Language
    // HTML -> DOM:
    // Axios GET -> HTML(string) -> JSDOM -> HTML(DOM) -> QuerySelector
    const crawlIndex = async (index: string, field: string) => {
        const crawler = new PaperCrawler(index);
        const result = (await crawler.crawl(false))!;
        fs.writeFileSync(`data/${field}/${result.id}.json`, JSON.stringify(result, null, '\t'));
    }
    const pool = new AsyncPool(10);

    for (const field of FIELDS) {
        for (let i = 1; i <= PWCPAGES; i++) {
            const indexCrawler = new IndexCrawler(field, i);
            const indexResult = (await indexCrawler.crawl(false))!;
            for (const index of indexResult) {
                await pool.submit(crawlIndex, index, field);
            }
        }
        console.log(chalk.green(`${field} has been crawled!`));
    }
    await pool.close();
}

const sotACrawler = new SotACrawler();
await sotACrawler.crawl(false);
main();
for (const field of FIELDS) {
    try {
        fs.mkdirSync(`data/${field}`);
    } catch { }
}
