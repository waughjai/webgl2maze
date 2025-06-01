import './style.css';

import { Velocity } from './velocity';
import { Camera } from './camera';
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
	const camera = new Camera();
	const vx = new Velocity(0.01, 0.1, 0.9);
	const vz = new Velocity(0.01, 0.1, 0.9);
	let pos = {
		x: 0,
		y: 0,
		z: 0,
	};
	let jumpState = 'ground';
	const maxJump = 0.15;
	const jumpAcc = new Velocity(0.1, maxJump, 0.9);

	// Setup update loop.
	const update = () => {
		// Update controls and movement.
		vx.update(controls.isRightPressed(), controls.isLeftPressed());
		vz.update(controls.isDownPressed(), controls.isUpPressed());
		pos.x += vx.getValue();
		pos.z += vz.getValue();

		if (controls.isZPressed() && jumpState === 'ground') {
			jumpState = 'jumping';
		}

		if (jumpState === 'jumping') {
			const stillJumping = controls.isZPressed() && jumpAcc.getValue() < maxJump;
			jumpAcc.update(stillJumping, false);
			pos.y += jumpAcc.getValue();
			if (!stillJumping) {
				jumpState = 'falling';
			}
		}

		if (jumpState === 'falling') {
			jumpAcc.update(false, jumpAcc.getValue() < 0.05);
			pos.y += jumpAcc.getValue();
			if (pos.y < 0) {
				pos.y = 0;
				jumpState = 'ground';
				jumpAcc.setValue(0);
			}
		}
		camera.update(controls);
		camera.follow(pos);

		// Update graphics.
		mainScreen.update( 0, pos, camera, aspectRatio);
		mapScreen.update( 0, pos, map );

		requestAnimationFrame(update);
	};
	requestAnimationFrame(update);
}
