import { SearchResult } from "./SearchResult";

export interface SearchRequest {
    SemanticSearchPhrase: string
    SearchResult: SearchResult[]
}