import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "../utils/Constants.js";

export default class PAGECrawler extends BaseCrawler {
    public page: number;
    public constructor(page: number) {
        super();
        this.page = page;
    }
    public override async crawl(test = true): Promise<any> {
        const url = `https://www.semanticscholar.org/paper/A-Survey-of-Large-Language-Models-Zhao-Zhou/1d29334cfbe9a1a943082058876f0c22d44c62fd?citedSort=relevance&citedPage=${this.page}`;
        const response =
            await axios.get(url, {
                headers: {
                    "User-Agent": UA,
                }
            });
    }
}