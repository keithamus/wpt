// DO NOT EDIT! This test has been generated by /html/canvas/tools/gentest.py.
// OffscreenCanvas test in a worker:2d.imageData.createImageBitmap.srgb.rgba.float16
// Description:Verify round-trip of 16-bit float sRGB data ImageData through ImageBitmap
// Note:

importScripts("/resources/testharness.js");
importScripts("/html/canvas/resources/canvas-tests.js");

promise_test(async t => {
  var canvas = new OffscreenCanvas(100, 50);
  var ctx = canvas.getContext('2d', {colorSpace: "srgb", colorType:"float16"});

  const expectedColor = [ 1.0, 2.0, -1.0, 1.0 ];
  var imageData = new ImageData(10, 10, {colorSpace:"srgb", pixelFormat:"rgba-float16"});
  for (let y = 0; y < imageData.height; ++y) {
    for (let x = 0; x < imageData.width; ++x) {
      for (let c = 0; c < 4; ++c) {
        imageData.data[4*(x + y*imageData.width) + c] = expectedColor[c];
      }
    }
  }
  var bitmap = await createImageBitmap(imageData);
  ctx.drawImage(bitmap, 0, 0);
  var pixel = ctx.getImageData(0, 0, 1, 1, {colorSpace:"srgb", pixelFormat:"rgba-float16"});
  for (let c = 0; c < 4; ++c) {
    assert_approx_equals(pixel.data[c], expectedColor[c], 0.01);
  }
}, "Verify round-trip of 16-bit float sRGB data ImageData through ImageBitmap");
done();
