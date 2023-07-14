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
import { encode } from 'he';
import { Tab } from '../tagbar/tagbar.component';
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
  private cursor: HTMLInputElement | undefined = undefined;
  private lsp: HTMLUListElement | undefined = undefined;
  private webasm: pyodide.PyodideInterface | undefined = undefined;
  public encode = (text: string) =>
    encode(text, {
      useNamedReferences: true,
    });

  public lines: string[] = [];
  public cursorPos = {
    col: 0,
    row: 0,
  };
  public suggestions: string[] = [];

  private setCursor() {
    this.cursor?.remove();
    const textArea = this.renderer.createElement('input') as HTMLInputElement;
    textArea.oninput = this.input.bind(this);
    textArea.onkeydown = this.control.bind(this);
    // finds the span element with id c${row}_${col} and sets the cursor position
    const id = `c${this.cursorPos.row}_${this.cursorPos.col}`;
    let span = document.getElementById(id)!;
    if (!span) return;
    const left = span.offsetLeft;
    textArea.style.left = `calc(${left}px - 0.1em)`;
    const top = span.offsetTop;
    // textArea.style.top = `calc(${top}px - 0.1em)`;
    console.log(this.cursorPos.row, this.cursorPos.col);
    // finds the row and appends the textarea
    const row = document.getElementById(`rc${this.cursorPos.row}`)!;
    row.appendChild(textArea);
    // set textarea to be focused
    textArea.focus();
    this.cursor = textArea;
  }

  public input(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const key = target.value;
    target.value = '';
    // update lines
    const { row, col } = this.cursorPos;
    const line = this.lines[row];
    if (key != '\n' && key != '\r') {
      const newLine = line.slice(0, col) + key + line.slice(col);
      this.lines[row] = newLine;
      // update cursor position
      this.cursorPos.col += 1;
    }
    setTimeout(async () => {
      this.setCursor();
      if (key != ' ') this.suggest();
      else this.suggestions = [];
    }, 5);
  }

  private suggest() {
    console.log('suggestions:');
    this.webasm!.runPythonAsync(
      `suggest("""
${this.lines.join('\n')}""", ${this.cursorPos.row + 2}, ${
        this.cursorPos.col - 1
      })`
    ).then((result) => {
      this.clearSuggetions();
      const suggestions: string[] = result.toJs();
      this.suggestions = suggestions;
      console.log(suggestions);
      // set the position of the suggestions
      this.craeteSuggestionElement();
      if (!this.lsp) return;
      const id = `c${this.cursorPos.row}_${this.cursorPos.col}`;
      const span = document.getElementById(id)!;
      const top = span.offsetTop;
      const left = span.offsetLeft;
      this.lsp.style.top = `calc(${top}px + 1em)`;
      this.lsp.style.left = `calc(${left}px + 1em)`;
      const rowElement = document.getElementById(`rc${this.cursorPos.row}`)!;
      rowElement.appendChild(this.lsp);
    });
  }

  /** TODO: add suggestion info for autocompletion */
  craeteSuggestionElement() {
    if (!this.suggestions.length) return;
    const suggestionElement = this.renderer.createElement('ul') as HTMLUListElement;
    suggestionElement.classList.add('suggestions');
    for (const suggestion of this.suggestions) {
      const li = this.renderer.createElement('li');
      li.innerText = suggestion;
      suggestionElement.appendChild(li);
    }
    this.lsp = suggestionElement;
  }

  clearSuggetions() {
    if (!this.lsp) return;
    this.suggestions = [];
    this.lsp.remove();
    this.lsp = undefined;
  }

  control(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.clearSuggetions();
        this.cursorPos.col -= 1;
        this.cursorPos.col = Math.max(this.cursorPos.col, 0);
        setTimeout(() => this.setCursor(), 20);
        break;
      case 'ArrowRight':
        this.clearSuggetions();
        this.cursorPos.col += 1;
        this.cursorPos.col = Math.min(
          this.cursorPos.col,
          this.lines[this.cursorPos.row].length
        );
        setTimeout(() => this.setCursor(), 20);
        break;
      case 'ArrowUp':
        this.clearSuggetions();
        this.cursorPos.row -= 1;
        this.cursorPos.row = Math.max(this.cursorPos.row, 0);
        setTimeout(() => this.setCursor(), 20);
        break;
      case 'ArrowDown':
        this.clearSuggetions();
        this.cursorPos.row += 1;
        this.cursorPos.row = Math.min(
          this.cursorPos.row,
          this.lines.length - 1
        );
        setTimeout(() => this.setCursor(), 20);
        break;
      case 'Backspace':
        this.clearSuggetions();
        const { row, col } = this.cursorPos;
        const line = this.lines[row];
        if (col <= 0) {
          if (row <= 0) return;
          this.cursorPos.row -= 1;
          this.cursorPos.col = this.lines[this.cursorPos.row].length;
          const line1 = this.lines[this.cursorPos.row];
          const line2 = this.lines[this.cursorPos.row + 1];
          this.lines[this.cursorPos.row] = line1 + line2;
          this.lines.splice(this.cursorPos.row + 1, 1);
          setTimeout(() => this.setCursor(), 20);
          break;
        }
        const newLine = line.slice(0, col - 1) + line.slice(col);
        this.lines[row] = newLine;
        this.cursorPos.col -= 1;
        setTimeout(() => this.setCursor(), 20);
        break;
      case 'Enter':
        this.clearSuggetions();
        this.suggestions = [];
        const { row: r, col: c } = this.cursorPos;
        const line1 = this.lines[r].slice(0, c);
        const line2 = this.lines[r].slice(c);
        this.lines[r] = line1;
        this.lines.splice(r + 1, 0, line2);
        this.cursorPos.row += 1;
        this.cursorPos.col = 0;
        setTimeout(() => this.setCursor(), 20);
        break;
    }
    // console.log(this.lines);
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
    except Exception as e:
      print(e)
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
    };
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
    this.lines = text.split('\n');
  }
}
