# Dither.js
A copy-paste of some code from [Surma's dither demo](https://surma.dev/lab/ditherpunk/lab.html) (see [blog post for info](https://surma.dev/things/ditherpunk)) to turn it into its own JS library.

```js
import * as dither from "https://deno.land/x/dither_js@v0.0.3/mod.js"; // see mod.js for the names of the dithering algorithms that are exported
let ditheredImageData = await dither.atkinson(imageData);
```
or:
```js
let dither = await import("https://deno.land/x/dither_js@v0.0.3/mod.js");
let ditheredImageData = await dither.atkinson(imageData);
```
