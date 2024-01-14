import SotACrawler from "../SotACrawler.js";
import PaperCrawler from "../PaperCrawler.js";
import chalk from "chalk";
import AsyncPool from "@eicc27/async-pool";
import { Method, Paper } from "../types/Paper.js";
import MethodCrawler from "../MethodCrawler.js";
import { SQL_EXPORT_SERVER, timeout } from "../utils/Constants.js";
import { sys } from "typescript";
import axios from "axios";



export async function init(taskLimit: number, paperLimit: number) {
  const response = {
    code: 200,
    message: "OK",
    papers: [] as Paper[],
    methods: [] as Method[],
  };
  const sotACrawler = new SotACrawler();
  console.log("Crawling SotA fields");
  const pwcIds = await sotACrawler.crawl(false, taskLimit, paperLimit);
  console.log(chalk.green("SotA fields has been crawled!"));
  // an atomic transaction
  const crawl = async (id: string) => {
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
  const pool = new AsyncPool(10, "eagar");
  for (const pwcId of pwcIds) {
    await pool.submit(
      async (id: string) =>
        await Promise.race([crawl(id), timeout(1000 * 60)]) // timeout after 1 min
          .then((ret: any) => {
            if (ret && ret.length == 2) {
              const [paper, methods] = ret;
              response.papers.push(paper);
              response.methods.push(...methods);
              console.log(response.papers.length);
            }
          }) // add a success handler
          .catch((reason) => console.warn(reason)), // add an error handler
      pwcId
    );
  }
  await pool.close();
  console.log(chalk.green("Papers has been crawled!"));
  console.log(response.papers.length);
  return response;
}

// process.argv.forEach((val, index) => {
//   console.log(`${index}: ${val}`);
// });
const [taskLimit, paperLimit] = process.argv.slice(2).map(parseInt);
const papers = await init(taskLimit, paperLimit);
await axios.post(`${SQL_EXPORT_SERVER}/papers`, papers);