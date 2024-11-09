import { DOCUMENT, NgFor, NgIf } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Tab, TagbarComponent } from '../tagbar/tagbar.component';
import { EditorService } from '../editor.service';
import { AuthService } from 'src/app/auth.service';
import axios from 'axios';
import { ServerService } from 'src/app/server.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TopbarComponent } from 'src/app/topbar/topbar.component';
import { FsComponent } from '../fs/fs.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [
    TopbarComponent,
    FsComponent,
    TagbarComponent,
    NgFor,
    NgIf,
    MatProgressSpinnerModule,
    MatSidenavModule,
  ],
  standalone: true,
})
export class EditorComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  private authorized = this.authService.isAuthenticated();
  private dragging = false;
  public isDrawerOpen = true;
  public tabs: Tab[] = [];
  public activeTab = -1;
  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;
  @ViewChild('cursor')
  private cursor!: ElementRef<HTMLInputElement>;
  private lsp: HTMLUListElement | undefined = undefined;
  private selecting = false;
  private selectStart = [-1, -1];
  private selectEnd = [-1, -1];
  public lines: string[] = [];
  public drawerWidth = '20vw';
  public saving = false;
  public cursorPos = {
    col: 0,
    row: 0,
  };
  public suggestions: any[] = [];
  private timeout!: any;
  public loading = true;
  private cursorChanging = false;

  private debounce() {
    // Changed to an arrow function
    const later = async () => {
      if (this.timeout) clearTimeout(this.timeout);
      await this.suggest();
    };
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(later, 500);
  }

  // sets the new position of cursor based on `this.cursorPos`.
  // this should not be directly called for component lifecycle confict of Angular and DOM.
  // instead, change `this.cursorChanged` to `true` to trigger cursor updates.
  private setCursor() {
    console.log('set cursor start');
    // finds the span element with id c${row}_${col} and sets the cursor position
    const id = `c${this.cursorPos.row}_${this.cursorPos.col}`;
    let span = document.getElementById(id)!;
    if (!span) return;
    const left = span.offsetLeft;
    this.cursor.nativeElement.style.left = `calc(${left}px - 0.1em)`;
    // finds the row and appends the textarea
    // set textarea to be focused
    this.cursor.nativeElement.focus();
    // this.cursor = textArea;
    console.log('cursor set');
  }

  public input(event: KeyboardEvent) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.deleteRegion();
    const key = event.key;
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
    // console.log(this.lines);
    // if (key != ' ') this.suggest();
    // else this.suggestions = [];
  }

  private async suggest() {
    this.clearSuggetions();
    const suggestions = await this.webasm.suggest({
      lines: this.lines,
      cursorPos: this.cursorPos,
    });
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
  }

  /** TODO: add suggestion info for autocompletion */
  craeteSuggestionElement() {
    if (!this.suggestions.length) return;
    const suggestionElement = this.renderer.createElement(
      'ul'
    ) as HTMLUListElement;
    suggestionElement.classList.add('suggestions');
    for (let i = 0; i < this.suggestions.length; i++) {
      const suggestion = this.suggestions[i];
      const li = this.renderer.createElement('li');
      if (i == 0) li.classList.add('selected');
      // add name span
      const nameSpan = this.renderer.createElement('span');
      nameSpan.classList.add('name');
      nameSpan.classList.add('from-' + suggestion.get('from'));
      nameSpan.innerText = suggestion.get('name');
      li.appendChild(nameSpan);
      // add type span
      const typeSpan = this.renderer.createElement('span');
      typeSpan.classList.add('type');
      typeSpan.innerText = suggestion.get('type');
      li.appendChild(typeSpan);
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

  private deleteRegion() {
    const start = this.selectStart;
    const end = this.selectEnd;
    if (!this.isSelected()) return;
    const startRow = Math.min(start[0], end[0]);
    const endRow = Math.max(start[0], end[0]);
    let startCol: number, endCol: number;
    if (start[0] > end[0]) {
      startCol = end[1];
      endCol = start[1];
    } else if (start[0] < end[0]) {
      startCol = start[1];
      endCol = end[1];
    } else {
      startCol = Math.min(start[1], end[1]);
      endCol = Math.max(start[1], end[1]);
    }
    if (startRow == endRow) {
      // splice
      const line = this.lines[startRow];
      const newLine = line.slice(0, startCol) + line.slice(endCol);
      this.lines[startRow] = newLine;
    } else {
      // on this.startRow, delete to end of line
      const line = this.lines[startRow];
      const newLine = line.slice(0, startCol);
      this.lines[startRow] = newLine;
      // on this.endRow, delete from start of line
      const line2 = this.lines[endRow];
      const newLine2 = line2.slice(endCol);
      this.lines[endRow] = newLine2;
      // delete all lines in between
      this.lines.splice(startRow + 1, endRow - startRow - 1);
      // and merge startRow and endRow
      const line1 = this.lines[startRow];
      const line3 = this.lines[startRow + 1];
      this.lines[startRow] = line1 + line3;
      this.lines.splice(startRow + 1, 1);
    }
    this.cursorPos = {
      row: startRow,
      col: startCol,
    };
    this.selectEnd = this.selectStart;
    this.cursorChanging = true;
  }

  public isSelected() {
    return (
      this.selectStart[0] != -1 &&
      this.selectEnd[0] != -1 &&
      (this.selectStart[0] != this.selectEnd[0] ||
        this.selectStart[1] != this.selectEnd[1])
    );
  }

  async control(event: KeyboardEvent) {
    const isSelected = this.isSelected();
    if (event.key == 's' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      // console.log('Ctrl + S was pressed');
      this.saving = true;
      const absPath = this.tabs[this.activeTab].path;
      const resp = await axios.post(ServerService.LspServer + '/save', {
        path: absPath,
        userId: this.authService.getToken()!.name,
        text: this.lines.join('\n'),
      });
      if (resp.data.code == 200) {
        this.snackBar.open('Saved', 'OK', {
          duration: 2000,
        });
      } else {
        this.snackBar.open('Error saving file', 'OK', {
          duration: 2000,
        });
      }
      this.saving = false;
      return;
    }
    switch (event.key) {
      case 'ArrowLeft':
        this.clearSuggetions();
        this.cursorPos.col -= 1;
        this.cursorPos.col = Math.max(this.cursorPos.col, 0);
        break;
      case 'ArrowRight':
        this.clearSuggetions();
        this.cursorPos.col += 1;
        this.cursorPos.col = Math.min(
          this.cursorPos.col,
          this.lines[this.cursorPos.row].length
        );
        break;
      case 'ArrowUp':
        this.clearSuggetions();
        this.cursorPos.row -= 1;
        this.cursorPos.row = Math.max(this.cursorPos.row, 0);
        break;
      case 'ArrowDown':
        this.clearSuggetions();
        this.cursorPos.row += 1;
        this.cursorPos.row = Math.min(
          this.cursorPos.row,
          this.lines.length - 1
        );
        break;
      case 'Backspace':
        console.log(isSelected);
        this.deleteRegion();
        this.clearSuggetions();
        if (isSelected) break;
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
          break;
        }
        const newLine = line.slice(0, col - 1) + line.slice(col);
        this.lines[row] = newLine;
        this.cursorPos.col -= 1;
        break;
      case 'Enter':
        this.deleteRegion();
        this.clearSuggetions();
        this.suggestions = [];
        const { row: r, col: c } = this.cursorPos;
        const line1 = this.lines[r].slice(0, c);
        const line2 = this.lines[r].slice(c);
        this.lines[r] = line1;
        this.lines.splice(r + 1, 0, line2);
        this.cursorPos.row += 1;
        this.cursorPos.col = 0;
        break;
      case 'Tab':
        if (!this.suggestions.length) {
          // insert 4 spaces
          this.deleteRegion();
          this.clearSuggetions();
          const { row, col } = this.cursorPos;
          const line = this.lines[row];
          const newLine = line.slice(0, col) + '    ' + line.slice(col);
          this.lines[row] = newLine;
          this.cursorPos.col += 4;
        } else {
          const suggestion = this.suggestions[0];
          const name = suggestion.get('name');
          const from = suggestion.get('from');
          const { row, col } = this.cursorPos;
          const line = this.lines[row];
          const newLine =
            line.slice(0, col - from - 1) + name + line.slice(col);
          this.lines[row] = newLine;
          this.cursorPos.col += name.length - from - 1;
          event.preventDefault();
          event.stopPropagation();
          this.suggestions = [];
        }
        break;
      default:
        if (event.key.length != 1) break;
        console.log(event.key);
        this.input(event);
      // this.setCursor();
    }
    this.cursorChanging = true;
    // console.log(this.lines);
  }

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private webasm: EditorService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  public toggleDrag(e: MouseEvent) {
    this.dragging = true;
    // console.log('dragging', this.dragging);
    this.renderer.addClass(this.document.body, 'no-select');
  }

  async ngOnInit() {
    if (!this.authorized) window.location.pathname = '/login';
    document.onmousemove = (e) => this.drag(e);
    document.onmouseup = () => {
      this.dragging = false;
      const drawerElement = document.querySelector('mat-drawer')!;
      (drawerElement as HTMLElement).style.borderRight = '1px solid lightgray';
      this.renderer.removeClass(this.document.body, 'no-select');
      this.drawerWidth = drawerElement.getBoundingClientRect().width + 'px';
    };
    await this.webasm.loadPyodide();
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
      console.log(this.cursorPos);
      this.cursorChanging = true;
    };
    this.editor.nativeElement.onmousedown = (e) => {
      for (let i = 0; i < this.lines.length; i++) {
        const line = this.lines[i];
        for (let j = 0; j <= line.length; j++) {
          console.log(`c${i}_${j}`);
          const span = document.getElementById(`c${i}_${j}`);
          span?.classList.remove('selected');
        }
      }
      this.selectStart = [-1, -1];
      this.selectEnd = [-1, -1];
      // listen for drag to select events
      this.selecting = true;
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const id = target.id;
      if (!id.startsWith('c')) return;
      const [row, col] = id.slice(1).split('_');
      this.selectStart = [parseInt(row), parseInt(col)];
      this.cursorPos = {
        row: parseInt(row),
        col: parseInt(col),
      };
      this.setCursor();
    };

    this.editor.nativeElement.onmouseup = (e) => {
      this.selecting = false;
      const target = e.target;
      if (!(target instanceof HTMLSpanElement)) return;
      const id = target.id;
      if (!id.startsWith('c')) return;
      const [row, col] = id.slice(1).split('_');
      this.selectEnd = [parseInt(row), parseInt(col)];
      this.cursorPos = {
        row: this.selectEnd[0],
        col: this.selectEnd[1],
      };
    };

    this.editor.nativeElement.onmousemove = (e) => {
      if (!this.selecting) return;
      const target = e.target;
      if (!(target instanceof HTMLSpanElement)) return;
      const id = target.id;
      if (!id.startsWith('c')) return;
      const [row, col] = id.slice(1).split('_');
      // mark from selectStart to current position as selected
      const start = this.selectStart;
      const end = [parseInt(row), parseInt(col)];
      this.selectEnd = end;
      this.cursorPos = {
        row: parseInt(row),
        col: parseInt(col),
      };
      this.setCursor();
      const startRow = Math.min(start[0], end[0]);
      const endRow = Math.max(start[0], end[0]);
      let startCol: number, endCol: number;
      if (start[0] > end[0]) {
        startCol = end[1];
        endCol = start[1];
      } else if (start[0] < end[0]) {
        startCol = start[1];
        endCol = end[1];
      } else {
        startCol = Math.min(start[1], end[1]);
        endCol = Math.max(start[1], end[1]);
      }
      console.log(startRow, startCol, endRow, endCol);
      // first mark all unselected
      for (let i = 0; i < this.lines.length; i++) {
        const line = this.lines[i];
        for (let j = 0; j <= line.length; j++) {
          const span = document.getElementById(`c${i}_${j}`)!;
          span.classList.remove('selected');
        }
      }
      // then mark selected
      if (startRow == endRow) {
        for (let i = startRow; i <= endRow; i++) {
          for (let j = startCol; j <= endCol; j++) {
            const span = document.getElementById(`c${i}_${j}`)!;
            span.classList.add('selected');
          }
        }
      } else {
        // on this.startRow, select to end of line
        if (!this.lines[startRow]) return;
        for (let j = startCol; j <= this.lines[startRow].length; j++) {
          const span = document.getElementById(`c${startRow}_${j}`)!;
          span.classList.add('selected');
        }
        // on this.endRow, select from start of line
        for (let j = 0; j <= endCol; j++) {
          const span = document.getElementById(`c${endRow}_${j}`)!;
          span.classList.add('selected');
        }
        // select all lines in between
        for (let i = startRow + 1; i < endRow; i++) {
          for (let j = 0; j <= this.lines[i].length; j++) {
            const span = document.getElementById(`c${i}_${j}`)!;
            span.classList.add('selected');
          }
        }
      }
    };
  }

  // Manage the change of cursor only when the necessary changes of Angular done to DOM have finished.
  ngAfterViewChecked() {
    if (!this.cursorChanging) return;
    this.cursorChanging = false;
    this.setCursor();
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
      this.drawerWidth = `${newWidth}px`;
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
