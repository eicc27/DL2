export default interface Task {
  name: string;
  methods: string;
  numPapers: number;
  intro: string;
}

export interface TaskResponse {
  totalElements: number;
  tasks: Task[];
}
