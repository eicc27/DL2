import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { NgFor, AsyncPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { MarkdownModule } from 'ngx-markdown';
import { MatCardModule } from '@angular/material/card';
import { JwtModule } from '@auth0/angular-jwt';
import { FavComponent } from './app/personal/fav/fav.component';
import { DatasetComponent } from './app/dataset/dataset.component';
import { DatacompComponent } from './app/datacomp/datacomp.component';
import { UploadDatasetComponent } from './app/upload-dataset/upload-dataset.component';
import { MethodComponent } from './app/method/method.component';
import { TaskComponent } from './app/task/task.component';
import { TasksComponent } from './app/tasks/tasks.component';
import { MethodsComponent } from './app/methods/methods.component';
import { PersonalComponent } from './app/personal/personal.component';
import { AfterComponent } from './app/login/after/after.component';
import { RegisterComponent } from './app/login/register/register.component';
import { AboutComponent } from './app/about/about.component';
import { LoginComponent } from './app/login/login/login.component';
import { PaperComponent } from './app/paper/paper.component';
import { EditorComponent } from './app/editor/editor/editor.component';
import { HomeComponent } from './app/home/home/home.component';
import { provideRouter } from '@angular/router';

const appRoutes = [
  { path: '', component: HomeComponent },
  {
    path: 'editor',
    component: EditorComponent,
  },
  {
    path: 'paper/:id',
    component: PaperComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'after',
    component: AfterComponent,
  },
  {
    path: 'home',
    component: PersonalComponent,
  },
  {
    path: 'methods',
    component: MethodsComponent,
  },
  {
    path: 'tasks',
    component: TasksComponent,
  },
  {
    path: 'task/:task',
    component: TaskComponent,
  },
  {
    path: 'method/:method',
    component: MethodComponent,
  },
  {
    path: 'upload-dataset',
    component: UploadDatasetComponent,
  },
  {
    path: 'datacomp',
    component: DatacompComponent,
  },
  {
    path: 'dataset/:dataset',
    component: DatasetComponent,
  },
  {
    path: 'home/fav',
    component: FavComponent,
  },
];

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: () => localStorage.getItem('access_token'),
          allowedDomains: ['*'],
          disallowedRoutes: [],
        },
      }),
      MatCardModule,
      MarkdownModule.forRoot(),
      BrowserModule,
      MatToolbarModule,
      MatInputModule,
      MatIconModule,
      MatSidenavModule,
      MatSnackBarModule,
      DragDropModule,
      MatTreeModule,
      MatButtonModule,
      MatTabsModule,
      MatProgressSpinnerModule,
      MatChipsModule,
      MatPaginatorModule,
      MatProgressBarModule,
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatAutocompleteModule,
      ReactiveFormsModule,
      MatTableModule,
      NgFor,
      AsyncPipe
    ),
    provideRouter(appRoutes),
    provideAnimations(),
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
