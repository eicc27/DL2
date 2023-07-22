import SotACrawler from "../src/SotACrawler.js";
import IndexCrawler from "../src/IndexCrawler.js";
import PaperCrawler from "../src/PaperCrawler.js";
import TaskCrawler from "../src/TaskCrawler.js";
import chalk from "chalk";
import { writeFileSync } from "fs";
import AsyncPool from "../utils/AsyncPool.js";
import { FIELDS, PWCPAGES } from "../utils/Constants.js";

export async function init() {
  // crawling HTML, HyperText Markdown Language
  // HTML -> DOM:
  // Axios GET -> HTML(string) -> JSDOM -> HTML(DOM) -> QuerySelector
  const sotACrawler = new SotACrawler();
  await sotACrawler.crawl(false);
  console.log(chalk.green("SotA fields has been crawled!"));
  const crawlIndex = async (index: string) => {
    const taskCrawler = new TaskCrawler(index.slice(7));
    const crawler = new PaperCrawler(index);
    const results = await Promise.all([
      crawler.crawl(false),
      taskCrawler.crawl(false),
    ]);
    const result = results[0] as any;
    const tasks = results[1] as any;
    result.tasks = tasks;
    writeFileSync(`data/${result.id}.json`, JSON.stringify(result, null, "\t"));
    console.log("Crawled: " + result.id);
  };
  const pool = new AsyncPool(10);
  // FIELDS have been initialized by SotACrawler
  for (const field of FIELDS) {
    for (let i = 1; i <= PWCPAGES; i++) {
      const indexCrawler = new IndexCrawler(field, i);
      const indexResult = (await indexCrawler.crawl(false))!;
      // the PWC identifier of papers: /paper/{paper}
      for (const index of indexResult) {
        await pool.submit(crawlIndex, index, field);
      }
    }
    console.log(chalk.green(`${field} has been crawled!`));
  }
  await pool.close();
}
