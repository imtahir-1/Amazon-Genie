
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

export interface User {
  id: string;
  name: string;
  email: string;
  brandName?: string;
  avatar?: string;
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
  versions: string[]; 
  isLoading?: boolean;
}

export interface HistoryItem {
  id: string;
  userId: string; // Associated with a user
  timestamp: number;
  input: string;
  type: 'url' | 'asin' | 'image' | 'smart';
  analysis: ProductAnalysis;
  referenceImage?: string;
  images: ListingImage[];
}

export interface AppState {
  step: 'login' | 'input' | 'analyzing' | 'results';
  user?: User;
  activeHistoryId?: string;
  analysis?: ProductAnalysis;
  images: ListingImage[];
  error?: string;
  referenceImage?: string;
  history: HistoryItem[]; // Global loaded history for current user
  hasApiKey: boolean;
  inputSource?: {
    type: 'url' | 'asin' | 'image' | 'smart';
    value: string;
  };
}
