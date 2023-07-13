import axios from "axios";
import IndexCrawler from "./IndexCrawler.js";
import * as fs from "fs";

// crawling HTML, HyperText Mardown Language
// HTML -> DOM:
// Axios GET -> HTML(string) -> JSDOM -> HTML(DOM) -> QuerySelector
const crawler = new IndexCrawler(25, 25);
const indexes = await crawler.crawl();

// crawling JSON, or JavaScript Object Notation


const getCitesAndRefs = async (id) => {
    const url = `https://partner.semanticscholar.org/v1/paper/arXiv:${id}?include_unknown_references=true`;
    const response =
        await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15",
            }
        });
    const body = response.data;
    return {
        citations: body.citations.length,
        references: body.references.length,
    }
};

const citesAndRefs = [];

for (const index of indexes) {
    try {
        const cr = await getCitesAndRefs(index);
        cr.index = index;
        citesAndRefs.push(cr);
    } catch(e) {
        citesAndRefs.push({
            index: index,
            citations: 0,
            references: 0
        });
    }
}

console.log(cr);