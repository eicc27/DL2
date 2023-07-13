import axios from "axios";
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "../utils/Constants.js";
import { Metadata, Method } from "../types/Paper.js";
import CRCrawler from "./CRCrawler.js";

const ROOT = "https://paperswithcode.com";

/**
 * Crawls the paper with all metadata.
 * 
 * github code: 🪝, paper.json
 * 
 * author: 🪝, paper.json
 * 
 * title: 🪝, paper.json
 * 
 * paper methods: html
 */
export default class PaperCrawler extends BaseCrawler {

    private url: string;

    public constructor(url: string) {
        super();
        this.url = ROOT + url;
    }

    public static async getCitesAndRefs(id: string) {
        const crCrawler = new CRCrawler(id);
        return await crCrawler.crawl();
    }

    public override async crawl(test = true): Promise<Metadata | undefined> {
        const response = await axios.get(this.url, {
            headers: {
                'User-Agent': UA
            }
        });
        const dom = response.data;
        if (test) {
            fs.writeFileSync('index2.html', dom);
            return undefined;
        }
        const jsDom = new JSDOM(dom);
        const crawledDocument = jsDom.window.document;
        const scriptElement = crawledDocument.head.querySelector('script[type="application/ld+json"]');
        const metadata = JSON.parse(scriptElement!.innerHTML)['@graph'];
        let methods: Method[] = [];
        const methodsElement = crawledDocument.querySelectorAll('div.method-section a');
        for (const elem of methodsElement) {
            const url = elem.getAttribute('href')!;
            if (url == '#loginModal') {
                methods = [];
                break;
            }
            methods.push({
                method: elem.innerHTML.replaceAll('\n', '').replace(/^\s+/g, ''),
                url: url,
            });
        }
        const abstractElement = crawledDocument.querySelector('div.paper-abstract p');
        const id = metadata['@id'];
        const citesAndRefs = await PaperCrawler.getCitesAndRefs(id);
        return {
            name: metadata.name,
            abstract: abstractElement?.innerHTML!,
            id: id,
            authors: metadata.author.map((a: any) => {
                return {
                    id: a['@id'],
                    name: a.name,
                }
            }),
            codes: metadata.workExample.map((w: any) => {
                return {
                    url: w.url,
                    rating: parseInt(w.contentRating)
                }
            }),
            methods: methods,
            citations: citesAndRefs.citations,
            references: citesAndRefs.references,
            referencedPapers: citesAndRefs.referencedPapers,
        }
    }
}