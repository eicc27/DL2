import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { OnInit } from '@angular/core';
import * as d3 from 'd3';
import { GraphService, Node, Link } from 'src/app/graph.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private zoom = false;

  public constructor(titleService: Title, private graphService: GraphService) {
    titleService.setTitle('DL2 Home');
  }

  public showFn() {}

  public ngOnInit() {
    const svg = this.graphService.createRoot('main .right');
    const links = this.graphService.createLinks(svg);
    const nodes = this.graphService.createNodes(svg);
    const zoom = this.graphService.setZoom(svg, 0.5, 6);
    // when press ESC, zoom out
    d3.select('body').on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const svg = d3.select('main .right svg');
        const transform = d3.zoomIdentity
          .translate(0, 0)
          .scale(1)
          .translate(0, 0);
        svg
          .transition()
          .duration(200)
          .call(zoom.transform as any, transform);
      }
    });
    // svg.call(zoom);
    nodes.append('title').text((d: Node) => d.id);
    nodes.on('click', (event: MouseEvent) => {
      const target = event.target as SVGElement;
      const node = d3.select(target);
      // zoom in on node
      const transform = d3.zoomIdentity
        .translate(0, 0)
        .scale(3)
        .translate(
          -(node.datum() as any).x + this.graphService.Width / 2,
          -(node.datum() as any).y + this.graphService.Height / 2
        );
      svg.transition().duration(200).call(zoom.transform, transform);
    });
    const simulation = this.graphService.Simulation;
    const ticked = this.graphService.setTicked(links, nodes);
    const dragstarted = this.graphService.DragStarted;
    const dragged = this.graphService.Dragged;
    const dragended = this.graphService.DragEnded;
    simulation.on('tick', ticked);
    nodes.call(
      (d3.drag() as any)
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );
  }
}
