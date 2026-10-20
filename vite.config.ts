import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig(()=>({base: process.env.BASE_PATH || '/',plugins:[react(),VitePWA({registerType:'prompt',includeAssets:['icons/icon.svg'],manifest:{name:'Tri-TON Audio Player',short_name:'Tri-TON Audio',description:'音楽練習・英語リスニング・オーディオブック用プレーヤー',theme_color:'#0b1220',background_color:'#0b1220',display:'standalone',start_url:'.',scope:'.',icons:[{src:'icons/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,png,ico}']}})]}));
