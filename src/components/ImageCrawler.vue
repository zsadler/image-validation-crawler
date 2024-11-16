<script setup lang="ts">
import { ref } from 'vue';

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
        <h1 class="text-2xl font-bold mb-6">Product Image Crawler</h1>

        <div class="mb-6">
            <label class="block mb-2 font-medium">Enter Product Page URL</label>
            <input
                v-model="url"
                type="url"
                class="w-full p-3 border rounded-lg mb-2"
                placeholder="https://example.com/product-page"
            />

            <div class="mb-4">
                <label class="block mb-2 font-medium">Page Type</label>
                <select v-model="type" class="p-2 border rounded">
                    <option value="listing">Listing Page</option>
                    <option value="detail">Detail Page</option>
                </select>
            </div>

            <button
                @click="crawlPage"
                :disabled="isLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {{ isLoading ? 'Crawling...' : 'Crawl Page' }}
            </button>
        </div>

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