
export enum ImageType {
  MAIN = 'Main Image',
  LIFESTYLE_1 = 'Lifestyle 1',
  LIFESTYLE_2 = 'Lifestyle 2',
  INFOGRAPHIC_1 = 'Infographic 1',
  INFOGRAPHIC_2 = 'Infographic 2',
  INFOGRAPHIC_3 = 'Infographic 3',
  COMPARISON = 'Comparison Image',
  BRAND_STORY = 'Brand Story'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ProductAnalysis {
  category: string;
  useCase: string;
  targetCustomer: string;
  keyBenefits: string[];
  materials: string;
  dimensions: string;
  colorPalette: string[];
  brandTone: string;
  competitorInsights: string;
  suggestedAesthetics: string;
  visualDescription: string;
  groundingSources?: GroundingSource[];
  extractedImageUrls?: string[];
}

export interface ListingImage {
  id: string;
  type: ImageType;
  title: string;
  headline: string;
  subCopy: string;
  visualPrompt: string;
  creativeBrief: string;
  generatedImageUrl?: string;
  versions: string[]; // Stores history of all generated URLs for this brief
  isLoading?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  input: string;
  type: 'url' | 'asin' | 'image';
  analysis: ProductAnalysis;
  referenceImage?: string;
  images: ListingImage[];
}

export interface AppState {
  step: 'input' | 'analyzing' | 'results';
  activeHistoryId?: string; // Tracks which history item is currently being viewed/edited
  analysis?: ProductAnalysis;
  images: ListingImage[];
  error?: string;
  referenceImage?: string;
  history: HistoryItem[];
  hasApiKey: boolean;
  inputSource?: {
    type: 'url' | 'asin' | 'image';
    value: string;
  };
}
