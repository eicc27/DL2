import AsyncPool from "../utils/AsyncPool.js";
import PaperCrawler from "./PaperCrawler.js";
import { FIELDS, PWCPAGES, SUBSCRIPTION_FIELDS } from "../utils/Constants.js";
import SotACrawler from "./SotACrawler.js";
import chalk from "chalk";
import IndexCrawler from "./IndexCrawler.js";
import { Node, Edge } from "../types/Graph.js";
import TaskCrawler from "./TaskCrawler.js";
import SubscriptionCrawler from "./SubscriptionCrawler.js";
import InverseCrawler from "./InverseCrawler.js";
import { writeFileSync } from "fs";
import * as fs from 'fs';

async function init() {
  // crawling HTML, HyperText Mardown Language
  // HTML -> DOM:
  // Axios GET -> HTML(string) -> JSDOM -> HTML(DOM) -> QuerySelector
  const sotACrawler = new SotACrawler();
  await sotACrawler.crawl(false);
  console.log(chalk.green("SotA fields has been crawled!"));
  const crawlIndex = async (index: string) => {
    const taskCrawler = new TaskCrawler(index.slice(7));
    const crawler = new PaperCrawler(index);
    const results = await Promise.all([
      crawler.crawl(false),
      taskCrawler.crawl(false),
    ]);
    const result = results[0] as any;
    const tasks = results[1] as any;
    result.tasks = tasks;
    writeFileSync(
      `data/${result.id}.json`,
      JSON.stringify(result, null, "\t")
    );
    console.log("Crawled: " + result.id);
  };
  const pool = new AsyncPool(10);
  // FIELDS have been initialized by SotACrawler
  for (const field of FIELDS) {
    for (let i = 1; i <= PWCPAGES; i++) {
      const indexCrawler = new IndexCrawler(field, i);
      const indexResult = (await indexCrawler.crawl(false))!;
      // the PWC identifier of papers: /paper/{paper}
      for (const index of indexResult) {
        await pool.submit(crawlIndex, index, field);
      }
    }
    console.log(chalk.green(`${field} has been crawled!`));
  }
  await pool.close();
}

/**
 * Sanitize the crawled data and creates node-edge citation graph.
 * The metadata of the graph is the field of the paper.
 * This function mathematically expects an
 * even-distributed graph considering the fields,
 * and will try to make the generated subgraph as diverse as possible.
 * As a result, the `alpha` specified is just an approximation.
 * @param alpha The percentage of nodes needed.
 */
function generateStaticGraph(alpha = 1) {
  const files = fs.readdirSync("data/");
  const fields: any = {};
  const papers: string[] = [];
  for (const file of files) {
    papers.push(file.slice(0, -5));
    const content = fs.readFileSync(`data/${file}`, "utf-8");
    const data = JSON.parse(content);
    const field = data.tasks.length ? data.tasks[0].name : 'Unknown';
    if (Object.keys(fields).includes(field)) {
      fields[field]++;
    } else {
      fields[field] = 1;
    }
  }
  let nodes: Node[] = [];
  const edges: Edge[] = [];
  const field_counter: any = {};
  for (const field in fields) {
    field_counter[field] = 0;
  }
  console.log(chalk.green(`Detected ${Object.keys(fields).length} fields.`));
  const cap = Math.ceil((papers.length / Object.keys(fields).length) * alpha);
  for (const paper of papers) {
    const file = fs.readFileSync(`data/${paper}.json`, "utf-8");
    const data = JSON.parse(file);
    const field = data.tasks.length ? data.tasks[0].name : 'Unknown';
    field_counter[field]++;
    if (field_counter[field] >= cap) continue;
    if (field_counter[field] >= fields[field]) continue;
    nodes.push({
      id: data.id,
      field: field,
    });
  }
  console.log(chalk.green(`Generated ${nodes.length} nodes.`));
  // purge the nodes that are not referenced by other nodes
  nodes = nodes.filter((node) => {
    const file = fs.readFileSync(`data/${node.id}.json`, "utf-8");
    const data = JSON.parse(file);
    return data.referencedPapers.length > 0;
  });
  const papersInNodes = nodes.map((node) => node.id);
  for (const node of nodes) {
    const id = node.id;
    const file = fs.readFileSync(`data/${id}.json`, "utf-8");
    const data = JSON.parse(file);
    for (const ref of data.referencedPapers) {
      if (papersInNodes.includes(ref))
        edges.push({
          source: id,
          target: ref,
        });
    }
  }
  // purge the nodes that are not referenced by other nodes, by edges
  nodes = nodes.filter((node) => {
    const id = node.id;
    return edges.some((edge) => edge.source === id || edge.target === id);
  });
  fs.writeFileSync(
    "graph.json",
    JSON.stringify(
      {
        nodes: nodes,
        edges: edges,
      },
      null,
      "\t"
    )
  );
}

async function subscribe() {
  for (const field of SUBSCRIPTION_FIELDS) {
    console.log(chalk.green(`Crawling ${field}`));
    const subscriptionCrawler = new SubscriptionCrawler(field);
    // arxiv ids retreived by subscription crawler
    const results: string[] = await subscriptionCrawler.crawl(false);
    const pool = new AsyncPool(10);
    const task = async (result: string) => {
      const inverseCrawler = new InverseCrawler(result);
      const pwcId = await inverseCrawler.crawl(false);
      const paperCrawler = new PaperCrawler("/paper/" + pwcId);
      const taskCrawler = new TaskCrawler(pwcId);
      const results = await Promise.all([
        paperCrawler.crawl(false),
        taskCrawler.crawl(false),
      ]);
      const paper = results[0] as any;
      const tasks = results[1]!;
      paper.tasks = tasks;
      writeFileSync(`data/${result}.json`, JSON.stringify(paper, null, "\t"));
    };
    for (const result of results) {
      await pool.submit(task, result);
    }
    await pool.close();
  }
}

function sanitize() {
  let papers = fs.readdirSync("data/");
  papers = papers.filter((paper) => paper.endsWith(".json"));
  papers = papers.map((paper) => paper.slice(0, -5));
  for (const paper of papers) {
    const fileName = `data/${paper}.json`;
    const file = fs.readFileSync(fileName, "utf-8");
    const data = JSON.parse(file);
    const sanitizedRefs: string[] = [];
    for (const ref in data.referencedPapers) {
      if (papers.includes(ref)) {
        sanitizedRefs.push(ref);
      }
    }
    data.referencedPapers = sanitizedRefs;
    writeFileSync(fileName, JSON.stringify(data, null, "\t"));
  }
}
// await init();
// await subscribe();
// generateStaticGraph(.3);
// sanitize();
