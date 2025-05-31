class Controls {
	constructor() {
		window.addEventListener('keydown', (event) => {
			switch (event.key) {
				case 'ArrowLeft':
					this.#left = true;
					break;
				case 'ArrowRight':
					this.#right = true;
					break;
				case 'ArrowUp':
					this.#up = true;
					break;
				case 'ArrowDown':
					this.#down = true;
					break;
				case 'z':
					this.#z = true;
					break;
				case 'x':
					this.#x = true;
					break;
				default:
					return false;
			}
			event.preventDefault();
		});

		window.addEventListener('keyup', (event) => {
			switch (event.key) {
				case 'ArrowLeft':
					this.#left = false;
					break;
				case 'ArrowRight':
					this.#right = false;
					break;
				case 'ArrowUp':
					this.#up = false;
					break;
				case 'ArrowDown':
					this.#down = false;
					break;
				case 'z':
					this.#z = false;
					break;
				case 'x':
					this.#x = false;
					break;
				default:
					return false;
			}
			event.preventDefault();
		});
	}

	isLeftPressed() {
		return this.#left;
	}

	isRightPressed() {
		return this.#right;
	}

	isUpPressed() {
		return this.#up;
	}

	isDownPressed() {
		return this.#down;
	}

	isZPressed() {
		return this.#z;
	}

	isXPressed() {
		return this.#x;
	}

	#left: boolean = false;
	#right: boolean = false;
	#up: boolean = false;
	#down: boolean = false;
	#z: boolean = false;
	#x: boolean = false;
}

export { Controls };
