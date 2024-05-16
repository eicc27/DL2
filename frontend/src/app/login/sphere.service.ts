import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root',
})
export class SphereService {
  animation: number | undefined;

  constructor() {}

  render() {
    if (this.animation) cancelAnimationFrame(this.animation);
    const canvasElement = document.querySelector('canvas')!;
    const context = canvasElement.getContext('2d')!;
    const width = window.innerWidth,
      height = window.innerHeight;

    const projection = d3
      .geoOrthographic()
      .scale(250)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    d3.select('canvas').attr('width', width).attr('height', height);
    const graph = localStorage.getItem('graph');
    if (!graph)
      return;
    const { graph: g, date } = JSON.parse(graph);
    // Mapping node IDs to node objects for easier lookup
    const nodes = g.nodes;
    const edges = g.edges;
    for (const d of nodes) {
      d.lon = Math.random() * 360 - 180;
      d.lat = Math.random() * 180 - 90;
      d.projected = projection([d.lon, d.lat]);
    }
    const nodeById: any = {};
    for (const node of nodes) {
      nodeById[node.id] = node;
    }
    let rotation = 0;
    const draw = () => {
      // Clear the canvas
      context!.clearRect(0, 0, width, height);
      // Update the projection's rotation
      projection.rotate([rotation, 0]);
      // The nodes
      context.fillStyle = 'rgba(65, 105, 225, 0.25)'; // royalblue
      nodes.forEach(function (d: any) {
        var point = projection.rotate([new Date().getTime() * 0.01, -30])([
          d.lon,
          d.lat,
        ])!; // rotate
        context.beginPath();
        context.arc(point[0], point[1], 2, 0, 2 * Math.PI); // smaller nodes
        context.fill();
      });
      // The edges
      context.lineWidth = 1;
      context.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      for (const e of edges) {
        const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
        const targetId = typeof e.target === 'object' ? e.target.id : e.target;
        var nodeA = nodeById[sourceId] as any;
        var nodeB = nodeById[targetId] as any;
        // if (!nodeA || !nodeB) return;
        context.beginPath();
        context.moveTo(
          projection.rotate([new Date().getTime() * 0.01, -30])([
            nodeA.lon,
            nodeA.lat,
          ])![0],
          projection.rotate([new Date().getTime() * 0.01, -30])([
            nodeA.lon,
            nodeA.lat,
          ])![1]
        );
        context.lineTo(
          projection.rotate([new Date().getTime() * 0.01, -30])([
            nodeB.lon,
            nodeB.lat,
          ])![0],
          projection.rotate([new Date().getTime() * 0.01, -30])([
            nodeB.lon,
            nodeB.lat,
          ])![1]
        );
        context.stroke();
      }
      // Redraw in the next frame
      this.animation = requestAnimationFrame(draw);
      // console.log('draw');
    };
    // Start drawing
    draw();
  }
}
