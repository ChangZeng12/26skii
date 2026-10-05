import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// MapLibre v6 默认用 import.meta.url 相对定位 worker 文件，经 Vite 预构建/打包后这个相对路径会失效。
// 让 Vite 把 worker（连同它 import 的 shared 模块）构建成独立产物，再把地址显式交给 MapLibre。
setWorkerUrl(workerUrl);
