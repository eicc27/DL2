import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
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
export class EditorComponent implements OnInit, AfterViewInit {
  private dragging = false;
  public isDrawerOpen = true;
  public tabs: Tab[] = [];
  public activeTab = -1;
  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;
  @ViewChild('cursor') cursor!: ElementRef<HTMLTextAreaElement>;
  private webasm: pyodide.PyodideInterface | undefined = undefined;
  public lines: string[] = [];
  public cursorPos = {
    col: 0,
    row: 0,
  };

  private setCursor() {
    // finds the span element with id c${row}_${col} and sets the cursor position
    const id = `c${this.cursorPos.row}_${this.cursorPos.col}`;
    const span = document.getElementById(id);
    if (!span) return;
    const rect = span.getBoundingClientRect();
    const cursor = this.cursor.nativeElement;
    cursor.style.left = `calc(${rect.left}px - 0.1em)`;
    cursor.style.top = `${rect.top}px`;
    console.log(this.cursorPos.row, this.cursorPos.col);
    // set textarea to be focused
    cursor.focus();
  }

  public input(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    const key = target.value;
    console.log(key);
    target.value = '';
    // update lines
    const { row, col } = this.cursorPos;
    const line = this.lines[row];
    const newLine = line.slice(0, col) + key + line.slice(col);
    this.lines[row] = newLine;
    // update cursor position
    this.cursorPos.col += 1;
    this.setCursor();
  }

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
    const py = `import jedi
def suggest(text, line, column):
    script = jedi.Script(text)
    try:
      completions = script.complete(line, column)
      return [c.name for c in completions]
    except:
      return []
    `;
    this.webasm.loadPackage('jedi').then(() => this.webasm!.runPythonAsync(py));
  }

  ngAfterViewInit() {
    this.editor.nativeElement.onclick = (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const id = target.id;
      if (!id.startsWith('c')) return;
      const [row, col] = id.slice(1).split('_');
      this.cursorPos = {
        row: parseInt(row),
        col: parseInt(col),
      };
      this.setCursor();
    }
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
    this.lines = text.split('\\n');
  }

  public async getSeggestion() {
    const result = await this.webasm!.runPythonAsync(
      `suggest("""
${this.lines.join('\\n')}""", ${this.cursorPos.row + 1}, ${
        this.cursorPos.col + 1
      })`
    );
    const suggestions: string[] = result.toJs();
    console.log(suggestions.slice(10));
  }
}
