import { createShaderProgram } from "./shader-program";
import { Matrix } from "./matrix";
import type { Coord3d } from "./types";

class MapArrow {
	constructor(ctx: WebGL2RenderingContext) {
		const vertexShaderSource = `#version 300 es
			in vec4 a_position;
			uniform mat4 u_model;
			uniform mat4 u_view;
			void main() {
				gl_Position = u_view * u_model * a_position;

			}
		`;

		const fragmentShaderSource = `#version 300 es
			precision mediump float;
			out vec4 outColor;
			void main() {
				outColor = vec4( 1.0, 0.0, 0.0, 1.0 );
			}
		`;

		const program = createShaderProgram(ctx, vertexShaderSource, fragmentShaderSource);
		if (!program) {
			throw new Error('Failed to create shader program');
		}
		this.#program = program;
		
		// Setup buffer for vertices.
		const vertices = new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			0.0, 1.0,
		]);
		const indices = new Uint16Array([0, 1, 2]);
		const vao = ctx.createVertexArray();
		if (!vao) {
			throw new Error('Failed to create VAO');
		}
		this.#vao = vao;
		ctx.bindVertexArray(this.#vao);
		const vbo = ctx.createBuffer();
		ctx.bindBuffer(ctx.ARRAY_BUFFER, vbo);
		ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
		const ebo = ctx.createBuffer();
		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, ebo);
		ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
		const positionAttributeLocation = ctx.getAttribLocation(program, 'a_position');
		ctx.enableVertexAttribArray(positionAttributeLocation);
		ctx.vertexAttribPointer(positionAttributeLocation, 2, ctx.FLOAT, false, 0, 0);

		// Setup uniforms.
		const modelUniformLocation = ctx.getUniformLocation(program, 'u_model');
		if (!modelUniformLocation) {
			throw new Error('Uniform location for u_model not found');
		}
		this.#modelUniformLocation = modelUniformLocation;

		const viewUniformLocation = ctx.getUniformLocation(program, 'u_view');
		if (!viewUniformLocation) {
			throw new Error('Uniform location for u_view not found');
		}
		this.#viewUniformLocation = viewUniformLocation;
	}

	update(ctx: WebGL2RenderingContext, aspectRatio: number, rotation: number, pos: Coord3d) {
		ctx.useProgram(this.#program);

		// Update arrow position and rotation.
		const model = Matrix.createIdentity()
			.rotateZ(-rotation)
			.translate(pos.x, pos.z, 0)
			.getList();
		ctx.uniformMatrix4fv(this.#modelUniformLocation, false, model);

		// Update view matrix based on position.
		const x = Math.min(Math.max(-pos.x, 0), 0);
		const y = Math.min(Math.max(-pos.z, -7), 7);
		const view = Matrix.createIdentity()
			.translate(x, y, 0)
			.scale(1.0 / 16.0, 1.0 / 16.0 * aspectRatio, 1.0);
		ctx.uniformMatrix4fv(this.#viewUniformLocation, false, view.getList());

		// Clear the canvas and draw the arrow.
		ctx.bindVertexArray(this.#vao);
		ctx.drawElements(ctx.TRIANGLES, 3, ctx.UNSIGNED_SHORT, 0);
	}

	#program: WebGLProgram;
	#vao: WebGLBuffer;
	#modelUniformLocation: WebGLUniformLocation;
	#viewUniformLocation: WebGLUniformLocation;
}

class MapSquares {
	constructor(ctx: WebGL2RenderingContext) {
		const vertexShaderSource = `#version 300 es
			in vec4 a_position;
			in vec2 a_instancePosition;
			uniform mat4 u_view;
			void main() {
				mat4 model = mat4(
					1.0, 0.0, 0.0, 0.0,
					0.0, 1.0, 0.0, 0.0,
					0.0, 0.0, 1.0, 0.0,
					a_instancePosition.x * 2.0, a_instancePosition.y * 2.0, 0.0, 1.0
				);
				gl_Position = u_view * model * a_position;

			}
		`;

		const fragmentShaderSource = `#version 300 es
			precision mediump float;
			out vec4 outColor;
			void main() {
				outColor = vec4( 0.0, 0.0, 1.0, 1.0 );
			}
		`;
		const program = createShaderProgram(ctx, vertexShaderSource, fragmentShaderSource);
		if (!program) {
			throw new Error('Failed to create shader program');
		}
		this.#program = program;

		// Generate rendering buffers from vertices.
		const vertices = new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			-1.0, 1.0,
			1.0, 1.0,
		]);
		const indices = new Uint16Array([0, 1, 2, 1, 2, 3]);
		const vao = ctx.createVertexArray();
		if (!vao) {
			throw new Error('Failed to create VAO');
		}
		this.#vao = vao;
		ctx.bindVertexArray(this.#vao);
		const vbo = ctx.createBuffer();
		ctx.bindBuffer(ctx.ARRAY_BUFFER, vbo);
		ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
		const ebo = ctx.createBuffer();
		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, ebo);
		ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
		const positionAttributeLocation = ctx.getAttribLocation(program, 'a_position');
		ctx.enableVertexAttribArray(positionAttributeLocation);
		ctx.vertexAttribPointer(positionAttributeLocation, 2, ctx.FLOAT, false, 0, 0);

		const instanceVbo = ctx.createBuffer();
		if (!instanceVbo) {
			throw new Error('Failed to create instance VBO');
		}
		this.#instanceVbo = instanceVbo;
		ctx.bindBuffer(ctx.ARRAY_BUFFER, instanceVbo);
		ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([]), ctx.STATIC_DRAW);
		const instancePositionAttribLocation = ctx.getAttribLocation( program, 'a_instancePosition' );
		ctx.enableVertexAttribArray( instancePositionAttribLocation );
		ctx.vertexAttribPointer( instancePositionAttribLocation, 2, ctx.FLOAT, false, 0, 0 );
		ctx.vertexAttribDivisor( instancePositionAttribLocation, 1 );

		const viewUniformLocation = ctx.getUniformLocation(program, 'u_view');
		if (!viewUniformLocation) {
			throw new Error('Failed to get view uniform location');
		}
		this.#viewUniformLocation = viewUniformLocation;
	}

	update(ctx: WebGL2RenderingContext, aspectRatio: number, pos: Coord3d, map: readonly number[]) {
		ctx.useProgram(this.#program);

		// Update view matrix based on position.
		const x = Math.min(Math.max(-pos.x, 0), 0);
		const y = Math.min(Math.max(-pos.z, -7), 7);
		const view = Matrix.createTranslation(x, y, 0)
			.scale(1.0 / 16.0, 1.0 / 16.0 * aspectRatio, 1.0)
			.getList();
		ctx.uniformMatrix4fv(this.#viewUniformLocation, false, view);

		const squares = map.reduce((acc, value, index) => {
			if (value === 1) {
				const x = (index % 16) - 7.5;
				const y = (Math.floor(index / 16) - 7.5) * -1;
				acc.push(x, y);
			}
			return acc;
		}, [] as number[]);
		ctx.bindBuffer(ctx.ARRAY_BUFFER, this.#instanceVbo);
		ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(squares), ctx.STATIC_DRAW);

		// Clear the canvas and draw the arrow.
		ctx.bindVertexArray(this.#vao);
		ctx.drawElementsInstanced(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0, squares.length / 2);
	}

	#program: WebGLProgram;
	#vao: WebGLVertexArrayObject;
	#instanceVbo: WebGLBuffer;
	#viewUniformLocation: WebGLUniformLocation;
}

class MapScreen {
	constructor(aspectRatio: number) {
		this.#aspectRatio = aspectRatio;
		this.#canvas = document.getElementById('map') as HTMLCanvasElement;
		if (!this.#canvas) {
			throw new Error('Canvas element with id "map" not found');
		}
		const ctx = this.#canvas.getContext('webgl2');
		if (!ctx) {
			throw new Error('WebGL2 not supported');
		}
		this.#ctx = ctx;
		this.#arrow = new MapArrow(ctx);
		this.#squares = new MapSquares(ctx);
	}

	update(rotation: number, pos: Coord3d, map: readonly number[]) {
		// Clear the canvas.
		this.#ctx.clearColor(0.0, 0.0, 0.0, 1.0);
		this.#ctx.clear(this.#ctx.COLOR_BUFFER_BIT);

		this.#squares.update(this.#ctx, this.#aspectRatio, pos, map);
		this.#arrow.update(this.#ctx, this.#aspectRatio, rotation, pos);
	}

	updateCanvasSize(width: number, height: number) {
		this.#canvas.width = width / 8;
		this.#canvas.height = height / 8;
		this.#ctx.viewport(0, 0, this.#canvas.width, this.#canvas.height);
	}

	#aspectRatio: number;
	#canvas: HTMLCanvasElement;
	#ctx: WebGL2RenderingContext;
	#arrow: MapArrow;
	#squares: MapSquares;
}

export { MapScreen };
