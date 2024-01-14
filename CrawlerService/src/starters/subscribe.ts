import chalk from "chalk";
import AsyncPool from "@eicc27/async-pool";
import InverseCrawler from "../InverseCrawler.js";
import PaperCrawler from "../PaperCrawler.js";
import SubscriptionCrawler from "../SubscriptionCrawler.js";
import { Paper } from "../types/Paper.js";

export async function subscribe(fields = ["cs.LG", "cs.AI"]) {
  const response = {
    code: 200,
    message: "OK",
    papers: [] as Paper[],
  };
  for (const field of fields) {
    console.log(chalk.green(`Crawling ${field}`));
    const subscriptionCrawler = new SubscriptionCrawler(field);
    // arxiv ids retreived by subscription crawler
    const results: string[] = await subscriptionCrawler.crawl(false);
    const pool = new AsyncPool(10);
    const task = async (arxivId: string) => {
      const inverseCrawler = new InverseCrawler(arxivId);
      const pwcId = await inverseCrawler.crawl(false);
      const paper = await new PaperCrawler(pwcId).crawl(false);
      if (paper) response.papers.push(paper);
    };
    for (const result of results) {
      await pool.submit(task, result);
    }
    await pool.close();
  }
  return response;
}
