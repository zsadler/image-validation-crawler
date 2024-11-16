import axios from 'axios';
import * as cheerio from 'cheerio';
import probe from 'probe-image-size';
import type { CrawlRequest, ImageInfo, CrawlResponse } from '../types';

export class ImageCrawler {
    private static readonly LISTING_MIN_SIZE = 800;
    private static readonly DETAIL_MIN_SIZE = 1500;
    private static readonly LISTING_MAX_SIZE = 200 * 1024; // 200KB
    private static readonly DETAIL_MAX_SIZE = 500 * 1024;  // 500KB

    static async crawlPage(request: CrawlRequest): Promise<CrawlResponse> {
        try {
            const response = await axios.get(request.url);
            const $ = cheerio.load(response.data);
            const imageUrls = new Set<string>();

            // Find all img tags
            $('img').each((_, element) => {
                const src = $(element).attr('src');
                if (src) imageUrls.add(this.resolveUrl(src, request.url));
            });

            // Find background images in styles
            $('[style*="background"]').each((_, element) => {
                const style = $(element).attr('style');
                if (style) {
                    const matches = style.match(/url\(['"]?(.*?)['"]?\)/);
                    if (matches && matches[1]) {
                        imageUrls.add(this.resolveUrl(matches[1], request.url));
                    }
                }
            });

            // Process each image
            const images: ImageInfo[] = await Promise.all(
                Array.from(imageUrls).map(url => this.analyzeImage(url, request.type))
            );

            return {
                url: request.url,
                images: images.filter(img => img !== null)
            };
        } catch (error) {
            return {
                url: request.url,
                images: [],
                error: `Failed to crawl page: ${(error as Error).message}`
            };
        }
    }

    private static async analyzeImage(url: string, type: 'listing' | 'detail'): Promise<ImageInfo> {
        try {
            const imageInfo = await probe(url);
            const response = await axios.head(url);
            const fileSize = parseInt(response.headers['content-length'] || '0');

            const issues: string[] = [];
            const minSize = type === 'listing' ? this.LISTING_MIN_SIZE : this.DETAIL_MIN_SIZE;
            const maxFileSize = type === 'listing' ? this.LISTING_MAX_SIZE : this.DETAIL_MAX_SIZE;

            // Validate dimensions
            if (imageInfo.width !== imageInfo.height) {
                issues.push(`Image should be square (currently ${imageInfo.width}x${imageInfo.height})`);
            }
            if (imageInfo.width < minSize || imageInfo.height < minSize) {
                issues.push(`Image should be at least ${minSize}x${minSize}px`);
            }

            // Validate file size
            if (fileSize > maxFileSize) {
                issues.push(`File size (${Math.round(fileSize / 1024)}KB) exceeds ${Math.round(maxFileSize / 1024)}KB limit`);
            }

            return {
                url,
                width: imageInfo.width,
                height: imageInfo.height,
                fileSize,
                type,
                issues
            };
        } catch (error) {
            return {
                url,
                width: 0,
                height: 0,
                fileSize: 0,
                type,
                issues: [`Failed to analyze image: ${(error as Error).message}`]
            };
        }
    }

    private static resolveUrl(src: string, baseUrl: string): string {
        try {
            return new URL(src, baseUrl).href;
        } catch {
            return src;
        }
    }
}