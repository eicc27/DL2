import Paper from "../paper/paper.model";

export interface Task {
  name: string;
  intro: string;
  methods: string[];
  methodNumPapers: number[];
  methodColors: string[];
  papers: Paper[];
}
