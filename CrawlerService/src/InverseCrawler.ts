import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "./utils/Constants.js";
import { writeFileSync } from "fs";

/**
 * This crawler inverses the arxivId into PWCId, using PWC API.
 * @param arxivId - arxivId of the paper
 */
export default class InverseCrawler extends BaseCrawler {
  public constructor(private arxivId: string) {
    super();
  }

  public override async crawl(test = true): Promise<string | undefined> {
    const response = await axios.get(
      `https://paperswithcode.com/api/v1/papers/?arxiv_id=${this.arxivId}`,
      {
        headers: {
          "User-Agent": UA,
        },
      }
    );
    const body = response.data;
    if (test) {
        writeFileSync('inverse.json', body);
    }
    const results = body.results;
    if (!results.length) {
        return;
    }
    return results[0].id;
  }
}
