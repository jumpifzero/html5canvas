/**
* 
*/
(function(){
	/**
	* Returns a function that knows how to get the pixel at i,j
	* from the image with specified width
	**/
	function makePixelIndexer(width){
		return function(i,j){
			var index = j*(width*4) + i*4;
			//index points to the R chanel of pixel 
			//at column i and row j calculated from top left
			return index;
		};
	}
	/**
	* Each pixel column is blured at a different speed.
	* These speeds somehow follow a sine (left is faster than middle)
	* with some randomness added. This function returns the array
	* with the speeds used.
	**/
	function makeRandomSpeeds(imageWidth){
		var speeds = new Array(); //will be filled
		var twoPi = 6.28318;
		/* Map oldValue in range [oldBottom,oldTop] to range [newBottom,newTop]*/
		var fMapToNewRange = function(oldValue, oldBottom, oldTop, newBottom, newTop){
			var newValue = 	(oldValue - oldBottom) / 
							(oldTop - oldBottom) *
							(newTop - newBottom) + 
							newBottom;
			return newValue;
		};
		/*overlays speeds 1D array with values of iFullWaves contained (frequncy)*/
		var fSineWave = function(iFullWaves){
			var step = iFullWaves * twoPi / imageWidth;
			for (var i=0; i<imageWidth; i++) {
				speeds[i] += Math.sin(step*i);
			}
		};
		//init with zeros
		for (var i=0; i<imageWidth; i++) {
			speeds[i] = 0;
		}
		//overlay a couple of sines with different frequencies
		fSineWave(1);
		//fSineWave(16);
		//map to new range [0,1] and add a small random
		for (var i=0; i<imageWidth; i++) {
			speeds[i] = fMapToNewRange(
				speeds[i] + fMapToNewRange(Math.random(), 0, 1, 0, 0.4),
				-1,2,0,0.5);
		}
		return speeds;
	}
	/**
	* Returns a function tied to the canvas. 
	* This functions changes the canvas making as if paint was not dry
	**/
	function makeCanvasPainter(canvas){
		var imageWidth = canvas.width;
	    var imageHeight = canvas.height;
	    var context = canvas.getContext('2d');
		var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
	    var data = imageData.data;
	    var fIndex = makePixelIndexer(imageWidth);
	    var dripSpeed = makeRandomSpeeds(imageWidth);
	    var frameMeter = {
	    	point:function(){ 
	    		this._l = this._c;
	    		this._c = (new Date()).getTime(); },
	    	fps:function(){
	    		return 1/(this._c-this._l)*1000;
	    	}};
	    frameMeter.point();
		return function(){
			// iterate over all pixels
	        for(var i = 0, n = data.length; i < n; i += 4) {
	          //set all transparent to white
	          if(data[i+3]==0){
	          	data[i+0] = 255;
	          	data[i+1] = 255;
	          	data[i+2] = 255;
	          	data[i+3] = 255;
	          }
	        }
	        //iterate on all pixel columns starting from bottom
	        for(var i=0 ; i<imageWidth ; i++) {
	        	var columnSpeed = dripSpeed[i];
		        for(var j=imageHeight ; j>0 ; j--){
		        	var pixelIdx = fIndex(i,j);
		        	var pixel = {
		        		r: data[ pixelIdx ],
			        	g: data[ pixelIdx + 1 ],
			        	b: data[ pixelIdx + 2 ]
		        	};
		        	//read pixel above and average it with current pixel, to get current pixel
		        	var abovePixelIdx = fIndex(i,j-1);
		        	var abovePixel = {
		        		r: data[ abovePixelIdx ],
		        		g: data[ abovePixelIdx + 1 ],
		        		b: data[ abovePixelIdx + 2 ]
		        	};
		        	pixel.r = pixel.r * (1-columnSpeed) + abovePixel.r * columnSpeed;
		        	pixel.g = pixel.g * (1-columnSpeed) + abovePixel.g * columnSpeed;
		        	pixel.b = pixel.b * (1-columnSpeed) + abovePixel.b * columnSpeed;
		        	//store the pixel
		        	data[ pixelIdx ] = pixel.r;
		        	data[ pixelIdx + 1 ] = pixel.g;
		        	data[ pixelIdx + 2 ] = pixel.b;
		        }
		    }
	        context.putImageData(imageData,0,0);
	        frameMeter.point();
	        console.log("fps: " + frameMeter.fps() + 
	        			" time/frame(ms): " + (frameMeter._c - frameMeter._l) );
		};
	}

	function drawCircle(x0, y0, radius, canvas){
	  var x = radius;
	  var y = 0;
	  var decisionOver2 = 1 - x;   // Decision criterion divided by 2 evaluated at x=r, y=0
	  var imageWidth = canvas.width;
	  var imageHeight = canvas.height;
	  var context = canvas.getContext('2d');
	  var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
	  var pixelData = imageData.data;
	  var makePixelIndexer = function(width){
			return function(i,j){
				var index = j*(width*4) + i*4;
				//index points to the R chanel of pixel 
				//at column i and row j calculated from top left
				return index;
			};
	  }
	  var pixelIndexer = makePixelIndexer(imageWidth);
	  var drawPixel = function(x,y){
	  	 var idx = pixelIndexer(x,y);
	  	 pixelData[idx] = 255;	//red
	  	 pixelData[idx+1] = 0;	//green
	  	 pixelData[idx+2] = 255;//blue
	  	 pixelData[idx+3] = 255;//alpha
	  };
	  while(x >= y){
	    drawPixel( x + x0,  y + y0);
	    drawPixel( y + x0,  x + y0);
	    drawPixel(-x + x0,  y + y0);
	    drawPixel(-y + x0,  x + y0);
	    drawPixel(-x + x0, -y + y0);
	    drawPixel(-y + x0, -x + y0);
	    drawPixel( x + x0, -y + y0);
	    drawPixel( y + x0, -x + y0);
	    y++;
	    if (decisionOver2<=0){
	      decisionOver2 += 2 * y + 1;   // Change in decision criterion for y -> y+1
	    }else{
	      x--;
	      decisionOver2 += 2 * (y - x) + 1;   // Change for y -> y+1, x -> x-1
	    }
	  }
	  context.putImageData(imageData,0,0);
	}
	/**
	* 	Take screenshot of page as canvas, set it as document body.
	*	Launch a periodic routine to animate the canvas
	**/
	function startMadness(){
		html2canvas(document.body, {
		  onrendered: function(canvas){
		    var $body = jQuery(document.body);
		    $body.empty();
		    $body.css('margin','0');
		    $body.css('padding','0');
		    $body.css('overflow-x','hidden');
		    document.body.appendChild(canvas);
		    setInterval(makeCanvasPainter(canvas),100);
		  }
		});
	}
	function loadMap(){
		var img = new Image();
		img.crossOrigin = "Anonymous";
		var canvas = document.getElementById('gameArena');
  		var context = canvas.getContext('2d');
		img.onload = function() {
	        context.drawImage(img, 0, 0);
	        drawCircle(250,250,100,canvas);
	      };
	    img.src = 'maps/crazymission/map.png';
	}
	/**
	* 
	*/
	function drawInterface(){
		loadMap();

	}
	//load jquery if not there
	if( !window.jQuery ){
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = false;
	   	 ga.onload = function(){
	    	//now that jquery is loaded, continue loading html2canvas
	    	drawInterface();
	    };
	    ga.src = '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	}else{
		jQuery(document).ready(function(){
			drawInterface();
		});
	}
})();