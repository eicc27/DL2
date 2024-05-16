import axios from 'axios';
import { ServerService } from './server.service';
import Response from 'src/response.model';
import Paper from './paper/paper.model';

type Node = {
  id: string,
  title: string,
  field: string,
  citations: number,
};

type Edge = {
  source: string,
  target: string,
}

export type Graph = {
  nodes: Node[],
  edges: Edge[],
}

export async function getGraph() {
  const resp = await axios.get(`${ServerService.N4JServer}/paper/homepage`);
  const data = resp.data as Response<
    {
      source: string;
      target: string;
    }[]
  >;
  const graph = {
    nodes: [] as Node[],
    edges: [] as Edge[],
  };
  const nodeSet = new Set<string>();
  data.data.forEach((edge) => {
    nodeSet.add(edge.source);
    nodeSet.add(edge.target);
    graph.edges.push(edge);
  });
  const nodesResp = await axios.post(
    `${ServerService.UserServer}/paper/papers`,
    {
      arxivIds: Array.from(nodeSet),
    }
  );
  const nodes = nodesResp.data as Response<Paper[]>;
  nodes.data.forEach((node) =>
    graph.nodes.push({
      id: node.arxivId,
      title: node.title,
      citations: node.citations,
      field: node.tasks.taskName[0],
    })
  );
  console.log(graph);
  return graph;
}


