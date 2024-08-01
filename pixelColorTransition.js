'use strict';

// width and height will be set programmatically
const offscreenCanvas = new OffscreenCanvas(1, 1);
const offscreenContext = offscreenCanvas.getContext('2d', { wilReadFrequently: true });
const imageForm = document.getElementById('image-input-form');
// extract input data
imageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = Object.fromEntries(new FormData(e.currentTarget));
  const inputImageFile = formData['image-file'];
  const pixelSize = Number(formData['pixel-size']);
  
  // if it's not an image file (type === image/*) don't continue
  const imageInTheBeginningRegex = /^image/;
  if (!imageInTheBeginningRegex.test(inputImageFile.type)) throw new Error('file should be an image file');

  startPixelating(inputImageFile, pixelSize);
})

async function startPixelating(imageFile, pixelSize) {
  // since order is important, awaits are used;
  // image object version will be used to get the dimensions, and will also be rendered onto the off-scren canvas
  const inputImageAsObject = await convertImageFileIntoImageObject(imageFile);
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
