import { Component, ElementRef, ViewChild } from '@angular/core';
import axios from 'axios';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { ServerService } from '../server.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../auth.service';
import { TopbarComponent } from '../topbar/topbar.component';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-upload-dataset',
  templateUrl: './upload-dataset.component.html',
  styleUrls: ['./upload-dataset.component.scss'],
  imports: [
    TopbarComponent,
    NgIf,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MarkdownModule,
    LoadingComponent,
  ],
  standalone: true,
})
export class UploadDatasetComponent {
  public nameError = false;
  public descError = false;
  public trainUploadError = false;
  public evalScriptError = false;
  public evalDataError = false;
  public markdownText = 'Your description here...';
  public uploading = false;
  @ViewChild('dtsName') dtsName!: ElementRef<HTMLInputElement>;
  @ViewChild('dtsTask') dtsTask!: ElementRef<HTMLInputElement>;
  @ViewChild('mdArea') markdownArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('dtsTrain') dtsTrain!: ElementRef<HTMLInputElement>;
  @ViewChild('evalScript') evalScript!: ElementRef<HTMLInputElement>;
  @ViewChild('evalData') evalData!: ElementRef<HTMLInputElement>;
  taskError: any;

  constructor(
    private markdownService: MarkdownService,
    private snackbarService: MatSnackBar,
    private authService: AuthService
  ) {}
  myControl = new FormControl<string>('');
  tasks: string[] = [
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
  filteredTasks!: Observable<string[]>;

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      window.location.pathname = '/login';
    }
    this.filteredTasks = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = value;
        return name ? this._filter(name as string) : this.tasks.slice();
      })
    );
  }
  displayFn(user: string): string {
    return user && user ? user : '';
  }

  private _filter(name: string): string[] {
    const filterValue = name.toLowerCase();

    return this.tasks.filter((task) =>
      task.toLowerCase().includes(filterValue)
    );
  }

  synchronize() {
    const text = this.markdownArea.nativeElement.value;
    this.markdownText = text;
    this.markdownService.reload();
  }

  fillLabel(event: Event) {
    const target = event.target! as HTMLInputElement;
    const id = target.id;
    switch (id) {
      case 'folderPicker1':
        this.trainUploadError =
          !this.dtsTrain.nativeElement.files ||
          !this.dtsTrain.nativeElement.files.length;
        break;
      case 'filePicker1':
        this.evalScriptError =
          !this.evalScript.nativeElement.files ||
          !this.evalScript.nativeElement.files.length;
        break;
      case 'folderPicker2':
        this.evalDataError =
          !this.evalData.nativeElement.files ||
          !this.evalData.nativeElement.files.length;
    }
    const forLabel = document.querySelector(`label[for="${id}"]`)!;
    const names = [];
    for (let i = 0; i < target.files!.length; i++) {
      names.push(target.files![i].name);
    }
    forLabel.innerHTML = names.length ? names.join('; ') : 'Upload...';
  }

  nameValid(filename: string) {
    if (filename.length > 30 || filename.length <= 0) return false;
    // Invalid characters
    const invalidChars = /[\\/:\*\?"<>\|]/g;
    if (invalidChars.test(filename)) {
      return false;
    }
    // Reserved words
    const reservedWords = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
    if (reservedWords.test(filename)) {
      return false;
    }
    // Ends with a space or a period
    if (/[\s\.]$/.test(filename)) {
      return false;
    }
    return true;
  }

  checkName() {
    this.nameError = !this.nameValid(this.dtsName.nativeElement.value);
  }

  async submit() {
    this.nameError = !this.nameValid(this.dtsName.nativeElement.value);
    this.taskError = !this.tasks.includes(this.dtsTask.nativeElement.value);
    this.descError = this.markdownArea.nativeElement.value.length > 10000;
    this.trainUploadError =
      !this.dtsTrain.nativeElement.files ||
      !this.dtsTrain.nativeElement.files.length;
    this.evalScriptError =
      !this.evalScript.nativeElement.files ||
      !this.evalScript.nativeElement.files.length;
    this.evalDataError =
      !this.evalData.nativeElement.files ||
      !this.evalData.nativeElement.files.length;
    if (
      this.evalScriptError ||
      this.taskError ||
      this.descError ||
      this.nameError ||
      this.evalDataError ||
      this.trainUploadError
    )
      return;
    console.log(localStorage.getItem('access_token'));
    const formData = new FormData();
    formData.append(
      'uploadRequest',
      JSON.stringify({
        jwt: localStorage.getItem('access_token'),
        name: this.dtsName.nativeElement.value,
        task: this.dtsTask.nativeElement.value,
        desc: this.markdownArea.nativeElement.value,
      })
    );
    const appendFiles = (key: string, files: FileList) => {
      for (let i = 0; i < files.length; i++) {
        formData.append(key, files[i], files[i].name);
      }
    };
    appendFiles('files', this.dtsTrain.nativeElement.files!);
    appendFiles('eval', this.evalData.nativeElement.files!);
    appendFiles('script', this.evalScript.nativeElement.files!);
    this.uploading = true;
    const resp = await axios.post(
      ServerService.UserServer + '/dataset/upload',
      formData
    );
    this.uploading = false;
    if (resp.data.code != 200) {
      this.nameError = true;
    } else {
      this.snackbarService.open('Competition Initiated Successfully!', 'ok');
      setTimeout(
        () =>
          (window.location.pathname = `/dataset/${this.dtsName.nativeElement.value}`),
        1000
      );
    }
  }
}
