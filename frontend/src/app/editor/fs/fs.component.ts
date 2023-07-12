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

interface FileNode {
  name: string;
  type: string;
  parent?: string;
  children?: FileNode[];
}

@Component({
  selector: 'app-fs',
  templateUrl: './fs.component.html',
  styleUrls: ['./fs.component.scss'],
})
export class FsComponent implements OnInit {
  private lspServer: string;
  private fileNodes: FileNode[] = [];
  public userId = '001';

  @Output('fileSelected')
  public fileSelected = new EventEmitter<string>();

  @Output('fileOpened')
  public fileOpened = new EventEmitter<string>();

  public constructor(private snackBar: MatSnackBar) {
    this.lspServer = ServerService.LspServer;
    this.dataSource.data = this.fileNodes;
  }

  public treeControl = new NestedTreeControl<FileNode>((node) => node.children);

  public dataSource = new MatTreeNestedDataSource<FileNode>();

  public hasChild = (_: number, node: FileNode) => !!node.children;

  async ngOnInit() {
    const res = await axios.post(`${this.lspServer}/fs`, {
      userId: '001',
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
    this.fileNodes.push({
      name: root,
      type: 'folder',
      parent: undefined,
      children: data.dirs.map((dir) => {
        return {
          name: dir.name,
          type: dir.type,
          parent: root,
          children: dir.type === 'dir' ? [] : undefined,
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
      userId: '001',
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
    currentNode.children = data.dirs.map((dir) => {
      return {
        name: dir.name,
        type: dir.type,
        parent: absPath,
        children: dir.type === 'dir' ? [] : undefined,
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
}
