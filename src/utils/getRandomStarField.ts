import * as THREE from "three";

export default function getRandomStarField(
  numberOfStars: number,
  width: number = window.innerWidth,
  height: number = window.innerHeight
) {
  var canvas = document.createElement('CANVAS') as HTMLCanvasElement;

	canvas.width = width;
	canvas.height = height;

	var ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

	ctx.fillStyle="black";
	ctx.fillRect(0, 0, width, height);

	for (var i = 0; i < numberOfStars; ++i) {
		var radius = Math.random() * 2;
		var x = Math.floor(Math.random() * width);
		var y = Math.floor(Math.random() * height);

		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'white';
		ctx.fill();
	}

	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;
	return texture;
};

