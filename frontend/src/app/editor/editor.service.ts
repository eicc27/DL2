import { Injectable } from '@angular/core';
import * as pyodide from 'pyodide';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  webasm!: pyodide.PyodideInterface;

  constructor() {}

  async loadPyodide() {
    this.webasm = await pyodide.loadPyodide({
      indexURL: 'assets/pyodide/',
    });
    const py = `import jedi
def suggest(text, line, column):
  script = jedi.Script(text)
  try:
    completions = script.complete(line, column)
    return [{
      'name': c.name,
      'type': c.type,
      'from': c.get_completion_prefix_length()
    } for c in completions]
  except Exception as e:
    return []`;
    await this.webasm.loadPackage('jedi');
    await this.webasm.runPythonAsync(py);
  }

  async suggest(data: any) {
    const result = await this.webasm.runPythonAsync(
      `suggest("""
${data.lines.join('\n').replace('"', '\\"').replace("'", "\\'")}
""", ${data.cursorPos.row + 2}, ${data.cursorPos.col - 1})`
    );
    return result.toJs();
  }
}
