import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'highlightCapitalized',
    standalone: true,
})
export class HighlightCapitalizedPipe implements PipeTransform {
  transform(value: any, ...args: any[]): unknown {
    let newValue = '';
    for (let char of value) {
      if (char >= 'A' && char <= 'Z') {
        newValue += `<span class="${args[0]}">${char}</span>`;
      } else {
        newValue += char;
      }
    }
    return newValue;
  }
}
