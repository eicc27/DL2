import { Component, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { OnInit } from '@angular/core';
import * as d3 from 'd3';
import { GraphService, Node } from 'src/app/graph.service';
import { Router, RouterModule } from '@angular/router';
import Paper from 'src/app/paper/paper.model';
import axios from 'axios';
import { ServerService } from 'src/app/server.service';
import GenericResponse from 'src/app/GenericResponse.model';
import { NgFor } from '@angular/common';
import { TopbarComponent } from 'src/app/topbar/topbar.component';
import { PaperInfoComponent } from 'src/app/paper/paper-info/paper-info.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [NgFor, TopbarComponent, PaperInfoComponent, RouterModule],
    standalone: true,
})
export class HomeComponent implements OnInit {
  private zoomTarget: SVGElement | null = null;
  public papers: Paper[] = [];
  public methods: {
    name: string;
    numPapers: number;
  }[] = [];
  public tasks: {
    name: string;
    numPapers: number;
  }[] = [];
  @ViewChild('graphContainer') graphContainer!: ElementRef<HTMLDivElement>;

  public constructor(
    titleService: Title,
    private graphService: GraphService,
    private router: Router
  ) {
    titleService.setTitle('DL2 Home');
  }

  public async ngOnInit() {
    await Promise.all([
      this.graphService.getGraph(),
      this.getFeaturedPapers(),
      this.getFeaturedMethods(),
      this.getFeaturedTasks(),
    ]);
    // init the canvas with window size
    this.graphService.init(window.innerWidth, window.innerHeight);
    const svg = this.graphService.createRoot('.right');
    const links = this.graphService.createLinks(svg);
    const nodes = this.graphService.createNodes(svg, links);
    const zoom = this.graphService.setZoom(svg, 0.5, 6);
    const zoomOut = () => {
      const svg = d3.select('.right svg');
      const transform = d3.zoomIdentity
        .translate(0, 0)
        .scale(1)
        .translate(0, 0);
      svg
        .transition()
        .duration(200)
        .call(zoom.transform as any, transform);
      this.graphContainer.nativeElement.style.background = 'transparent';
      links.attr('stroke-opacity', 0.2).attr('stroke', '#999');
      nodes.attr('fill-opacity', 0.3).attr('stroke-opacity', 0.3);
      this.zoomTarget = null;
    };
    // when press ESC, zoom out
    d3.select('body').on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        zoomOut();
      }
    });
    window.addEventListener('scroll', zoomOut);
    d3.select('.title').on('scroll', zoomOut);
    // svg.call(zoom);
    nodes
      .append('title')
      .text((d: Node) => [d.id, d.title, d.field].join(`\n`));
    nodes.on('click', (event: MouseEvent) => {
      const target = event.target as SVGElement;
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
      nodes.attr('fill-opacity', 0.7).attr('stroke-opacity', 0.7);
      links.attr('stroke-opacity', 0.4).attr('stroke', '#fff');
      this.graphContainer.nativeElement.style.background = 'rgba(0, 0, 0, 0.3)';
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

  public ngOnDestroy() {
    // Remove the canvas when the component is destroyed
    let canvas = document.getElementById('myCanvas');
    if (canvas) canvas.remove();
  }

  public async getFeaturedPapers() {
    const resp = await axios.get(
      ServerService.UserServer + '/paper/featured/papers'
    );
    const data: GenericResponse<Paper[]> = resp.data;
    this.papers = data.data;
  }

  public async getFeaturedMethods() {
    const resp = await axios.get(
      ServerService.UserServer + '/paper/featured/methods'
    );
    const data: GenericResponse<
      { name: string; intro: string; numPapers: number }[]
    > = resp.data;
    this.methods = data.data.filter(m => m && m.intro.length);
    this.methods.sort((m1, m2) => m2.numPapers - m1.numPapers);
  }

  public async getFeaturedTasks() {
    const resp = await axios.get(
      ServerService.UserServer + '/paper/featured/tasks'
    );
    const data: GenericResponse<
      { name: string; intro: string; numPapers: number }[]
    > = resp.data;
    this.tasks = data.data.filter(t => t && t.intro.length);
    this.tasks.sort((t1, t2) => t2.numPapers - t1.numPapers);
  }

  public openPaper(id: string) {
    window.location.pathname = '/paper/' + id;
  }

  public openTask(task: string) {
    window.location.pathname = '/task/' + task;
  }

  public openMethod(method: string) {
    window.location.pathname = '/method/' + method;
  }
}
