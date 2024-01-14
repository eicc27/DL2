import axios from "axios";
import { writeFileSync } from "fs";
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "./utils/Constants.js";
import { XMLParser } from "fast-xml-parser";

/**
 * Get the date of (date - delta)
 * @param delta - days before
 * @returns the day and the next day in the format of ['yyyymmdd', 'yyyymmdd']
 */
function getDate(delta = 365) {
  const date = new Date();
  date.setDate(date.getDate() - delta);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() - delta + 1);
  const nextYear = nextDate.getFullYear();
  const nextMonth = nextDate.getMonth() + 1;
  const nextDay = nextDate.getDate();
  return [
    `${year}${month.toString().padStart(2, "0")}${day
      .toString()
      .padStart(2, "0")}`,
    `${nextYear}${nextMonth.toString().padStart(2, "0")}${nextDay
      .toString()
      .padStart(2, "0")}`,
  ];
}

/**
 * Unlike the initital data construction, subscription depends on Arxiv, and
 * data source starts from arxiv. This crawler fetches the latest papers yesterday,
 * returns the arxivId, and hands the task to CRCrawler(for cites and refs) and
 * InverseCrawler(for inversing arxivId into PWCId)
 */
export default class SubscriptionCrawler extends BaseCrawler {
  public constructor(private field: string) {
    super();
  }

  public override async crawl(test: boolean, dateBias: number = 365): Promise<any> {
    const [date, nextDate] = getDate(dateBias);
    const response = await axios.get(
      `https://export.arxiv.org/api/query?search_query=cat:${this.field}+AND+submittedDate:[${date}+TO+${nextDate}]&start=0&max_results=500`,
      {
        headers: {
          "User-Agent": UA,
        },
      }
    );
    if (test) {
      writeFileSync(`subscription_${this.field}.xml`, response.data);
      return;
    }
    const xmlData = response.data;
    const parser = new XMLParser();
    const json = parser.parse(xmlData);    
    const entries = json.feed.entry;
    if (!entries) return [];
    return entries.map((entry: any) => {
      const matches = Array.from(
        entry.id.matchAll(/http:\/\/arxiv.org\/abs\/(.*)v[0-9]{1}/g)
      ) as any[];
      return matches[0][1];
    });
  }
}
