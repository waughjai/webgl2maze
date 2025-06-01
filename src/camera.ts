import type { Coord3d } from './types';
import { Velocity } from './velocity';
import { Controls } from './controls';

class Camera {
	constructor() {
		this.#pos = { x: 0, y: 0, z: 0 };
		this.#rotation = { x: 0, y: 0, z: 0 };
		this.#rotvx = new Velocity(0.01, 0.1, 0.9);
		this.#rotvy = new Velocity(0.01, 0.1, 0.9);
		this.#rotvz = new Velocity(0.01, 0.1, 0.9);
		this.#posvx = new Velocity(0.01, 0.1, 0.9);
		this.#posvy = new Velocity(0.01, 0.1, 0.9);
		this.#posvz = new Velocity(0.01, 0.1, 0.9);
	}

	getPos(): Coord3d {
		return this.#pos;
	}

	getRotation(): Coord3d {
		return this.#rotation;
	}

	getX(): number {
		return this.#pos.x;
	}

	getY(): number {
		return this.#pos.y;
	}

	getZ(): number {
		return this.#pos.z;
	}

	update(controls: Controls) {
		this.#posvx.update(controls.isDPressed(), controls.isAPressed());
		this.#posvz.update(controls.isSPressed(), controls.isWPressed());
		this.#posvy.update(controls.isRPressed(), controls.isFPressed());
		this.#rotvx.update(controls.isKPressed(), controls.isHPressed());
		this.#rotvz.update(controls.isJPressed(), controls.isUPressed());
		this.#rotvy.update(controls.isTPressed(), controls.isGPressed());

		this.#rotation.x += this.#rotvx.getValue();
		this.#rotation.y += this.#rotvy.getValue();
		this.#rotation.z += this.#rotvz.getValue();
		this.#pos.x += this.#posvx.getValue();
		this.#pos.y += this.#posvy.getValue();
		this.#pos.z += this.#posvz.getValue();
	}

	follow(pos: Coord3d): void {
		/*
		if (pos.x < this.#pos.x - (Math.PI / 2)) {
			this.#pos.x = pos.x + (Math.PI / 2);
		} else if (pos.x > this.#pos.x + (Math.PI / 2)) {
			this.#pos.x = pos.x - (Math.PI / 2);
		}
		if (pos.z < this.#pos.z - 4) {
			this.#pos.z = pos.z + 4;
		} else if (pos.z > this.#pos.z - 2) {
			this.#pos.z = pos.z + 2;
		}

		if (pos.y > this.#pos.y + 0.5) {
			this.#pos.y = pos.y - 0.5;
		} else if (pos.y < this.#pos.y) {
			this.#pos.y = pos.y;
		}*/
	}

	#pos: Coord3d;
	#rotation: Coord3d;
	#rotvx: Velocity;
	#rotvy: Velocity;
	#rotvz: Velocity;
	#posvx: Velocity;
	#posvy: Velocity;
	#posvz: Velocity;
}

export { Camera };
