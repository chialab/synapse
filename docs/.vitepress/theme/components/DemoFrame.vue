<script setup>
import { withBase } from 'vitepress';
</script>

<template>
    <div class="demo-frame">
        <div class="demo-frame-bar">
            <span class="demo-frame-dot demo-frame-dot-red" />
            <span class="demo-frame-dot demo-frame-dot-yellow" />
            <span class="demo-frame-dot demo-frame-dot-green" />
            <span class="demo-frame-title">demo</span>
        </div>
        <iframe
            class="demo-frame-iframe"
            :src="withBase('/demo/')"
            title="Synapse routing demo"
            loading="lazy" />
    </div>
</template>

<style scoped>
.demo-frame {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--vp-c-bg-soft);
}

.demo-frame-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background-color: var(--vp-c-bg-soft);
    border-bottom: 1px solid var(--vp-c-divider);
}

.demo-frame-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--vp-c-divider);
}

.demo-frame-dot-red {
    background-color: #ff5f56;
}

.demo-frame-dot-yellow {
    background-color: #ffbd2e;
}

.demo-frame-dot-green {
    background-color: #27c93f;
}

.demo-frame-title {
    margin-left: 8px;
    font-size: 12px;
    color: var(--vp-c-text-2);
}

.demo-frame-iframe {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    height: 512px;
    border: none;
    background-color: var(--vp-c-bg);
}
</style>
