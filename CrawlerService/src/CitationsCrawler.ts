import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "../utils/Constants.js";
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
// import PAGECrawler from "./Page.js";

export default class CitationsCrawler extends BaseCrawler {

        let counter = 0;
        for (const elem of citationsElement) {
            results.push({
                title:titleElement,
            })

            counter++;
            if (counter >= 10)
                break;
        }

    }
}