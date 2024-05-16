import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { UA } from "./utils/Constants.js";

export default class CRCrawler extends BaseCrawler{
    private id: string;

    public constructor(id: string) {
        super();
        this.id = id;
    }

    public override async crawl(_=true) {
        const url = `https://api.semanticscholar.org/v1/paper/arXiv:${this.id}?include_unknown_references=true`;
        const response =
            await axios.get(url, {
                headers: {
                    "User-Agent": UA,
                },
            });
        const body = response.data;
        const refs: string[] = [];
        for (const ref of body.references) {
            if (ref.arxivId) {
                refs.push(ref.arxivId);
            }
        }
        return {
            citations: body.numCitedBy,
            references: body.numCiting,
            referencedPapers: refs
        }
    }
}