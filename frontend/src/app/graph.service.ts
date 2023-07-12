import { Injectable } from '@angular/core';
import * as d3 from 'd3';

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
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

  private nodes: Node[] = [
    { id: 'DL', group: 0 },
    { id: 'CNN', group: 1 },
    { id: 'RNN', group: 1 },
    { id: 'LSTM', group: 1 },
    { id: 'GRU', group: 1 },
    { id: 'GAN', group: 1 },
    { id: 'AE', group: 1 },
    { id: 'VAE', group: 1 },
    { id: 'GCN', group: 1 },
    { id: 'GAT', group: 1 },
    { id: 'Att', group: 1 },
    { id: 'ResNet', group: 2 },
    { id: 'YOLO', group: 2 },
    { id: 'Trans', group: 2 },
    { id: 'BERT', group: 2 },
    { id: 'SRGAN', group: 3 },
    { id: 'WGAN', group: 3 },
    { id: 'DCGAN', group: 3 },
    { id: 'VGG', group: 2 },
    // Add more nodes as per your data...
  ];

  private links: Link[] = [
    { source: 'DL', target: 'CNN' },
    { source: 'DL', target: 'RNN' },
    { source: 'DL', target: 'LSTM' },
    { source: 'DL', target: 'GRU' },
    { source: 'DL', target: 'GAN' },
    { source: 'DL', target: 'AE' },
    { source: 'DL', target: 'VAE' },
    { source: 'DL', target: 'GCN' },
    { source: 'DL', target: 'GAT' },
    { source: 'DL', target: 'Att' },
    { source: 'CNN', target: 'ResNet' },
    { source: 'CNN', target: 'YOLO' },
    { source: 'CNN', target: 'VGG' },
    { source: 'Att', target: 'Trans' },
    { source: 'Att', target: 'BERT' },
    { source: 'GAN', target: 'SRGAN' },
    { source: 'GAN', target: 'WGAN' },
    { source: 'GAN', target: 'DCGAN' },
    { source: 'ResNet', target: 'SRGAN' },
    { source: 'VGG', target: 'SRGAN' },
    // Add more links as per your data...
  ];

  // create a force simulation
  private simulation: d3.Simulation<Node, Link>;

  // color scheme for the nodes
  private color = d3.scaleOrdinal(d3.schemeCategory10);

  // drag events
  private dragStarted = (
    event: d3.D3DragEvent<SVGCircleElement, Node, Node>
  ) => {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
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

  constructor() {
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink(this.links)
          .id((d: d3.SimulationNodeDatum) => (d as Node).id)
      )
      .force('charge', d3.forceManyBody())
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
        .attr('stroke-opacity', 0.6)
        .selectAll()
        .data(this.links)
        .join('line')
        // TODO: change this dynamically to the view numbers added by both nodes
        .attr('stroke-width', 1)
    );
  }

  public createNodes(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>
  ) {
    return (
      svg
        .append('g')
        .attr('stroke', '#fff')
        // TODO: change this dynamically to the view numbers added by nodes
        .attr('stroke-width', 1.5)
        .selectAll()
        .data(this.nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', (d) => this.color(d.group.toString()))
    );
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
