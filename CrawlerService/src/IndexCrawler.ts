import axios from "axios";//Axios 是一个基于 promise 的 HTTP 库，简单的讲就是可以发送get、post请求。
import { JSDOM } from 'jsdom';
import * as fs from 'fs';//引入文件系统模块
import { UA } from "../utils/Constants.js";


export default class IndexCrawler {
    //taskName: string;
    page: number;

    constructor(page:number=0) {
        //this.taskName = taskName;
        this.page = page;
    }
    // async - await
    async crawl(test=true) {
       //const response = await axios.get(`https://paperswithcode.com/task/${this.taskName}?page=${this.page}&q=`,
       const response = await axios.get(`https://www.semanticscholar.org/paper/A-Survey-of-Large-Language-Models-Zhao-Zhou/1d29334cfbe9a1a943082058876f0c22d44c62fd?citedSort=relevance&citedPage=${this.page}`,
            {
                headers: {
                    'User-Agent': UA
                }
            });
        const dom = response.data;
        if (test) {
            fs.writeFileSync('index.html', dom);
            return;
        }
        const jsDom = new JSDOM(dom);
        const crawledDocument = jsDom.window.document;
        //const paperIndexElements =  crawledDocument.querySelectorAll('div.paper-card.infinite-item h1 a');
        const citationsElements = crawledDocument.querySelectorAll('.cl-paper-row.citation-list__paper-row.paper-v2-font-only a');
        const results: string[] = [];
        for (const elem of citationsElements) {
            results.push(elem.getAttribute('href')!);
        }
        return results;
    }
}



// 这段代码是一个使用axios和jsdom库进行网页爬取的功能。主要包括以下几个部分：

// 引入了axios、JSDOM、fs、UA等模块。
// 定义了一个IndexCrawler类，有taskName和page两个属性。构造函数可以接收taskName和page参数，并将其赋值给对应的属性。
// crawl方法使用async/await语法，发送GET请求获取网页内容，然后使用JSDOM将获取到的内容解析为DOM对象。
// 如果test参数为true，则将获取到的网页内容保存到index.html文件中并返回。
// 如果test参数为false，则从解析后的DOM对象中提取出目标元素，并将其 href 属性值存入结果数组中。
// 最后返回结果数组。
// 需要注意的是，这段代码是 JavaScript/TypeScript 代码，并非 Python 代码，无法在Python环境中直接运行。
// 如果您希望在Python中执行网页爬取，建议使用Python相关的库，如Requests和BeautifulSoup等。