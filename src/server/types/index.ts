export interface CrawlRequest {
    url: string;
    type: 'listing' | 'detail';
    targetContainer: string;
    overrides: {
        height: number;
        width: number;
        maxFileSize: number;
    }[];
}

export interface SourceInfo {
    srcset: string[];
    media: string;
    type: string;
}

export interface ResponsiveSourceInfo {
    media: string;
    type: string;
    sources: {
        url: string;
        width: number;
        height: number;
        format: string;
    }[];
}

export interface ImageInfo {
    url: string;
    width: number;
    height: number;
    fileSize: number;
    type: 'listing' | 'detail' | 'override';
    format: string;
    issues: string[];
    responsiveSources?: ResponsiveSourceInfo[];
}

export interface CrawlResponse {
    url: string;
    images: ImageInfo[];
    error?: string;
}