import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { Method } from "./types/Paper.js";
import PaperCrawler from "./PaperCrawler.js";

export default class MethodCrawler extends BaseCrawler {
  public constructor(private methodUrl: string) {
    super();
  }

  public override async crawl(_ = true): Promise<Method | void> {
    const response = await axios.get(
      `https://paperswithcode.com/api/v1/methods/${this.methodUrl}`
    );
    const data = response.data;
    let arxivId: string | undefined;
    if (data.paper) {
      const paper = await new PaperCrawler(data.paper).crawl();
      if (!paper) return;
      arxivId = paper.id;
    }
    return {
      id: data.id,
      method: data.name,
      desc: data.description,
      arxivId,
    };
  }
}
