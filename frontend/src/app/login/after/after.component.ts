import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ServerService } from 'src/app/server.service';
import axios from 'axios';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

/** @title Checkboxes with reactive forms */
@Component({
  selector: 'app-after',
  templateUrl: './after.component.html',
  styleUrls: ['./after.component.scss'],
})
export class AfterComponent {
  
  tasks: String[] = [
"Classification",
"Conditional Image Generation",
"Contrastive Learning",
"Data Augmentation",
"Domain Adaptation",
"Domain Generalization",
"General Classification",
"Image Captioning",
"Image Classification",
"Image Generation",
"Image Segmentation",
"Instance Segmentation",
"Language Modelling",
"Linguistic Acceptability",
"Machine Translation",
"Natural Language Inference",
"Natural Language Understanding",
"NMT",
"Object Detection",
"Open-Domain Question Answering",
"Question Answering",
"Reading Comprehension",
"Real-Time Object Detection",
"Reinforcement Learning (RL)",
"Representation Learning",
"Retrieval",
"Self-Supervised Image Classification",
"Self-Supervised Learning",
"Semantic Segmentation",
"Semantic Textual Similarity",
"Semi-Supervised Image Classification",
"Sentiment Analysis",
"Sentiment Classification",
"Speech Recognition",
"Text Classification",
"Text Generation",
"Thermal Image Segmentation",
"Transfer Learning",
"Translation",
"Visual Question Answering (VQA)",
  ]
  selectedTasks: String[] = [];
  private authorized = this.authService.isAuthenticated();
  public constructor(private authService: AuthService, private router: Router) {}
  query: string = '';
  ngOnInit(): void {
  }
  getFilteredTasks() {
    return this.tasks.filter(
      task => task.toLowerCase().includes(this.query.toLowerCase())
    );
  }
  selectTask(task: String){
    this.selectedTasks.push(task);
  }
  async submit() {
    await axios.post(
      ServerService.LoginServer + '/user/likedTasks',
      {
        jwt: localStorage.getItem('access_token'),
        tasks: this.selectedTasks,
      }
    );
  }
  navigate(){
    this.router.navigate(['/home']);
  }
}
