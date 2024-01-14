# Crawler Service

This service features a pipeline, using public APIs from ArXiv and PapersWithCode to connect a citation graph for papers.

## Pipeline details

The guideline is given an entry, we get a list of featured papers(centrally stored with arxiv id as indexes).
However the data is not generated from void. There are two specified data entries:

1. From [SotA tab of PapersWithCode](https://paperswithcode.com/sota) there are various tasks.
2. From [temporal and domain-filtered daily subscription of ArXiv](https://arxiv.org/list/cs.AI/pastweek?skip=293&show=25).

Uses AsyncPool for granulated concurrency control. Has timeouts and rollbacks prepared for zero-trust endpoints.

### PWC specs

The entry is [`src/SotACrawler.ts`](./src/SotACrawler.ts). Given a task count limit, it first gets a list of tasks(typically, area ids viable in PWC) for further indexing, then fetches featured papers for each of the task. It fetches data from https://paperswithcode.com/sota.

It is normally used for data initialization i.e. the initial build of graph dataset.

### ArXiV specs

The entry is [`src/SubscriptionCrawler.ts`](./src/SubscriptionCrawler.ts). Given a time bias (new papers do not have much data, so normally a bit older data is welcomed), it fetches papers filtered from ArXiv, and returns ArXiv paper ids.

It is used for cron jobs for cumulative updates of the graph.

### Generic steps for papers

The metadata of papers are:

1. methods
2. tasks
3. citations and references

1 and 2 are usually stored in PWC, so if necessary, arxiv ids are transformed into PWC ids with [`src/InverseCrawler.ts`](./src/InverseCrawler.ts).
Then, the [methods](./src/MethodCrawler.ts) used and [tasks](./src/TaskCrawler.ts) specified in the paper should be fetched. 3 is provided by ArXiv with the support of [SemanticScholar](https://www.semanticscholar.org/).

### Tested rates

~430 entities for 15 minutes
