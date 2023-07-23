import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ServerService } from 'src/app/server.service';
import axios from 'axios';
import FsResponse from './FsResponse.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import GenericResponse from 'src/app/GenericResponse.model';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeNestedDataSource,
} from '@angular/material/tree';
import OpenResponse from './OpenResponse';
import { AuthService } from 'src/app/auth.service';

interface FileNode {
  name: string;
  type: string;
  parent?: string;
  children?: FileNode[];
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
})
export class FsComponent implements OnInit {
  private lspServer: string;
  private fileNodes: FileNode[] = [];
  public userId!: string;
  public newObject: any = undefined;

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
    const fsResponse: GenericResponse<FsResponse> = res.data;
    if (fsResponse.data.isNew)
      this.snackBar.open('Workspace initialized. Welcome!', 'OK', {
        duration: 5000,
      });
    else
      this.snackBar.open('Workspace loaded. Welcome back!', 'OK', {
        duration: 5000,
      });
    const data = fsResponse.data;
    const root = data.parent;
    // sort data.dirs by type
    data.dirs = data.dirs.sort((a, b) => {
      return b.type.length - a.type.length;
    });
    this.fileNodes.push({
      name: root,
      type: 'folder',
      parent: undefined,
      children: data.dirs.map((dir) => {
        return {
          name: dir.name,
          type: dir.type,
          parent: root,
          children: dir.type === 'folder' ? [] : undefined,
        };
      }),
    });
    this.dataSource.data = this.fileNodes;
  }

  public async onNodeClick(node: FileNode) {
    const isExpanded = this.treeControl.isExpanded(node);
    if (!isExpanded) return;
    let absPath = '';
    if (node.parent) absPath = [node.parent, node.name].join('/');
    else absPath = node.name;
    // console.log(absPath);
    const res = await axios.post(`${this.lspServer}/fs`, {
      userId: this.userId,
      parent: absPath,
    });
    const fsResponse: GenericResponse<FsResponse> = res.data;
    const data = fsResponse.data;
    // traces the node with absPath
    const paths = absPath.split('/');
    let currentNode = this.fileNodes[0];
    for (const path of paths) {
      if (!currentNode.children) break;
      currentNode.children.forEach((child) => {
        if (child.name === path) currentNode = child;
      });
    }
    data.dirs = data.dirs.sort((a, b) => {
      return b.type.length - a.type.length;
    });
    currentNode.children = data.dirs.map((dir) => {
      return {
        name: dir.name,
        type: dir.type,
        parent: absPath,
        children: dir.type === 'folder' ? [] : undefined,
      };
    });
    // console.log(this.fileNodes);
    this.dataSource.data = [];
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
        currentNode.children.forEach((child) => {
          if (child.name === path) currentNode = child;
        });
      }
      // sort currentNode.children by type
      currentNode.children?.sort((a, b) => {
        return b.type.length - a.type.length;
      });
      currentNode.children?.push({
        name: this.newObject.name,
        type: this.newObject.type,
        parent: this.newObject.parent,
        children: this.newObject.type === 'folder' ? [] : undefined,
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
  }
}
