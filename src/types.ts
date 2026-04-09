export interface BookDetails {
  coverUrl: string;
  description: string;
  genre: string;
}


export interface LiteraryQuoteUnsplash{
    cover?:string; // cover url
}

export interface LiteraryQuoteGemini{
    genre? :string; // book genre
    keywords?: string[]; // keywords for image search
    description?:string; // book desc
}

export interface LiteraryQuoteCSV{
     time:string; // Time
      timezone:string; // ?? attributes
      quote_en:string; // original quote
      quote_zh:string; // translated quote 
      source:string; // book name
      author:string; // author
      sfw:string; // ?? 
}

export type LiteraryQuote = LiteraryQuoteCSV & LiteraryQuoteGemini & LiteraryQuoteUnsplash;

export interface Postcard {
  id: string;
  imageUrl: string;
  quote: LiteraryQuote;
  capturedAt: string;
  location?: string;
  username: string;
}
