'use strict';

// width and height will be set programmatically
const offscreenCanvas = new OffscreenCanvas(1, 1);
const offscreenContext = offscreenCanvas.getContext('2d', { wilReadFrequently: true });
const imageForm = document.getElementById('image-input-form');
