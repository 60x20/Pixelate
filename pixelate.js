'use strict';

// width and height will be set programmatically (if set bigger than necessary, performance issues will arise)
const offscreenCanvas = new OffscreenCanvas(1, 1);
const offscreenContext = offscreenCanvas.getContext('2d', { willReadFrequently: true });

const imageForm = document.getElementById('image-input-form');

const inputImage = document.getElementById('image-input');
const resultImage = document.getElementById('image-result');

// extract input data
imageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = Object.fromEntries(new FormData(e.currentTarget));
  const inputImageFile = formData['image-file'];
  const pixelSize = parseInt(formData['pixel-size']);
  
  // if it's not an image file (type === image/*) don't continue
  const imageInTheBeginningRegex = /^image/;
  if (!imageInTheBeginningRegex.test(inputImageFile.type)) throw new Error('file should be an image file');

  startPixelating(inputImageFile, pixelSize);
});

async function startPixelating(imageFile, pixelSize) {
  // since order is important, awaits are used;
  // image object version will be used to get the dimensions, and will also be rendered onto the off-scren canvas
  const inputImageAsObject = await convertImageFileIntoImageObject(imageFile);
  makeTheImageDimensionsAMultiple(inputImageAsObject, pixelSize);
  const inputImageAsData = convertImageObjectIntoImageData(inputImageAsObject);
  const pixelatedVersion = pixelateImageData(inputImageAsData, pixelSize);

  // render
  inputImage.src = inputImageAsObject.src;
  resultImage.src = await convertImageDataIntoObjectUrl(pixelatedVersion);
}

async function convertImageFileIntoImageObject(imageFile) {
  const fileAsDataURL = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.addEventListener('load', () => {
      resolve(reader.result);
    });
  });
  const imageObj = new Image();
  imageObj.src = fileAsDataURL;
  // since loading the data into the image obj takes some time, we need to use load events, otherwise width and height are '0'
  await new Promise((resolve) => {
    imageObj.addEventListener('load', resolve);
  });

  return imageObj;
}

function makeTheImageDimensionsAMultiple(imageObject, pixelSize) {
  // making the dimensions a multiple of pixelSize, either through equalizing (= first multiple) or removing remainder (= closest multiple)
  // width
  imageObject.width = pixelSize <= imageObject.naturalWidth
    ? imageObject.naturalWidth - (imageObject.naturalWidth % pixelSize)
    : pixelSize
  ;
  // height
  imageObject.height = pixelSize <= imageObject.naturalHeight 
    ? imageObject.naturalHeight - (imageObject.naturalHeight % pixelSize)
    : pixelSize
  ;
}

function convertImageObjectIntoImageData(imageObject) {
  // setting width and height of the canvas from image object, for optimization purposes
  ({ width: offscreenCanvas.width, height: offscreenCanvas.height } = imageObject);
  offscreenContext.drawImage(imageObject, 0, 0, imageObject.width, imageObject.height);
  return offscreenContext.getImageData(0, 0, imageObject.width, imageObject.height);
}

async function convertImageDataIntoObjectUrl(imageData) {
  // setting width and height of the canvas from image data, for optimization purposes
  ({ width: offscreenCanvas.width, height: offscreenCanvas.height } = imageData);
  offscreenContext.putImageData(imageData, 0, 0);
  return URL.createObjectURL(await offscreenCanvas.convertToBlob());
}

// divide into groups of pixelSize pixels, and select the middle pixel, and replace the group with it
function pixelateImageData(imageData, pixelSize) {
  const {
    width: dimensionW,
    height: dimensionH
  } = imageData;
  
  const
    pixelatedDimensionW = dimensionW / pixelSize,
    pixelatedDimensionH = dimensionH / pixelSize
  ;

  const pixelatedVersion = new ImageData(pixelatedDimensionW, pixelatedDimensionH);
  let pixelatedVersionPixelIndex = 0;

  const distanceBetweenCenterAndFirst = Math.floor((pixelSize - 1) / 2)
  // by starting at the center, we are always selecting the pixels at the center
  for (let y = distanceBetweenCenterAndFirst; y < dimensionH; y += pixelSize) {
    for (let x = distanceBetweenCenterAndFirst; x < dimensionW; x += pixelSize) {
      // a pixel consists of 4 parts, so multiplied by 4
      const indexOfCenterOfGroup = (y * dimensionW + x) * 4;
      const
        centerR = imageData.data[indexOfCenterOfGroup],
        centerG = imageData.data[indexOfCenterOfGroup + 1],
        centerB = imageData.data[indexOfCenterOfGroup + 2],
        centerA = imageData.data[indexOfCenterOfGroup + 3]
      ;
      pixelatedVersion.data[pixelatedVersionPixelIndex] = centerR;
      pixelatedVersion.data[pixelatedVersionPixelIndex + 1] = centerG;
      pixelatedVersion.data[pixelatedVersionPixelIndex + 2] = centerB;
      pixelatedVersion.data[pixelatedVersionPixelIndex + 3] = centerA;
      pixelatedVersionPixelIndex += 4;
    }
  }

  return pixelatedVersion;
}