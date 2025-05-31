import { createShaderProgram } from "./shader-program";
import { Matrix } from "./matrix";
import type { Coord2d } from "./types";

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

		const vertexShaderSource = `#version 300 es
			in vec4 a_position;
			uniform mat4 u_model;
			void main() {
				gl_Position = u_model * a_position;

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
		
		// Setup buffer for vertices.
		const positionAttributeLocation = ctx.getAttribLocation(program, 'a_position');
		const positionBuffer = ctx.createBuffer();
		ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
		const vertices = new Float32Array([
			-1.0, -1.0, 0.0,
			1.0, -1.0, 0.0,
			0.0, 1.0, 0.0,
		]);
		const vao = ctx.createBuffer();
		if (!vao) {
			throw new Error('Failed to create VAO');
		}
		this.#vao = vao;
		ctx.bindBuffer(ctx.ARRAY_BUFFER, vao);
		ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
		ctx.enableVertexAttribArray(positionAttributeLocation);
		ctx.vertexAttribPointer(positionAttributeLocation, 3, ctx.FLOAT, false, 0, 0);

		// Setup uniforms.
		const modelUniformLocation = ctx.getUniformLocation(program, 'u_model');
		if (!modelUniformLocation) {
			throw new Error('Uniform location for u_model not found');
		}
		this.#modelUniformLocation = modelUniformLocation;
	}

	update( rotation: number, pos: Coord2d ) {
		// Update arrow position and rotation.
		const model = Matrix.createIdentity()
			.rotateZ(-rotation)
			.scale(0.05, 0.05 * this.#aspectRatio, 1.0)
			.getList();
		this.#ctx.uniformMatrix4fv(this.#modelUniformLocation, false, model);

		// Clear the canvas and draw the arrow.
		this.#ctx.clearColor(0.0, 0.0, 0.0, 1.0);
		this.#ctx.clear(this.#ctx.COLOR_BUFFER_BIT);
		this.#ctx.bindBuffer(this.#ctx.ARRAY_BUFFER, this.#vao);
		this.#ctx.drawArrays(this.#ctx.TRIANGLES, 0, 3);
	}

	updateCanvasSize(width: number, height: number) {
		this.#canvas.width = width / 8;
		this.#canvas.height = height / 8;
		this.#ctx.viewport(0, 0, this.#canvas.width, this.#canvas.height);
	}

	#aspectRatio: number;
	#canvas: HTMLCanvasElement;
	#ctx: WebGL2RenderingContext;
	#modelUniformLocation: WebGLUniformLocation;
	#vao: WebGLBuffer;
};

export { MapScreen };
