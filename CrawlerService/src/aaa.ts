import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "../utils/Constants.js";
import * as fs from 'fs';
import { JSDOM } from 'jsdom';

export default class citationsCrawler extends BaseCrawler {
    page: number;
    
    public constructor(page: number) {
        super();
        this.page = page;
    }
    public override async crawl(test = true): Promise<any> {
        const results = [];
        const response = await axios.get(`https://www.semanticscholar.org/paper/A-Survey-of-Large-Language-Models-Zhao-Zhou/1d29334cfbe9a1a943082058876f0c22d44c62fd?citedSort=relevance&citedPage=2`,
            {
                headers: {
                    'User-Agent': UA
                }
            });
            const data = response.data;//response.data 是一个表示 HTTP 响应数据的属性。它通常包含从服务器返回的实际数据。
            if(test) {
                fs.writeFileSync('aaa.html', data);
                return;
            }
            const jsDom = new JSDOM(data);
            const crawledDocument = jsDom.window.document;//// 获取 DOM 文档对象
            const citationsElement = crawledDocument.querySelectorAll('div.cl-paper-row.citation-list__paper-row.paper-v2-font-only');
                let counter = 0;
        for (const elem of citationsElement) {
            const titleElement = elem.querySelectorAll('h3');
            results.push({
                title: titleElement
            });
            //results.push(titleElements);
            counter++;
            if (counter >= 10)
                break;
        }
        return results;
    }
   
}