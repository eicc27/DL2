export interface Task {
    id: string;
    name: string;
    desc: string;
}

export interface Method {
    id: string;
    method: string;
    desc?: string;
    arxivId?: string;
}


export interface SourceCode {
    url: string;
    rating: number;
}

export interface Author {
    id: string;
    name: string;
}

export interface Paper {
    codes: SourceCode[];
    methods: string[];
    authors: string[];
    name: string;
    id: string;
    abstract: string;
    references: number;
    citations: number;
    referencedPapers: string[];
    tasks: Task[];
}