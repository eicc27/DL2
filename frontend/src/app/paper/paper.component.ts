import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss'],
})
export class PaperComponent implements OnInit {
  public id!: string;

  public constructor(private route: ActivatedRoute) {}

  public ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
    });
  }
}
