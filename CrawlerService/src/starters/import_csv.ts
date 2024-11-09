import { readFileSync } from "fs";
import InverseCrawler from "../InverseCrawler.js";
import AsyncPool from "@eicc27/async-pool";
import { EXPORT_SERVER, timeout } from "../utils/Constants.js";
import { Method, Paper } from "../types/Paper.js";
import PaperCrawler from "../PaperCrawler.js";
import MethodCrawler from "../MethodCrawler.js";
import chalk from "chalk";
import axios from "axios";

const response = {
  code: 200,
  message: "OK",
  papers: [] as Paper[],
  methods: [] as Method[],
};
const [start, limit] = process.argv.slice(2).map(Number);
console.log(start, limit);
const arxivIds = Array.from(
  new Set(
    readFileSync("export.csv", "utf-8")
      .split("\n")
      .slice(1)
      .slice(start, start + limit)
      .filter((line) => line.length)
  )
);
console.log(arxivIds.length);
const pwcIds = [] as string[];
let pool = new AsyncPool(3);
for (const arxivId of arxivIds) {
  await pool.submit(async (arxivId: string) => {
    const crawler = new InverseCrawler(arxivId);
    const pwcId = await crawler.crawl(false);
    console.log(pwcId);
    pwcIds.push(pwcId!);
  }, arxivId);
}
await pool.close();
// an atomic transaction
const crawl = async (id: string) => {
  await timeout(1000 * 5); // make the request sparse to avoid 429
  console.log(id);
  const ret: any[] = [];
  const methods: Method[] = [];
  if (response.papers.filter((p) => p.id == id).length) return;
  try {
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
  } catch (e) {
    console.log("Error occurred, skip this paper");
  }
  return ret;
};
pool = new AsyncPool(3, "eager");
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
    await pool.submit(task, pwcId);
  } catch (e) {
    continue;
  }
}
await pool.close();
console.log(chalk.green("Papers has been crawled!"));
console.log(response.papers.length);
await axios.post(`${EXPORT_SERVER}/papers`, response);
