# html5canvas
html5 canvas experiments

## Gravity experiment ##
On any page, type F12 (chrome) and paste the code in js/main.js in the console.
A button appears. Press the button :) (it will make the paint start dripping)

![Demo](https://raw.github.com/jumpifzero/html5canvas/master/gravity/img/demo.png)

TODO:
- On a large page it shows slow animation speed.

Working principle:
- A screenshot of the webpage is taken with html2canvas and set as the whole document. A bluring algorithm then animates the canvas.

Limitations:
- All limitations of html2canvas (no iframes, no flash screenshots, etc.)
- On some sites, html2canvas is not loaded due to CSP restrictions.