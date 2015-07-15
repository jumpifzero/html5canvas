/**
* http://elynxsdk.free.fr/ext-docs/Blur/Fast_box_blur.pdf
*/
(function(){
	function makePixelIndexer(width){
		return function(i,j){
			var index = j*(width*4) + i*4;
			//index points to the R chanel of pixel at column i and row j calculated from top left
			return index;
		};
	}
	function pixel(i,j,imageData){
		return 
	}
	function makeCanvasPainter(canvas){
		return function(){
			var imageWidth = canvas.width;
	        var imageHeight = canvas.height;
			var context = canvas.getContext('2d');
			var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
	        var data = imageData.data;
	        var fIndex = makePixelIndexer(imageWidth);
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
		        	pixel.r = pixel.r * 0.6 + abovePixel.r * 0.4;
		        	pixel.g = pixel.g * 0.6 + abovePixel.g * 0.4;
		        	pixel.b = pixel.b * 0.6 + abovePixel.b * 0.4;
		        	//store the pixel
		        	data[ pixelIdx ] = pixel.r;
		        	data[ pixelIdx + 1 ] = pixel.g;
		        	data[ pixelIdx + 2 ] = pixel.b;
		        }
		    }
	        context.putImageData(imageData,0,0);
		};
	}
	function scr(){
		html2canvas(document.body, {
		  onrendered: function(canvas) {
		    var $body = $(document.body);
		    $body.empty();
		    $body.addClass('nomargin');
		    $body.addClass('nopadding');
		    //$body.appendChild(canvas);
		    document.body.appendChild(canvas);
		    setInterval(makeCanvasPainter(canvas),200);
		  },
		  width: 300,
		  height: 300
		});
	}

	//load jquery if not there
	if(!window.jQuery){
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = false;
	    ga.src = 'http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	}

	$(document).ready(function(){
		//load html2canvas
		jQuery.getScript('http://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.js',function(){
			$('body').append(function() {
			  return $('<button style="position: absolute; bottom: 10px; right: 10px;">Click here</button>').click(function(){scr();});
			});
		});
	});
})();