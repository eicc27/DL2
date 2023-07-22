import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    'Classification',
    'Conditional Image Generation',
    'Contrastive Learning',
    'Data Augmentation',
    'Domain Adaptation',
    'Domain Generalization',
    'General Classification',
    'Image Captioning',
    'Image Classification',
    'Image Generation',
    'Image Segmentation',
    'Instance Segmentation',
    'Language Modelling',
    'Linguistic Acceptability',
    'Machine Translation',
    'Natural Language Inference',
    'Natural Language Understanding',
    'NMT',
    'Object Detection',
    'Open-Domain Question Answering',
    'Question Answering',
    'Reading Comprehension',
    'Real-Time Object Detection',
    'Reinforcement Learning (RL)',
    'Representation Learning',
    'Retrieval',
    'Self-Supervised Image Classification',
    'Self-Supervised Learning',
    'Semantic Segmentation',
    'Semantic Textual Similarity',
    'Semi-Supervised Image Classification',
    'Sentiment Analysis',
    'Sentiment Classification',
    'Speech Recognition',
    'Text Classification',
    'Text Generation',
    'Thermal Image Segmentation',
    'Transfer Learning',
    'Translation',
    'Visual Question Answering (VQA)',
  ];
  taskSelected: boolean[] = [];
  filteredTasks: String[] = this.tasks;
  selectedTasks: String[] = [];
  private authorized = this.authService.isAuthenticated();
  public constructor(private authService: AuthService, private router: Router) {
    for (let i = 0; i < this.tasks.length; i++) {
      this.taskSelected.push(false);
    }
  }
  query: string = '';
  ngOnInit(): void {
    if (!this.authorized) {
      window.location.pathname = '/login';
    }
  }
  toggleSelection(task: String) {
    const index = this.tasks.indexOf(task);
    this.taskSelected[index] = !this.taskSelected[index];
    if (this.taskSelected[index]) {
      this.selectedTasks.push(this.tasks[index]);
    } else {
      this.selectedTasks.splice(
        this.selectedTasks.indexOf(this.tasks[index]),
        1
      );
    }
  }
  async submit() {
    await axios.post(ServerService.LoginServer + '/user/likedTasks', {
      jwt: localStorage.getItem('access_token'),
      taskIds: this.selectedTasks,
    });
    window.location.pathname = '/home';
  }
  filterTasks(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value == '') {
      this.filteredTasks = this.tasks;
      return;
    }
    this.filteredTasks = this.tasks.filter((task) =>
      task.toLowerCase().includes(value.toLowerCase())
    );
  }
}
