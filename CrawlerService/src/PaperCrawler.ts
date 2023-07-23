import axios from "axios";
import * as fs from "fs";
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "../utils/Constants.js";
import { Metadata, Method } from "../types/Paper.js";
import CRCrawler from "./CRCrawler.js";
import AsyncPool from "../utils/AsyncPool.js";
import MethodCrawler from "./MethodCrawler.js";


export default class PaperCrawler extends BaseCrawler {
  private url: string;
  private methodsUrl: string;
  private reposUrl: string;

  /**
   * 
   * @param url The url of the paper, e.g. semantic-segmentation...
   */
  public constructor(url: string) {
    super();
    const json = '/?format=json';
    this.url = "https://paperswithcode.com/api/v1/papers/" + url;
    this.methodsUrl = this.url + "/methods" + json;
    this.reposUrl = this.url + "/repositories" + json;
    this.url += json;
  }

  public static async getCitesAndRefs(id: string) {
    const crCrawler = new CRCrawler(id);
    return await crCrawler.crawl();
  }

  private async getMethods() {
    const response = await axios.get(this.methodsUrl, {
      headers: {
        "User-Agent": UA,
      },
    });
    return response.data.results.map((method: any) => method.id);
  }

  private async getRepo() {
    const response = await axios.get(this.reposUrl, {
      headers: {
        "User-Agent": UA,
      },
    });
    return response.data.results.map((repo: any) => {
      return {
        url: repo.url,
        rating: repo.stars,
      }
    });
  }

  public override async crawl(test = true): Promise<Metadata | undefined> {
    const response = await axios.get(this.url, {
      headers: {
        "User-Agent": UA,
      },
    });
    const data = response.data;
    const methods = await this.getMethods();
    const pool = new AsyncPool(5);
    const concreteMethods: Method[] = [];
    for (const method of methods) {
      await pool.submit(async (method: string) => {
        concreteMethods.push((await new MethodCrawler(method).crawl(false))!);
      }, method);
    }
    await pool.close();
    const citesAndRefs = await PaperCrawler.getCitesAndRefs(data.arxiv_id);
    return {
      name: data.title,
      abstract: data.abstract,
      id: data.arxiv_id,
      authors: data.authors,
      codes: await this.getRepo(),
      methods: concreteMethods,
      citations: citesAndRefs.citations,
      references: citesAndRefs.references,
      referencedPapers: citesAndRefs.referencedPapers,
    };
  }
}
