interface TaskAndMethod {
  name: string;
  intro: string;
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
  tasks: TaskAndMethod[];
  methods: TaskAndMethod[];
  codes: Code[];
}
