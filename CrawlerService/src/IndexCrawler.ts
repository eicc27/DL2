import axios from "axios";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import { UA } from "./utils/Constants.js";

export default class IndexCrawler {
  taskName: string;
  page: number;

  constructor(taskName: string, page: number = 0) {
    this.taskName = taskName;
    this.page = page;
  }
  // async - await
  async crawl(test = true) {
    const response = await axios.get(
      `https://paperswithcode.com/task/${this.taskName}?page=${this.page}&q=`,
      {
        headers: {
          "User-Agent": UA,
        },
      }
    );
    const dom = response.data;
    if (test) {
      fs.writeFileSync("index.html", dom);
      return;
    }
    const jsDom = new JSDOM(dom);
    const crawledDocument = jsDom.window.document;
    const paperIndexElements = crawledDocument.querySelectorAll(
      "div.paper-card.infinite-item h1 a"
    );
    const results: string[] = [];
    for (const elem of paperIndexElements) {
      results.push(elem.getAttribute("href")!);
    }
    return results;
  }
}
