import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { OnInit } from '@angular/core';
import * as d3 from 'd3';
import { GraphService, Node, Link } from 'src/app/graph.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private zoom = false;
  private zoomTarget: SVGElement | null = null;

  public constructor(
    titleService: Title,
    private graphService: GraphService,
    private router: Router,
  ) {
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
      this.zoom = true;
      if (this.zoomTarget == target) {
        //double click, goes to the paper page
        const node = d3.select(target);
        const id = (node.datum() as any).id;
        window.location.pathname = '/paper/' + id;
      }
      this.zoomTarget = target;
      const node = d3.select(target);
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

  ngOnDestroy() {
    // Remove the canvas when the component is destroyed
    let canvas = document.getElementById('myCanvas');
    if (canvas) canvas.remove();
  }
}
