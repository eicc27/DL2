export interface Completion {
  name: string;
  type: string;
  from: number; // prefix length
  docstring: string;
}
