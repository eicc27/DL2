interface Task {
  taskName: string[];
  numPapers: number[];
}

interface Method {
  methodName: string[];
  numPapers: number[];
}

interface Code {
  url: string;
  shortened?: string;
  rating: number;
}

export default interface Paper {
  arxivId: string;
  title: string;
  abs: string;
  citations: number;
  authors: string[];
  tasks: Task;
  methods: Method;
  codes: Code[];
  taskColors: string[];
  methodColors: string[];
}
