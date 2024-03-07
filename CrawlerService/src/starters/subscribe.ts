import chalk from "chalk";
import AsyncPool from "@eicc27/async-pool";
import InverseCrawler from "../InverseCrawler.js";
import PaperCrawler from "../PaperCrawler.js";
import SubscriptionCrawler from "../SubscriptionCrawler.js";
import { Method, Paper } from "../types/Paper.js";
import MethodCrawler from "../MethodCrawler.js";
import axios from "axios";
import { EXPORT_SERVER } from "../utils/Constants.js";

export async function subscribe(fields = ["cs.LG", "cs.AI"]) {
  const response = {
    code: 200,
    message: "OK",
    papers: [] as Paper[],
    methods: [] as Method[],
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
      if (!pwcId) return;
      console.log(pwcId);
      const paper = await new PaperCrawler(pwcId).crawl(false);
      if (paper) {
        response.papers.push(paper);
        await Promise.all(
          paper.methods.map(async (m) => {
            if (response.methods.filter((method) => method.id == m).length)
              return;
            const method = await new MethodCrawler(m).crawl(false);
            if (method) response.methods.push(method);
          })
        );
      }
    };
    for (const result of results) {
      await pool.submit(task, result);
    }
    await pool.close();
  }
  return response;
}

const papers = await subscribe();
await axios.post(`${EXPORT_SERVER}/papers`, papers);
