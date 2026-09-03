import type { Area } from "react-easy-crop";

export async function cropImageToWebp(
  source: string,
  crop: Area,
  rotation = 0,
  outputSize = 1024,
) {
  const image = await loadImage(source);
  const radians = (rotation * Math.PI) / 180;
  const rotatedWidth =
    Math.abs(Math.cos(radians) * image.width) +
    Math.abs(Math.sin(radians) * image.height);
  const rotatedHeight =
    Math.abs(Math.sin(radians) * image.width) +
    Math.abs(Math.cos(radians) * image.height);

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = Math.ceil(rotatedWidth);
  sourceCanvas.height = Math.ceil(rotatedHeight);
  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) {
    throw new Error("Votre navigateur ne peut pas préparer cette photo.");
  }

  sourceContext.translate(sourceCanvas.width / 2, sourceCanvas.height / 2);
  sourceContext.rotate(radians);
  sourceContext.translate(-image.width / 2, -image.height / 2);
  sourceContext.drawImage(image, 0, 0);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = outputSize;
  outputCanvas.height = outputSize;
  const outputContext = outputCanvas.getContext("2d");
  if (!outputContext) {
    throw new Error("Votre navigateur ne peut pas préparer cette photo.");
  }
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = "high";
  outputContext.drawImage(
    sourceCanvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("La photo recadrée n’a pas pu être créée."));
      },
      "image/webp",
      0.9,
    );
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("La photo n’a pas pu être chargée pour le recadrage."));
    image.src = source;
  });
}
