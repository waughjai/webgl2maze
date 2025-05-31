class Matrix {
	constructor(list: number[]) {
		this.#list = list;
	}

	static createIdentity(): Matrix {
		return new Matrix([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}

	static createProjection(fov: number, aspect: number, near: number, far: number): Matrix {
		const f = 1 / Math.tan(fov / 2);
		return new Matrix([
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (far + near)/(near - far), -1,
			0, 0, (2 * far * near)/(near - far), 0,
		]);
	}

	static createRotationX(angle: number): Matrix {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		return new Matrix([
			1, 0, 0, 0,
			0, c, -s, 0,
			0, s, c, 0,
			0, 0, 0, 1
		]);
	}

	static createRotationY(angle: number): Matrix {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		return new Matrix([
			c, 0, s, 0,
			0, 1, 0, 0,
			-s, 0, c, 0,
			0, 0, 0, 1
		]);
	}

	static createRotationZ(angle: number): Matrix {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		return new Matrix([
			c, -s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}

	static createScale(x: number, y: number, z: number): Matrix {
		return new Matrix([
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1
		]);
	}

	static createTranslation(x: number, y: number, z: number): Matrix {
		return new Matrix([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1
		]);
	}

	getList(): Float32Array {
		return new Float32Array(this.#list);
	}

	getValue(): number[] {
		return this.#list;
	}

	multiply(other: Matrix): Matrix {
		const [ a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44 ] = this.#list;
		const [ b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44 ] = other.getValue();
		return new Matrix([
			a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41,
			a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42,
			a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43,
			a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44,

			a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41,
			a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42,
			a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43,
			a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44,

			a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41,
			a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42,
			a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43,
			a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44,

			a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41,
			a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42,
			a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43,
			a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44,
		]);
	}

	rotateX(angle: number): Matrix {
		return this.multiply(Matrix.createRotationX(angle));
	}

	rotateY(angle: number): Matrix {
		return this.multiply(Matrix.createRotationY(angle));
	}

	rotateZ(angle: number): Matrix {
		return this.multiply(Matrix.createRotationZ(angle));
	}

	scale(x: number, y: number, z: number): Matrix {
		return this.multiply(Matrix.createScale(x, y, z));
	}

	translate(x: number, y: number, z: number): Matrix {
		return this.multiply(Matrix.createTranslation(x, y, z));
	}

	#list: number[];
}

export { Matrix };
