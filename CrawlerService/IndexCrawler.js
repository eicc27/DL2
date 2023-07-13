import axios from "axios";
import { JSDOM } from 'jsdom';


const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15",
};

export default class IndexCrawler {
    skip = 0;
    show = 0;

    constructor(skip, show) {
        this.skip = skip;
        this.show = show;
    }
    // async - await
    async crawl() {
        const response = await axios.get(`https://arxiv.org/list/cs.CV/pastweek?skip=${this.skip}&show=${this.show}`,
            {
                headers: HEADERS
            });
        const dom = response.data;
        const jsDom = new JSDOM(dom);
        const crawledDocument = jsDom.window.document;
        const indexElements = crawledDocument.querySelectorAll('dt span>a:first-child')
        let results = [];
        for (const elem of indexElements) {
            results.push(elem.getAttribute('href'));
        }
        const l = '/abs/'.length;
        results = results.map((result) => result.slice(l));
        return results;
    }
}