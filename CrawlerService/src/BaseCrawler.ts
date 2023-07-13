export default class BaseCrawler {
    public async crawl(test: boolean): Promise<any> {
        throw new Error('BaseCrawler not implemented. Please override this crawl function.')
    }
}