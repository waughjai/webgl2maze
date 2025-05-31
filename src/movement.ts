import { Velocity } from './velocity';

class Movement {
	constructor(
		startSpeed: number,
		maxSpeed: number,
		traction: number = 1,
		value: number = 0
	) {
		this.#velocity = new Velocity(startSpeed, maxSpeed, traction);
		this.#value = value;
	}

	getValue() {
		return this.#value;
	}

	setValue(value: number) {
		this.#value = value;
	}

	update(forward: boolean, backward: boolean) {
		this.#velocity.update(forward, backward);
		this.#value += this.#velocity.getValue();
	}

	#velocity: Velocity;
	#value: number;
}

export { Movement };
