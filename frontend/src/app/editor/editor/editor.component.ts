import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Tab } from '../tagbar/tagbar.component';
import axios from 'axios';
import { ServerService } from 'src/app/server.service';
import * as pyodide from 'pyodide';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
  private dragging = false;
  public isDrawerOpen = true;
  public tabs: Tab[] = [];
  public activeTab = -1;
  private webasm: pyodide.PyodideInterface | undefined = undefined;

  @ViewChild('editor')
  public editor!: ElementRef<HTMLTextAreaElement>;
  loading = true;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  public toggleDrag(e: MouseEvent) {
    this.dragging = true;
    console.log('dragging', this.dragging);
    this.renderer.addClass(this.document.body, 'no-select');
  }

  async ngOnInit() {
    document.onmousemove = (e) => this.drag(e);
    document.onmouseup = () => {
      this.dragging = false;
      const drawerElement = document.querySelector('mat-drawer')!;
      (drawerElement as HTMLElement).style.borderRight = '1px solid lightgray';
      this.renderer.removeClass(this.document.body, 'no-select');
    };
    this.webasm = await pyodide.loadPyodide({
      indexURL: 'assets/pyodide/',
    });
    await this.webasm.loadPackage('jedi');
    const py = `import jedi
def suggest(text, line, column):
    script = jedi.Script(text)
    try:
        completions = script.complete(line, column)
        return [c.name for c in completions]
    except:
        return []
`;
    await this.webasm!.runPythonAsync(py);
  }

  private drag(e: MouseEvent) {
    if (!this.dragging) {
      return;
    }
    const drawerElement = document.querySelector('mat-drawer')!;
    const handleElement = document.querySelector('.drag-handle')!;
    requestAnimationFrame(() => {
      const handleWidth = handleElement.getBoundingClientRect().width;
      (
        drawerElement as HTMLElement
      ).style.borderRight = `${handleWidth}px solid skyblue`;
      const maxWidth = window.innerWidth * 0.4;
      const minWidth = window.innerWidth * 0.1;
      const newWidth = e.clientX > maxWidth ? maxWidth : e.clientX;
      if (newWidth < minWidth) {
        // disable dragging if new width is less than min width, and
        // hide the drawer
        this.dragging = false;
        this.isDrawerOpen = false;
        return;
      }
      (drawerElement as HTMLElement).style.width = `${newWidth}px`;
      // set handle position to new width
      (handleElement as HTMLElement).style.left = `${newWidth - handleWidth}px`;
    });
  }

  public openFile(absPath: string) {
    // updates tabs and activeTab
    const tab = this.tabs.find((tab) => tab.path === absPath);
    if (tab) {
      // tab already exists
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].path === absPath) {
          this.activeTab = i;
          break;
        }
      }
      return;
    }
    this.tabs.push({
      name: absPath.split('/').pop()!,
      path: absPath,
      saved: true,
    });
    this.activeTab = this.tabs.length - 1;
  }

  public closeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  public fillText(text: string) {
    const editor = document.querySelector('textarea') as HTMLElement;
    editor.innerHTML = text;
  }

  public async getSeggestion() {
    const editorElement = this.editor.nativeElement;
    const getLineNumber = () => {
      return editorElement.value
        .substring(0, editorElement.selectionStart)
        .split('\\n').length;
    };
    const getColumnNumber = () => {
      var lines = editorElement.value
        .substring(0, editorElement.selectionStart)
        .split('\\n');
      var currentLine = lines[lines.length - 1];
      return currentLine.length;
    };
    const lineNumber = getLineNumber();
    const columnNumber = getColumnNumber();
    const text = editorElement.value;
    const result = await this.webasm!.runPythonAsync(
      `suggest("${text}", ${lineNumber}, ${columnNumber})`
    );
    const suggestions: string[] = result.toJs();
    console.log(suggestions.slice(10));
  }
}
