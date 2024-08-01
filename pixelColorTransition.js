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
})
