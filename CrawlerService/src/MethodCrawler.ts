import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { Method } from "../types/Paper.js";

export default class MethodCrawler extends BaseCrawler {
  public constructor(private methodUrl: string) {
    super();
  }

  public override async crawl(test = true): Promise<Method | void> {
    const response = await axios.get(
      `https://paperswithcode.com/api/v1/methods/${this.methodUrl}/?format=json`
    );
    const data = response.data;
    if (test) {
      console.log(data);
      return;
    }
    return {
      method: data.name,
      desc: data.description,
    };
  }
}
