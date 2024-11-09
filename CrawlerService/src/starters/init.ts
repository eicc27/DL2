import SotACrawler from "../SotACrawler.js";
import PaperCrawler from "../PaperCrawler.js";
import chalk from "chalk";
import AsyncPool from "@eicc27/async-pool";
import { Method, Paper } from "../types/Paper.js";
import MethodCrawler from "../MethodCrawler.js";
import { EXPORT_SERVER, timeout } from "../utils/Constants.js";
import axios from "axios";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";

export async function retry(
  fn: (...args: any[]) => Promise<unknown>,
  times = 3,
  ...args: unknown[]
) {
  let error: any;
  for (let i = 0; i < times; i++) {
    try {
      return await fn(...args);
    } catch (e) {
      console.warn("Retry " + i + " times");
      error = e;
      // console.error(e);
    }
  }
  // throw error;
}

export async function init(taskLimit: number, paperLimit: number) {
  const response = {
    code: 200,
    message: "OK",
    papers: [] as Paper[],
    methods: [] as Method[],
  };
  const sotACrawler = new SotACrawler();
  console.log("Crawling SotA fields");
  const areas = [
    "computer-vision",
    "natural-language-processing",
    "medical",
    "miscellaneous",
    "methodology",
    "time-series",
    "graphs",
    "speech",
    "audio",
    "reasoning",
    "computer-code",
    "playing-games",
    "adversarial",
    "robots",
    "knowledge-base",
    "music",
  ];
  const pwcIds = [] as string[];
  for (const area of areas.splice(15, 1)) {
    console.log("Crawling " + area);
    pwcIds.push(
      ...((await sotACrawler.crawl(
        false,
        taskLimit,
        paperLimit,
        area
      )) as string[])
    );
  }
  // const pwcIds = await sotACrawler.crawl(false, taskLimit, paperLimit);
  console.log(chalk.green("SotA fields has been crawled!"));
  // an atomic transaction
  const crawl = async (id: string) => {
    await timeout(1000 * 5); // make the request sparse to avoid 429
    console.log(id);
    const ret: any[] = [];
    const methods: Method[] = [];
    if (response.papers.filter((p) => p.id == id).length) return;
    const paper = await new PaperCrawler(id).crawl(false);
    if (paper) {
      ret.push(paper);
      await Promise.all(
        paper.methods.map(async (m) => {
          if (response.methods.filter((method) => method.id == m).length)
            return;
          const method = await new MethodCrawler(m).crawl(false);
          if (method) methods.push(method);
        })
      );
    }
    ret.push(methods);
    return ret;
  };
  const pool = new AsyncPool(3, "eager");
  const task = async (id: string) =>
    await Promise.race([crawl(id), timeout(1000 * 60)]) // timeout after 1 min
      .then((ret: any) => {
        if (ret && ret.length == 2) {
          const [paper, methods] = ret;
          response.papers.push(paper);
          response.methods.push(...methods);
          console.log(response.papers.length);
        }
      }); // add a success handler
  for (const pwcId of pwcIds) {
    try {
      await pool.submit(retry, task, 3, pwcId);
    } catch (e) {
      continue;
    }
  }
  await pool.close();
  console.log(chalk.green("Papers has been crawled!"));
  console.log(response.papers.length);
  return response;
}

export function setProxy() {
  axios.defaults.httpAgent = new HttpProxyAgent("http://127.0.0.1:20171");
  axios.defaults.httpsAgent = new HttpsProxyAgent("http://127.0.0.1:20171");
}

export function unsetProxy() {
  axios.defaults.httpAgent = undefined;
  axios.defaults.httpsAgent = undefined;
}

// process.argv.forEach((val, index) => {
//   console.log(`${index}: ${val}`);
// });
// setProxy();
const [taskLimit, paperLimit] = process.argv.slice(2).map(parseInt);
const papers = await init(taskLimit, paperLimit);
unsetProxy();
await axios.post(`${EXPORT_SERVER}/papers`, papers);
