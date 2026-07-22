const generalOptimizedImages: Record<string, string> = {
  "/assets/jaana-wordmark.png": "/assets/optimized/jaana-wordmark.webp",
  "/assets/us-reunion-banquet-2019.jpg": "/assets/optimized/us-reunion-banquet-2019.webp",
  "/assets/us-reunion-pavilion-2016.jpg": "/assets/optimized/us-reunion-pavilion-2016.webp",
  "/assets/us-reunion-tent-2018.jpg": "/assets/optimized/us-reunion-tent-2018.webp"
};

const optimizableImageExtensionPattern = /\.(jpe?g|png)$/i;

function optimizedPathForFolder(src: string, folder: string) {
  if (!src.startsWith(folder) || src.includes("/optimized/") || !optimizableImageExtensionPattern.test(src)) {
    return "";
  }

  const filename = src.slice(folder.length).replace(optimizableImageExtensionPattern, ".webp");

  return `${folder}optimized/${filename}`;
}

export function optimizedImageSrc(src: string) {
  if (generalOptimizedImages[src]) {
    return generalOptimizedImages[src];
  }

  return (
    optimizedPathForFolder(src, "/assets/merchandise/") ||
    optimizedPathForFolder(src, "/assets/sponsors/") ||
    src
  );
}
