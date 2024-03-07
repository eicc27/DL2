import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Graph, getGraph } from './static-graph.model';

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  field: string;
  title: string;
  citations: number;
}

export interface Link {
  source: string | Node;
  target: string | Node;
}

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  private width = 800;
  private height = 600;

  private nodes: Node[] = [];

  private links: Link[] = [];

  // create a force simulation
  private simulation!: d3.Simulation<Node, Link>;

  // color scheme for the nodes
  private color = d3.scaleOrdinal(d3.schemeCategory10);

  private graph!: Graph;

  // drag events
  private dragStarted = (
    event: d3.D3DragEvent<SVGCircleElement, Node, Node>
  ) => {
    if (!event.active) this.simulation.alphaTarget(0.4).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  };

  private dragged = (event: d3.D3DragEvent<SVGCircleElement, Node, Node>) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  };

  private dragEnded = (event: d3.D3DragEvent<SVGCircleElement, Node, Node>) => {
    if (!event.active) this.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  };

  constructor() {}

  async getGraph() {
    let that = this;
    const setGraph = async () => {
      that.graph = await getGraph();
      // cache the graph into local storage
      localStorage.setItem(
        'graph',
        JSON.stringify({
          graph: that.graph,
          date: new Date(),
        })
      );
    };
    try {
      const graph = localStorage.getItem('graph');
      if (graph && JSON.parse(graph).graph) {
        const { graph: g, date } = JSON.parse(graph);
        // cache the graph for 1 day
        if (
          new Date(date).getTime() + 24 * 60 * 60 * 1000 >
          new Date().getTime()
        )
          this.graph = g;
        else await setGraph();
      } else await setGraph();
    } catch (_) {
      // needs to be caught
      this.graph;
    }
    this.nodes = this.graph.nodes;
    this.links = this.graph.edges;
  }

  init(width: number, height: number) {
    this.width = width;
    this.height = height;
    const radius = Math.min(this.width, this.height) / 2;
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink(this.links)
          .id((d: d3.SimulationNodeDatum) => (d as Node).id)
      )
      .force('charge', d3.forceManyBody())
      .force('collide', d3.forceCollide(radius / this.graph.nodes.length))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));
  }

  get Nodes() {
    return this.nodes;
  }

  get Links() {
    return this.links;
  }

  get Simulation() {
    return this.simulation;
  }

  get Color() {
    return this.color;
  }

  get Width() {
    return this.width;
  }

  get Height() {
    return this.height;
  }

  get DragStarted() {
    return this.dragStarted;
  }

  get Dragged() {
    return this.dragged;
  }

  get DragEnded() {
    return this.dragEnded;
  }

  public createRoot(cssSelector: string) {
    return d3
      .select(cssSelector)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height])
      .attr('style', 'max-width: 100%; height: auto;');
  }

  public createLinks(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>
  ) {
    return (
      svg
        .append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.2)
        .selectAll()
        .data(this.links)
        .join('line')
        // TODO: change this dynamically to the view numbers added by both nodes
        .attr('stroke-width', 1)
    );
  }

  public createNodes(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>,
    link: d3.Selection<SVGLineElement | null, Link, SVGGElement, unknown>
  ) {
    const nodeRadiusRange = d3
      .scaleLinear()
      .domain(d3.extent(this.nodes, (d) => d.citations) as [number, number])
      .range([5, 10]);
    const nodes = svg
      .append('g')
      .attr('stroke', '#fff')
      // TODO: change this dynamically to the view numbers added by nodes
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.3)
      .selectAll()
      .data(this.nodes)
      .join('circle')
      .attr('r', (d) => nodeRadiusRange(d.citations) || 5)
      .attr('fill', (d) => this.color(d.field))
      .attr('fill-opacity', 0.3)
      // on hover: cursor changes to pointer
      .attr('cursor', 'pointer');
    nodes
      .on('mouseenter', function (e, d) {
        link
          .transition()
          .duration(300)
          .filter((l) => l.source === d || l.target === d)
          .attr('stroke-opacity', 0.7)
          .attr('stroke', 'royalblue');
        const r = +d3.select(this).attr('r');
        d3.select(this)
          .transition()
          .duration(300)
          .attr('fill-opacity', 0.8)
          .attr('r', r * 1.2)
          .attr('stoke-opacity', 0.8);
      })
      .on('mouseleave', function (e, d) {
        link
          .transition()
          .duration(300)
          .filter((l) => l.source === d || l.target === d)
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.2);
        const r = +d3.select(this).attr('r');
        d3.select(this)
          .transition()
          .duration(300)
          .attr('fill-opacity', 0.3)
          .attr('r', r / 1.2)
          .attr('stoke-opacity', 0.3);
      });
    return nodes;
  }

  public setTicked(
    link: d3.Selection<SVGLineElement | null, any, any, any>,
    node: d3.Selection<SVGCircleElement | null, any, any, any>
  ) {
    return () => {
      link
        .attr('x1', (d: any) => (d.source as Node).x!)
        .attr('y1', (d: any) => (d.source as Node).y!)
        .attr('x2', (d: any) => (d.target as Node).x!)
        .attr('y2', (d: any) => (d.target as Node).y!);
      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    };
  }

  public setZoom(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>,
    min = 0.1,
    max = 4
  ) {
    return d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([min, max])
      .on('zoom', (event) => {
        svg.attr('transform', event.transform);
      });
  }
}
