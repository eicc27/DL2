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

import { HomeComponent } from './home/home/home.component';
import { RouterModule } from '@angular/router';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { UserinfoComponent } from './home/userinfo/userinfo.component';
import { EditorComponent } from './editor/editor/editor.component';
import { FsComponent } from './editor/fs/fs.component';
import { FileItemComponent } from './editor/fs/file-item/file-item.component';
import { FolderItemComponent } from './editor/fs/folder-item/folder-item.component';
import { TagbarComponent } from './editor/tagbar/tagbar.component';
import { PaperComponent } from './paper/paper.component';

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
  }
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
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
