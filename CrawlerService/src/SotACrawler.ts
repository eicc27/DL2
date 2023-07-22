import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { FIELDS, UA } from "../utils/Constants.js";
import * as fs from 'fs';
import { JSDOM } from "jsdom";


export default class SotACrawler extends BaseCrawler {
    public override async crawl(test = true): Promise<any> {
        const response = await axios.get('https://paperswithcode.com/sota', {
            headers: {
                "User-Agent": UA
            }
        });
        const data = response.data;
        if (test) {
            fs.writeFileSync('SotA.html', data);
            return;
        }
        const jsDom = new JSDOM(data);
        const crawledDocument = jsDom.window.document;
        const areaElement = crawledDocument.querySelectorAll('.card-deck.card-break.infinite-item');
        let counter = 0;
        for (const elem of areaElement) {
            const fieldElements = elem.querySelectorAll('a');
            for (const fieldElement of fieldElements) {
                const field = fieldElement.getAttribute('href')?.slice('/task/'.length)!;
                FIELDS.push(field);
            }
            
            counter++;
            if (counter >= 2)
                break;
        }

    }
}
