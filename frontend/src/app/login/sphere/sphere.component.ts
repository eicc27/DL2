import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { SphereService } from '../sphere.service';

@Component({
    selector: 'app-sphere',
    templateUrl: './sphere.component.html',
    styleUrls: ['./sphere.component.scss'],
    standalone: true,
})
export class SphereComponent implements OnDestroy {
  animation!: number;

  constructor(private sphereService: SphereService) {
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.sphereService.animation!);
  }
}
