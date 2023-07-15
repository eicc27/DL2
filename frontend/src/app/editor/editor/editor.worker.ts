/// <reference lib="webworker" />
import * as pyodide from 'pyodide';

// function customStringify(obj: any): string {
//   const visited = new WeakSet();

//   function replacer(key: string, value: any): any {
//     if (typeof value === 'object' && value !== null) {
//       if (visited.has(value)) {
//         return '[Circular Reference]';
//       }
//       visited.add(value);
//     }
//     return value;
//   }

//   return JSON.stringify(obj, replacer);
// }


addEventListener('message', async ({ data }) => {
  console.log(data);
  try {
    const webasm = await pyodide.loadPyodide({
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
    return []`;
    await webasm.loadPackage('jedi');
    await webasm.runPythonAsync(py);
    const result = await webasm.runPythonAsync(
      `suggest("""
${data.lines.join('\n')}""", ${data.cursorPos.row + 2}, ${
        data.cursorPos.col - 1
      })`
    );
    const suggestions = result.toJs();
    postMessage(suggestions);
  } catch (e) {
    console.log(e);
  }
});
