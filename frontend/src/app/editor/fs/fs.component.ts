import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ServerService } from 'src/app/server.service';
import axios from 'axios';
import FsResponse, { Dirs } from './FsResponse.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import GenericResponse from 'src/app/GenericResponse.model';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import OpenResponse from './OpenResponse';
import { AuthService } from 'src/app/auth.service';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from 'src/app/loading/loading.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface FileNode {
  name: string;
  type: string;
  parent?: string;
  children?: any;
}

function createFileNodes(data: FsResponse): any {
  let fileNodes: Record<string, FileNode> = {};

  // Function to find or create a child with a specific name
  const findOrCreateChild = (
    parent: FileNode,
    name: string,
    type: string,
    parentPath: string
  ): FileNode => {
    let child = parent.children?.find((child: any) => child.name === name);
    if (!child) {
      child = { name: name, type: type, parent: parentPath.slice(1) };
      if (type === 'folder') {
        child.children = [];
      }
      parent.children?.push(child);
    }
    return child;
  };
  // Iterate over the list of directories and files
  for (let entry of data.dirs) {
    let pathComponents = entry.name.split('/');
    pathComponents = pathComponents.filter((c) => c);
    let currentNode: FileNode;
    if (!(pathComponents[0] in fileNodes)) {
      currentNode = { name: pathComponents[0], type: 'folder', children: [] };
      fileNodes[pathComponents[0]] = currentNode;
    } else {
      currentNode = fileNodes[pathComponents[0]];
    }
    let parentPath = '';
    for (let i = 1; i < pathComponents.length; i++) {
      const component = pathComponents[i];
      const type = i === pathComponents.length - 1 ? entry.type : 'folder';
      parentPath = parentPath + '/' + pathComponents[i - 1]; // Update the parent path
      currentNode = findOrCreateChild(currentNode, component, type, parentPath);
    }
  }
  const sortChildren = (node: FileNode) => {
    if (node.children) {
      node.children.sort((a: any, b: any) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'folder' ? -1 : 1;
      });
      node.children.forEach(sortChildren);
    }
  };
  // Sort all children in the fileNodes
  Object.values(fileNodes).forEach(sortChildren);
  console.log(fileNodes);
  return Object.values(fileNodes)[0];
}

function isValidFilename(filename: string): boolean {
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

@Component({
  selector: 'app-fs',
  templateUrl: './fs.component.html',
  styleUrls: ['./fs.component.scss'],
  imports: [
    NgIf,
    MatTreeModule,
    MatIconModule,
    LoadingComponent,
    MatProgressBarModule,
  ],
  standalone: true,
})
export class FsComponent implements OnInit {
  private lspServer: string;
  private fileNodes: FileNode[] = [];
  public userId!: string;
  public newObject: any = undefined;
  public evalObject: any = undefined;
  public evalErrorMsg: any = undefined;
  public loading = false;

  @Output('fileSelected')
  public fileSelected = new EventEmitter<string>();

  @Output('fileOpened')
  public fileOpened = new EventEmitter<string>();

  public constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.lspServer = ServerService.LspServer;
    this.dataSource.data = this.fileNodes;
  }

  public treeControl = new NestedTreeControl<FileNode>((node) => node.children);

  public dataSource = new MatTreeNestedDataSource<FileNode>();

  public hasChild = (_: number, node: FileNode) => !!node.children;

  async ngOnInit() {
    this.userId = this.authService.getToken()!.name;
    const res = await axios.post(`${this.lspServer}/fs`, {
      userId: this.userId,
    });
    const fsResponse: GenericResponse<any> = res.data;
    console.log(fsResponse);
    if (fsResponse.data['new'])
      this.snackBar.open('Workspace initialized. Welcome!', 'OK', {
        duration: 5000,
      });
    else
      this.snackBar.open('Workspace loaded. Welcome back!', 'OK', {
        duration: 5000,
      });
    const data = fsResponse.data;
    this.fileNodes = [createFileNodes(data)];
    this.dataSource.data = this.fileNodes;
  }

  async openFile(node: FileNode) {
    const absPath = [node.parent, node.name].join('/');
    console.log(absPath);
    const resp = await axios.post(`${this.lspServer}/open`, {
      path: absPath,
      userId: this.userId,
    });
    const data: GenericResponse<OpenResponse> = resp.data;
    if (data.code == 200) {
      this.fileSelected.emit(absPath);
      this.fileOpened.emit(data.data.content);
    }
  }

  addFile(node: FileNode) {
    console.log(node);
    if (node.type !== 'folder') return;
    const absPath = [node.parent, node.name].join('/') + '/';
    this.newObject = {
      type: 'file',
      parent: absPath,
      name: 'new file',
    };
  }

  addFolder(node: FileNode) {
    console.log(node);
    if (node.type !== 'folder') return;
    const absPath = [node.parent, node.name].join('/') + '/';
    this.newObject = {
      type: 'folder',
      parent: absPath,
      name: 'new folder',
    };
  }

  checkFileName() {
    const inputElement = document.querySelector(
      '.add-new-body-input'
    ) as HTMLInputElement;
    let name = inputElement.value;
    if (this.newObject.type == 'file by upload') {
      name = name.split('\\').pop()!.split('/').pop()!;
      this.newObject.name = name;
    }
    if (name.length === 0) {
      this.newObject.errorMsg = 'Name cannot be empty';
      return;
    }
    if (!isValidFilename(name)) {
      this.newObject.errorMsg = 'Invalid filename';
      return;
    }
    this.newObject.errorMsg = undefined;
  }

  uploadFile(node: FileNode) {
    console.log(node);
    if (node.type !== 'folder') return;
    const absPath = [node.parent, node.name].join('/') + '/';
    this.newObject = {
      type: 'file by upload',
      parent: absPath,
      name: '',
    };
  }

  async addNew() {
    if (!this.authService.isAuthenticated()) return;
    const inputElement = document.querySelector(
      '.add-new-body-input'
    ) as HTMLInputElement;
    let formData: FormData | undefined = undefined;
    if (this.newObject.type != 'file by upload') {
      const name = inputElement.value;
      this.newObject.name = name;
    } else {
      formData = new FormData();
      formData.append('file', this.newObject.file);
      formData.append('parent', this.newObject.parent);
      formData.append('name', this.newObject.name);
      formData.append('type', this.newObject.type);
    }
    if (!isValidFilename(this.newObject.name) || !this.newObject.name.length)
      return;
    console.log(formData);
    const res = await axios.post(
      ServerService.LspServer + '/add',
      this.newObject.type == 'file by upload' ? formData : this.newObject,
      {
        onUploadProgress: (progressEvent) => {
          if (this.newObject.type !== 'file by upload') return;
          this.newObject.progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
        },
      }
    );
    if (res.data.code == 200) {
      this.snackBar.open('File created successfully', 'OK', {
        duration: 5000,
      });
      // add this file to the tree
      const absPath = [this.newObject.parent, this.newObject.name].join('/');
      const paths = absPath.split('/');
      let currentNode = this.fileNodes[0];
      for (const path of paths) {
        if (!currentNode.children) break;
        currentNode.children.forEach((child: any) => {
          if (child.name === path) currentNode = child;
        });
      }
      currentNode.children?.push({
        name: this.newObject.name,
        type: this.newObject.type,
        parent: this.newObject.parent.slice(0, -1),
        children: this.newObject.type === 'folder' ? [] : undefined,
      });
      currentNode.children?.sort((a: any, b: any) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'folder' ? -1 : 1;
      });
      this.dataSource.data = [];
      this.dataSource.data = this.fileNodes;
      this.newObject = undefined;
    } else {
      this.snackBar.open('Error creating file', 'OK', {
        duration: 5000,
      });
    }
  }

  onFileSelected(event: Event) {
    if (!this.newObject) return;
    if (this.newObject.type !== 'file by upload') return;
    this.newObject.file = (event.target as HTMLInputElement).files![0];
  }

  cancel() {
    this.newObject = undefined;
    this.evalObject = undefined;
  }

  uploadToEval(node: FileNode) {
    this.evalObject = {
      name: this.authService.getToken()!.name,
      file: [node.parent, node.name].join('/'),
    };
  }

  async evalFile() {
    const inputElement = document.querySelector(
      '.add-new-body-input.add-dataset'
    ) as HTMLInputElement;
    const value = inputElement.value;
    if (!value || !value.length) return;
    const formData = new FormData();
    formData.append('name', this.evalObject.name);
    formData.append('file', this.evalObject.file);
    formData.append('dataset', value);
    this.loading = true;
    const res = await axios.post(
      ServerService.UserServer + '/eval/uploads3',
      formData
    );
    this.loading = false;
    if (res.data.code == 200) {
      this.snackBar.open(
        'File evaluated successfully! Your score: ' + res.data.data,
        'OK'
      );
      this.evalObject = undefined;
    } else {
      this.snackBar.open(res.data.msg, 'OK');
    }
  }
}
