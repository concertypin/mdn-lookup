export interface MDNSearchResult {
  title: string;
  mdn_url: string;
  summary?: string;
}

export interface MDNSearchResponse {
  documents: MDNSearchResult[];
}

export interface MDNLookupResult {
  success: boolean;
  query: string;
  title?: string;
  snippet?: string;
  url?: string;
  summary?: string;
  message?: string;
}

export interface StreamMessage {
  type: 'start' | 'progress' | 'complete' | 'error';
  query?: string;
  message?: string;
  success?: boolean;
  title?: string;
  snippet?: string;
  url?: string;
  summary?: string;
}