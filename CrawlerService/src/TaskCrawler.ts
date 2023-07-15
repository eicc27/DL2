import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { writeFileSync } from "fs";
import { Task } from "../types/Paper.js";
import { UA } from "../utils/Constants.js";

export default class TaskCrawler extends BaseCrawler {
  public constructor(private paper: string) {
    super();
  }

  public override async crawl(test: boolean): Promise<Task[] | void> {
    const response = await axios.get(
      `https://paperswithcode.com/api/v1/papers/${this.paper}/tasks/?format=json`, {
        headers: {
          "User-Agent": UA,
        },
      }
    );
    if (test) {
        writeFileSync('paper_tasks.json',response.data);
        return;
    }
    const results = response.data.results;
    return results.map((result: any) => {
        return {
            name: result.name,
            desc: result.description,
        }
    })
  }
}
