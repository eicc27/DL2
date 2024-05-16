import { Injectable } from '@angular/core';
import * as pyodide from 'pyodide';

function makePythonSafe(pythonCode: string): string {
  return pythonCode
    .replace(/\\/g, '\\\\') // Replace backslashes first to avoid escaping newly added backslashes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t'); // Escape tabs
}

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
import numpy
import PIL
from jedi.api import preload_module
preload_module("numpy", "PIL")
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
    return []
`;
    console.log(py);
    const packages = ['jedi', 'numpy', 'pillow'];
    await Promise.all(packages.map((pkg) => this.webasm.loadPackage(pkg)));
    await this.webasm.runPythonAsync(py);
  }

  async suggest(data: any) {
    const result = await this.webasm.runPythonAsync(
      `suggest("""
${makePythonSafe(data.lines.join('\n'))}
""", ${data.cursorPos.row + 2}, ${data.cursorPos.col - 1})`
    );
    return result.toJs();
  }
}
