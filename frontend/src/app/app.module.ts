import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// angular-material part
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { HomeComponent } from './home/home/home.component';
import { JwtModule } from '@auth0/angular-jwt';
import { RouterModule } from '@angular/router';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { UserinfoComponent } from './home/userinfo/userinfo.component';
import { EditorComponent } from './editor/editor/editor.component';
import { FsComponent } from './editor/fs/fs.component';
import { FileItemComponent } from './editor/fs/file-item/file-item.component';
import { FolderItemComponent } from './editor/fs/folder-item/folder-item.component';
import { TagbarComponent } from './editor/tagbar/tagbar.component';
import { PaperComponent } from './paper/paper.component';
import { LoginComponent } from './login/login/login.component';
import { SphereComponent } from './login/sphere/sphere.component';
import { RegisterComponent } from './login/register/register.component';
import { NotificationComponent } from './login/notification/notification.component';
import { LoadingComponent } from './loading/loading.component';
import { HighlightCapitalizedPipe } from './highlight-capitalized.pipe';
import { TopbarComponent } from './topbar/topbar.component';

// routing
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
    path: 'register',
    component: RegisterComponent,
  },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchbarComponent,
    UserinfoComponent,
    EditorComponent,
    FsComponent,
    FileItemComponent,
    FolderItemComponent,
    TagbarComponent,
    PaperComponent,
    LoginComponent,
    SphereComponent,
    RegisterComponent,
    NotificationComponent,
    LoadingComponent,
    HighlightCapitalizedPipe,
    TopbarComponent,
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('access_token'),
        allowedDomains: ['*'],
        disallowedRoutes: [],
      },
    }),
    BrowserModule,
    BrowserAnimationsModule,
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
