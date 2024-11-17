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
const type = ref<'listing' | 'detail'>('listing');
const results = ref<any[]>([]);
const isLoading = ref(false);

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
                type: type.value
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
                       class="w-full pl-8 bg-background border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
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
                        </SelectGroup>
                    </SelectContent>
                </Select>


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
                            <div class="flex-1">
                                <h3 class="font-medium mb-2 break-all">{{ image.url }}</h3>
                                <div class="text-sm text-gray-600 space-y-1">
                                    <p>Dimensions: {{ image.width }}x{{ image.height }}px</p>
                                    <p v-if="image.fileSize">Size: {{ Math.round(image.fileSize / 1024) }}KB</p>
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