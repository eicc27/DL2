export default interface Recommendation {
  arxivId: string[];
  citations: number[];
}

export interface SortedRecommendation {
  arxivId: string;
  citations: number;
}
