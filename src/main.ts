import './style.css';

import { Velocity } from './velocity';
import { Movement } from './movement';
import { Controls } from './controls';
import { MapScreen } from './map-screen';
import { MainScreen } from './main-screen';

const aspectRatio = 16 / 9;
const map = Object.freeze([
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1,
	1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
]);

// Ensure the canvas element is present in the HTML before running the main function.
document.addEventListener('DOMContentLoaded', main);

function main(): void {
	// Set up graphics screens.
	const mainScreen = new MainScreen(map, aspectRatio);
	const mapScreen = new MapScreen(aspectRatio);

	// Setup canvas sizing and update on window resize.
	const updateCanvasSize = () => {
		// Ensure the canvas fits inside the window while maintaining the aspect ratio.
		const ratio = window.innerWidth / window.innerHeight;
		let width: number = 0;
		let height: number = 0;
		if (ratio < aspectRatio) {
			width = window.innerWidth;
			height = window.innerWidth / aspectRatio;
		} else {
			width = window.innerHeight * aspectRatio;
			height = window.innerHeight;
		}

		mainScreen.updateCanvasSize(width, height);
		mapScreen.updateCanvasSize(width, height);
	};
	updateCanvasSize();
	window.addEventListener('resize', updateCanvasSize);

	// Setup controls and movement.
	const controls = new Controls();
	const rotation = new Movement(0.005, 0.05, 0.9);
	const acc = new Velocity(0.01, 0.1, 0.9);
	let pos = {
		x: 0,
		y: 0,
	};

	// Setup update loop.
	const update = () => {
		// Update controls and movement.
		rotation.update(controls.isLeftPressed(), controls.isRightPressed());
		acc.update(controls.isUpPressed(), controls.isDownPressed());
		pos.x += Math.cos(rotation.getValue() + Math.PI / 2) * acc.getValue();
		pos.y += Math.sin(rotation.getValue() + Math.PI / 2) * acc.getValue();

		// Update graphics.
		mainScreen.update( rotation.getValue(), pos );
		mapScreen.update( rotation.getValue(), pos );

		requestAnimationFrame(update);
	};
	requestAnimationFrame(update);
}
