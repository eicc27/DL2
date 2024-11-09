import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "./utils/Constants.js";
import * as fs from "fs";
import { JSDOM } from "jsdom";
import AsyncPool from "@eicc27/async-pool";

export default class SotACrawler extends BaseCrawler {
  private static async getPapersWithTasks(task: string, limit = 10) {
    const response = await axios.get(
      `https://paperswithcode.com/task/${task}`,
      {
        headers: {
          "User-Agent": UA,
        },
      }
    );
    const jsDom = new JSDOM(response.data);
    const document = jsDom.window.document;
    const taskList = document.getElementById("task-papers-list");
    const titleList = taskList?.querySelectorAll("h1 > a")!;
    const ret: string[] = [];
    for (const title of titleList) {
      const href = title.getAttribute("href")!.slice("/paper/".length);
      ret.push(href);
      if (ret.length >= limit) break;
    }
    return ret;
  }

  public override async crawl(
    test = true,
    taskLimit = 5,
    paperLimit = 10,
    area?: string
  ): Promise<string[] | void> {
    const url = area
      ? "https://paperswithcode.com/area/" + area
      : "https://paperswithcode.com/sota";
    const response = await axios.get(url, {
      headers: {
        "User-Agent": UA,
      },
    });
    const data = response.data;
    if (test) {
      fs.writeFileSync("SotA.html", data);
      return;
    }
    const jsDom = new JSDOM(data);
    const crawledDocument = jsDom.window.document;
    const areaElement = crawledDocument.querySelectorAll(
      ".card-deck.card-break.infinite-item"
    );
    const fields: string[] = [];
    for (const elem of areaElement) {
      const fieldElements = elem.querySelectorAll("a");
      for (const fieldElement of fieldElements) {
        if (fields.length >= taskLimit) break;
        const field = fieldElement
          .getAttribute("href")
          ?.slice("/task/".length)!;
        console.log(field);
        fields.push(field);
      }
    }
    const paperIds: string[] = [];
    const pool = new AsyncPool(3, "eager");
    for (const field of fields) {
      await pool.submit(
        (f: string) =>
          SotACrawler.getPapersWithTasks(f, paperLimit).then((v) =>
            paperIds.push(...v)
          ),
        field
      );
    }
    await pool.close();
    console.log(`Got ${paperIds.length} papers`);
    return paperIds;
  }
}
