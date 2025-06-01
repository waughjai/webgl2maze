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
				case 'w':
					this.#w = true;
					break;
				case 'a':
					this.#a = true;
					break;
				case 's':
					this.#s = true;
					break;
				case 'd':
					this.#d = true;
					break;
				case 'r':
					this.#r = true;
					break;
				case 'f':
					this.#f = true;
					break;
				case 'u':
					this.#u = true;
					break;
				case 'h':
					this.#h = true;
					break;
				case 'j':
					this.#j = true;
					break;
				case 'k':
					this.#k = true;
					break;
				case 't':
					this.#t = true;
					break;
				case 'g':
					this.#g = true;
					break;
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
				case 'w':
					this.#w = false;
					break;
				case 'a':
					this.#a = false;
					break;
				case 's':
					this.#s = false;
					break;
				case 'd':
					this.#d = false;
					break;
				case 'r':
					this.#r = false;
					break;
				case 'f':
					this.#f = false;
					break;
				case 'u':
					this.#u = false;
					break;
				case 'h':
					this.#h = false;
					break;
				case 'j':
					this.#j = false;
					break;
				case 'k':
					this.#k = false;
					break;
				case 't':
					this.#t = false;
					break;
				case 'g':
					this.#g = false;
					break;
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

	isWPressed() {
		return this.#w;
	}

	isAPressed() {
		return this.#a;
	}

	isSPressed() {
		return this.#s;
	}

	isDPressed() {
		return this.#d;
	}

	isRPressed() {
		return this.#r;
	}

	isFPressed() {
		return this.#f;
	}

	isUPressed() {
		return this.#u;
	}

	isHPressed() {
		return this.#h;
	}

	isJPressed() {
		return this.#j;
	}

	isKPressed() {
		return this.#k;
	}

	isTPressed() {
		return this.#t;
	}

	isGPressed() {
		return this.#g;
	}

	#left: boolean = false;
	#right: boolean = false;
	#up: boolean = false;
	#down: boolean = false;
	#z: boolean = false;
	#x: boolean = false;
	#w: boolean = false;
	#a: boolean = false;
	#s: boolean = false;
	#d: boolean = false;
	#r: boolean = false;
	#f: boolean = false;
	#u: boolean = false;
	#h: boolean = false;
	#j: boolean = false;
	#k: boolean = false;
	#t: boolean = false;
	#g: boolean = false;
}

export { Controls };
