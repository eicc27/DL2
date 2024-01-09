import SotACrawler from "../src/SotACrawler.js";
import PaperCrawler from "../src/PaperCrawler.js";
import chalk from "chalk";
import { writeFileSync } from "fs";
import AsyncPool from "../utils/AsyncPool.js";

export async function init() {
  // crawling HTML, HyperText Markdown Language
  // HTML -> DOM:
  // Axios GET -> HTML(string) -> JSDOM -> HTML(DOM) -> QuerySelector
  const sotACrawler = new SotACrawler();
  const pwcIds = await sotACrawler.crawl(false, 30, 10);
  console.log(chalk.green("SotA fields has been crawled!"));
  const crawl = async (id: string) => {
    const paper = await new PaperCrawler(id).crawl(false);
    writeFileSync(`./data/${paper.id}.json`, JSON.stringify(paper, null, '\t'));
  }
  const pool = new AsyncPool(10);
  for (const pwcId of pwcIds) {
    await pool.submit(crawl, pwcId);
  }
  console.log(chalk.green("Papers has been crawled!"));
}
