import axios from 'axios';
import * as cheerio from 'cheerio';
import probe from 'probe-image-size';
import type { CrawlRequest, ImageInfo, CrawlResponse, SourceInfo } from '../types';

export class ImageCrawler {
    private static readonly LISTING_MIN_SIZE = 800;
    private static readonly DETAIL_MIN_SIZE = 1500;
    private static readonly LISTING_MAX_SIZE = 200 * 1024; // 200KB
    private static readonly DETAIL_MAX_SIZE = 500 * 1024;  // 500KB


    static async crawlPage(request: CrawlRequest): Promise<CrawlResponse> {
        try {
            const response = await axios.get(request.url);
            const $ = cheerio.load(response.data);
            const $container = request.targetContainer.length ? $(`${request.targetContainer}`) : $('body');
            const imageUrls = new Set<string>();
            const pictureElements = new Map<string, SourceInfo[]>();

            // Find all standard img tags
            $container.find('img').each((_, element) => {
                const src = $(element).attr('src');
                if (src) imageUrls.add(this.resolveUrl(src, request.url));
            });

            // Find background images in styles
            $container.find('[style*="background"]').each((_, element) => {
                const style = $(element).attr('style');
                if (style) {
                    const matches = style.match(/url\(['"]?(.*?)['"]?\)/);
                    if (matches && matches[1]) {
                        imageUrls.add(this.resolveUrl(matches[1], request.url));
                    }
                }
            });

            // Find picture elements
            $container.find('picture').each((_, pictureElement) => {
                const sources: SourceInfo[] = [];
                const img = $(pictureElement).find('img');
                const mainSrc = img.attr('src');
                const mainSrcset = img.attr('srcset');

                // Get all source elements
                $container.find(pictureElement).find('source').each((_, sourceElement) => {
                    const srcset = $(sourceElement).attr('srcset');
                    const media = $(sourceElement).attr('media');
                    const type = $(sourceElement).attr('type');

                    if (srcset) {
                        const sourceUrls = this.parseSrcset(srcset);
                        sources.push({
                            srcset: sourceUrls.map(url => this.resolveUrl(url, request.url)),
                            media: media || '',
                            type: type || ''
                        });
                    }
                });

                // Add main image source if it exists
                if (mainSrc) {
                    imageUrls.add(this.resolveUrl(mainSrc, request.url));
                    if (mainSrcset) {
                        const mainSourceUrls = this.parseSrcset(mainSrcset);
                        sources.push({
                            srcset: mainSourceUrls.map(url => this.resolveUrl(url, request.url)),
                            media: '',
                            type: ''
                        });
                    }
                    pictureElements.set(this.resolveUrl(mainSrc, request.url), sources);
                }
            });

            // Process each image
            const images: ImageInfo[] = await Promise.all(
                Array.from(imageUrls).map(url => this.analyzeImage(url, request.type, pictureElements.get(url)))
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

    private static parseSrcset(srcset: string): string[] {
        return srcset
            .split(',')
            .map(src => src.trim().split(/\s+/)[0]) // Get URL part before width/density descriptor
            .filter(Boolean);
    }

    private static async analyzeImage(
        url: string,
        type: 'listing' | 'detail' | 'override',
        sources?: SourceInfo[]
    ): Promise<ImageInfo> {
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

            // Process responsive sources if they exist
            const responsiveSources = sources ? await this.analyzeResponsiveSources(sources) : undefined;

            return {
                url,
                width: imageInfo.width,
                height: imageInfo.height,
                fileSize,
                type,
                format: imageInfo.type,
                issues,
                responsiveSources
            };
        } catch (error) {
            return {
                url,
                width: 0,
                height: 0,
                fileSize: 0,
                type,
                format: 'unknown',
                issues: [`Failed to analyze image: ${(error as Error).message}`]
            };
        }
    }

    private static async analyzeResponsiveSources(sources: SourceInfo[]): Promise<ResponsiveSourceInfo[]> {
        const analyzedSources: ResponsiveSourceInfo[] = [];

        for (const source of sources) {
            const analyzedSrcset = await Promise.all(
                source.srcset.map(async (url) => {
                    try {
                        const info = await probe(url);
                        return {
                            url,
                            width: info.width,
                            height: info.height,
                            format: info.type
                        };
                    } catch {
                        return { url, width: 0, height: 0, format: 'unknown' };
                    }
                })
            );

            analyzedSources.push({
                media: source.media,
                type: source.type,
                sources: analyzedSrcset
            });
        }

        return analyzedSources;
    }

    private static resolveUrl(src: string, baseUrl: string): string {
        try {
            return new URL(src, baseUrl).href;
        } catch {
            return src;
        }
    }
}