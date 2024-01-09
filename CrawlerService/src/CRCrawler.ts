import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "../utils/Constants.js";

export default class CRCrawler extends BaseCrawler{
    private id: string;

    public constructor(id: string) {
        super();
        this.id = id;
    }

    public override async crawl(_=true) {
        const url = `https://partner.semanticscholar.org/v1/paper/arXiv:${this.id}?include_unknown_references=true`;
        const response =
            await axios.get(url, {
                headers: {
                    "User-Agent": UA,
                }
            });
        const body = response.data;
        // url be like: https://www.semanticscholar.org/paper/455c7f7aeb6f24a096b49cd85edd9ed42daf5b4b
        const refs: string[] = [];
        for (const ref of body.references) {
            if (ref.arxivId) {
                refs.push(ref.arxivId);
            }
        }
        return {
            citations: body.citations.length,
            references: body.references.length,
            referencedPapers: refs
        }
    }
}