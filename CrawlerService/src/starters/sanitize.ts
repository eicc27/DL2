import * as fs from "fs";
import { Node, Edge } from "../types/Graph.js";
import chalk from "chalk";

/**
 * Sanitize the crawled data and creates node-edge citation graph.
 * The metadata of the graph is the field of the paper.
 * This function mathematically expects an
 * even-distributed graph considering the fields,
 * and will try to make the generated subgraph as diverse as possible.
 * As a result, the `alpha` specified is just an approximation.
 * @deprecated Now the service is handled by dedicated graph backends.
 * @param alpha The percentage of nodes needed.
 */
export function generateStaticGraph(alpha = 1) {
  const files = fs.readdirSync("data/");
  const fields: any = {};
  const papers: string[] = [];
  for (const file of files) {
    papers.push(file.slice(0, -5));
    const content = fs.readFileSync(`data/${file}`, "utf-8");
    const data = JSON.parse(content);
    const field = data.tasks.length ? data.tasks[0].name : "Unknown";
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
    const field = data.tasks.length ? data.tasks[0].name : "Unknown";
    field_counter[field]++;
    if (field_counter[field] >= cap) continue;
    if (field_counter[field] >= fields[field]) continue;
    nodes.push({
      id: data.id,
      title: data.name,
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
  return {
    nodes: nodes,
    edges: edges,
  };
}