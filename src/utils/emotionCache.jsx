import createCache from "@emotion/cache";

// هذا الكاش يضمن أن Emotion يضيف الأنماط في المكان الصحيح داخل <head>
export default function createEmotionCache() {
  return createCache({ key: "css", prepend: true });
}
