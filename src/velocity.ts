class Velocity {
	constructor(
		startSpeed: number,
		maxSpeed: number,
		traction: number = 1
	) {
		this.#startSpeed = startSpeed;
		this.#maxSpeed = maxSpeed;
		this.#traction = traction;
		this.#velocity = 0;
	}

	getValue() {
		return this.#velocity;
	}

	update(forward: boolean, backward: boolean) {
		const acc = forward ? this.#startSpeed : (backward ? -this.#startSpeed : 0);
		this.#velocity += acc;
		if (this.#velocity > this.#maxSpeed) {
			this.#velocity = this.#maxSpeed;
		} else if (this.#velocity < -this.#maxSpeed) {
			this.#velocity = -this.#maxSpeed;
		}
		if (acc === 0.0) {
			this.#velocity *= this.#traction; // Dampen speed
		}
	}

	#startSpeed: number;
	#maxSpeed: number;
	#traction: number;
	#velocity: number;
}

export { Velocity };
