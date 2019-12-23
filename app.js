// selecting the tags
const img = document.getElementById('img');
const loading = document.getElementById('loading');
const predictionsDiv = document.getElementById('predictions');
//selecting canvas
const c = document.getElementById('canvas');
//creating context for canvas (whether it's 2d or 3d)
const context = c.getContext('2d');

//hide the predictions, loading spinner and canvas when the page is initially loaded
predictionsDiv.style.display = 'none';
loading.style.display = 'none';
c.style.visibility = 'hidden';

//onchange listener for the input tag
document.getElementById('image-input').onchange = function(evt) {
	// set the list elements inside the predictions to null whenever a new image is inputted
	document.getElementById('list').innerHTML = '';
	// set the predictions div display to none whenever a new image is inputted
	predictionsDiv.style.display = 'none';
	// show the loading spinner whenever a new image is inputted until the predictions are made
	loading.style.display = 'inline-block';
	// hide canvas whenever a new image is inputted
	c.style.visibility = 'hidden';

	// used to load the image file from our input tag usinf filereader, etc
	var tgt = evt.target || window.event.srcElement,
		files = tgt.files;

	// FileReader support
	if (FileReader && files && files.length) {
		var fr = new FileReader();
		fr.onload = function() {
			//setting the image tag src to the inputted image's source from file reader
			document.getElementById('img').src = fr.result;
		};

		fr.readAsDataURL(files[0]);

		// load the tensorflow cocossd object detection model
		cocoSsd.load().then(model => {
			// detect objects in the image.
			model.detect(img).then(predictions => {
				//change the elements visibility as required
				loading.style.display = 'none';
				c.style.visibility = 'visible';
				// used to draw image using canvas from our image tag
				context.drawImage(img, 0, 0, img.width, img.height);
				// setting the canvas font styles
				context.font = 'bold 15px Arial';

				if (predictions.length > 0) {
					// firing up the predictions div and it's elements
					predictionsDiv.style.display = 'block';
					document.getElementById(
						'summary'
					).innerText = `${predictions.length} objects detected!`;
					// iterating over the predictions
					for (let i = 0; i < predictions.length; i++) {
						// used to draw the rectangle
						context.beginPath();
						context.rect(...predictions[i].bbox);
						context.lineWidth = 3;
						context.strokeStyle = 'green';
						context.fillStyle = 'blue';
						context.stroke();
						context.fillText(
							Math.floor(predictions[i].score * 100) +
								'%' +
								' ' +
								predictions[i].class,
							predictions[i].bbox[0],
							predictions[i].bbox[1] > 10
								? predictions[i].bbox[1] - 5
								: 10
						);

						// creating li elements for each predictions
						var node = document.createElement('li');
						var textnode = document.createTextNode(
							`Found ${predictions[i].class} with ${Math.floor(
								predictions[i].score * 100
							)}% confidence.`
						);
						node.appendChild(textnode);
						document.getElementById('list').appendChild(node);
					}
				} else {
					predictionsDiv.style.display = 'block';
					document.getElementById('summary').innerText =
						'No objects are predicted';
				}
			});
		});
	}
};
