export interface Task {
    name: string;
    desc: string;
}

export interface Method {
    method: string;
    desc?: string;
    url?: string;
}


export interface SourceCode {
    url: string;
    rating: number;
}

export interface Author {
    id: string;
    name: string;
}

export interface Metadata {
    codes: SourceCode[];
    methods: Method[];
    authors: Author[];
    name: string;
    id: string;
    abstract: string;
    references: number;
    citations: number;
    referencedPapers: string[];
}