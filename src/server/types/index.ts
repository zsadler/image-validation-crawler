export interface CrawlRequest {
    url: string;
    type: 'listing' | 'detail';
}

export interface ImageInfo {
    url: string;
    width: number;
    height: number;
    fileSize: number;
    type: 'listing' | 'detail';
    issues: string[];
}

export interface CrawlResponse {
    url: string;
    images: ImageInfo[];
    error?: string;
}