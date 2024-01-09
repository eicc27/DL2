import PaperCrawler from "./PaperCrawler.js";
import SubscriptionCrawler from "./SubscriptionCrawler.js";
import InverseCrawler from "./InverseCrawler.js";
import AsyncPool from "../utils/AsyncPool.js";
import chalk from "chalk";
import * as fs from 'fs';
import { SUBSCRIPTION_FIELDS } from "../utils/Constants.js";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { init } from '../starters/init.js';
import {generateStaticGraph} from '../starters/sanitize.js';

async function subscribe() {
  const response: any = {
    code: 200,
    message: "OK",
    papers: [],
  }
  for (const field of SUBSCRIPTION_FIELDS) {
    console.log(chalk.green(`Crawling ${field}`));
    const subscriptionCrawler = new SubscriptionCrawler(field);
    // arxiv ids retreived by subscription crawler
    const results: string[] = await subscriptionCrawler.crawl(false);
    const pool = new AsyncPool(10);
    const task = async (result: string) => {
      const inverseCrawler = new InverseCrawler(result);
      const pwcId = await inverseCrawler.crawl(false);
      const paper = new PaperCrawler(pwcId).crawl(false);
      console.log(result);
      fs.writeFileSync(`data/${result}.json`, JSON.stringify(paper, null, "\t"));
      response.papers.push(paper);
    };
    for (const result of results) {
      await pool.submit(task, result);
    }
    await pool.close();
  }
  return response;
}

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify(await subscribe()),
  };
};
await generateStaticGraph();
