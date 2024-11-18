<script setup lang="ts">
import { ref } from 'vue';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
const url = ref('');
const targetContainer = ref('');
const height = ref('');
const width = ref('');
const maxFileSize = ref('');
const type = ref<'listing' | 'detail'>();
const results = ref<any[]>([]);
const isLoading = ref(false);

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const crawlPage = async () => {
    if (!url.value) return;

    isLoading.value = true;
    try {
        const response = await fetch('/api/crawl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url.value,
                type: type.value,
                targetContainer: targetContainer.value,
                overrides: {
                    height: height.value,
                    width: width.value,
                    maxFileSize: maxFileSize.value,
                },
            })
        });

        const data = await response.json();
        results.value = [data];
    } catch (error) {
        console.error('Error:', error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div>
        <h1>Product Image Crawler</h1>

        <form class="w-full h-fit max-w-96 relative">
            <label class="block">
                <span class="block text-sm font-medium">Enter Page URL</span>
                <Input v-model="url"
                       type="url"
                       placeholder="https://example.com/product-page"
                       class="w-full pl-3 bg-background border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                              focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                              disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                              invalid:border-pink-500 invalid:text-pink-600
                              focus:invalid:border-pink-500 focus:invalid:ring-pink-500
                            "/>
            </label>

            <label class="block">
                <span class="block text-sm font-medium">Target Container</span>
                <Input v-model="targetContainer"
                       type="text"
                       placeholder="Enter a target containers CSS selector"
                       class="w-full pl-3 bg-background border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                              focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                              disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                              invalid:border-pink-500 invalid:text-pink-600
                              focus:invalid:border-pink-500 focus:invalid:ring-pink-500
                            "/>
            </label>


            <div class="mb-4">
                <Select  v-model="type">
                    <SelectTrigger>
                        <SelectValue placeholder="Configuration Setting:" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Select a Page Type:</SelectLabel>
                            <SelectItem value="listing">Listing Page</SelectItem>
                            <SelectItem value="detail">Details Page</SelectItem>
                            <SelectItem value="overrides">Override Defaults</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div v-if="type === 'overrides'" class="space-y-4 inline-flex justify-center items-baseline">
                <label class="block w-1/3 m-0.5">
                    <span class="block text-sm font-medium">Height</span>
                    <Input v-model="height"
                           type="number"
                           placeholder="Enter a width"
                           class="w-full pl-3 bg-background border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                              focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                              disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                              invalid:border-pink-500 invalid:text-pink-600
                              focus:invalid:border-pink-500 focus:invalid:ring-pink-500
                            "/>
                </label>
                <label class="block w-1/3 m-0.5">
                    <span class="block text-sm font-medium">Width</span>
                    <Input v-model="width"
                           type="number"
                           placeholder="Enter a width"
                           class="w-full pl-3 bg-background border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                              focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                              disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                              invalid:border-pink-500 invalid:text-pink-600
                              focus:invalid:border-pink-500 focus:invalid:ring-pink-500
                            "/>
                </label>
                <label class="block w-1/3 m-0.5">
                    <span class="block text-sm font-medium">Max File SIze</span>
                    <Input v-model="maxFileSize"
                           type="number"
                           placeholder="Enter max file size"
                           class="w-full pl-3 bg-background border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                              focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                              disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                              invalid:border-pink-500 invalid:text-pink-600
                              focus:invalid:border-pink-500 focus:invalid:ring-pink-500
                            "/>
                </label>
            </div>

            <Button
                @click="crawlPage"
                :disabled="isLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {{ isLoading ? 'Crawling...' : 'Crawl Page' }}
            </Button>
        </form>

        <!-- Results -->
        <div v-if="results.length" class="space-y-4">
            <div v-for="result in results" :key="result.url">
                <div v-if="result.error" class="p-4 bg-red-50 border-red-200 border rounded-lg text-red-600">
                    {{ result.error }}
                </div>

                <template v-else>
                    <h2 class="text-xl font-semibold mb-4">Found {{ result.images?.length }} images on {{ result.url }}</h2>

                    <div v-for="image in result.images" :key="image.url"
                         class="p-4 border rounded-lg bg-white mb-4">
                        <div class="flex items-start gap-4">
                            <div class="w-24 h-24 flex-shrink-0">
                                <img :src="image.url" class="w-full h-full object-cover rounded" :alt="image.url">
                            </div>
                            <div class="flex-1 text-gray-600">
                                <h3 class="font-medium mb-2 break-all">{{ image.url }}</h3>
                                <div class="text-sm text-gray-600 space-y-1">
                                    <p><strong>Dimensions:</strong> {{ image.width }}x{{ image.height }}px</p>
                                    <p><strong>Format:</strong> {{ image.format }}</p>
                                    <p v-if="image.fileSize"><strong>Size:</strong> {{ formatFileSize(image.fileSize) }}</p>
                                </div>

                                <!-- Responsive Sources -->
                                <div v-if="image.responsiveSources?.length" class="mt-4">
                                    <h4 class="font-medium mb-2">Responsive Sources:</h4>
                                    <div v-for="(source, index) in image.responsiveSources"
                                         :key="index"
                                         class="mb-3 pl-4 border-l-2 border-gray-200">
                                        <div class="text-sm text-gray-600">
                                            <p v-if="source.media"><strong>Media Query:</strong> {{ source.media }}</p>
                                            <p v-if="source.type"><strong>Type:</strong> {{ source.type }}</p>
                                            <div class="mt-1">
                                                <p class="font-medium">Variants:</p>
                                                <ul class="pl-4">
                                                    <li v-for="variant in source.sources" :key="variant.url">
                                                        {{ variant.width }}x{{ variant.height }}px
                                                        ({{ variant.format }})
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ul v-if="image.issues?.length" class="mt-2 space-y-1">
                                    <li v-for="issue in image.issues" :key="issue"
                                        class="text-sm text-red-600">
                                        ⚠️ {{ issue }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>