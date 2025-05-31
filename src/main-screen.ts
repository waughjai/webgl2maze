import { createShaderProgram } from './shader-program';
import { Matrix } from './matrix';
import type { Coord2d } from './types';

class MainScreen {
	constructor(map: readonly number[], aspectRatio: number) {
		const canvas = document.getElementById('canvas') as HTMLCanvasElement;
		if (!canvas) {
			throw new Error('Canvas element with id "canvas" not found');
		}
		this.#canvas = canvas;
		const ctx = canvas.getContext('webgl2');
		if (! ctx) {
			throw new Error('WebGL2 not supported');
		}
		this.#ctx = ctx;

		this.#ctx.enable(ctx.DEPTH_TEST);
	
		const vertexShaderSource = `#version 300 es
			in vec4 a_position;
			out float v_depth;
			uniform mat4 model;
			uniform mat4 view;
			uniform mat4 projection;
			void main() {
				gl_Position = projection * view * model * a_position;
				v_depth = gl_Position.z;
			}
		`;
	
		const fragmentShaderSource = `#version 300 es
			precision mediump float;
			out vec4 outColor;
			in float v_depth;
			void main() {
				float depthFactor = ( 0.25 / v_depth ) * 8.0;
				const vec3 color = vec3(1.0, 224.0 / 255.0, 242.0 / 255.0);
				outColor = vec4(color * depthFactor, 1.0);
			}
		`;
		const program = createShaderProgram(this.#ctx, vertexShaderSource, fragmentShaderSource);
		const positionAttributeLocation = this.#ctx.getAttribLocation(program, 'a_position');
		const positionBuffer = this.#ctx.createBuffer();
		this.#ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

		const boxes = [];
		for (let i = 0; i < map.length; i++) {
			if (map[i] === 1) {
				const x = (i % 16) - 8;
				const y = Math.floor(i / 16) - 8;
				boxes.push(...createCube((x)*2, 2, -1, 2, (y)*2, 2));
			}
		}
	
		const points = [
				-16.0, -1.0, 16.0,
				16.0, -1.0, 16.0,
				-16.0, -1.0, -16.0,
				16.0, -1.0, -16.0,
			].concat(boxes);
		const vertices = new Float32Array(points);
	
		this.#indices = new Uint16Array(generateIndices(points.length / 3));
		const vao = ctx.createVertexArray();
		if (!vao) {
			throw new Error('Failed to create VAO');
		}
		this.#vao = vao;
		ctx.bindVertexArray(vao);
		const vbo = ctx.createBuffer();
		ctx.bindBuffer(ctx.ARRAY_BUFFER, vbo);
		ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
		const ebo = ctx.createBuffer();
		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, ebo);
		ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, this.#indices, ctx.STATIC_DRAW);
		ctx.enableVertexAttribArray(positionAttributeLocation);
		ctx.vertexAttribPointer(positionAttributeLocation, 3, ctx.FLOAT, false, 0, 0);

		const modelUniformLocation = ctx.getUniformLocation(program, 'model');
		const model = Matrix.createIdentity().getList();
	
		const viewUniformLocation = ctx.getUniformLocation(program, 'view');
		if (!viewUniformLocation) {
			throw new Error('Failed to get view uniform location');
		}
		const view = Matrix.createIdentity().translate(0.0, 0.0, -3.0).getList();
		ctx.uniformMatrix4fv(viewUniformLocation, false, view);
		this.#viewUniformLocation = viewUniformLocation;
	
		const projection = Matrix.createProjection(Math.PI / 4, aspectRatio, 0.1, 500.0).getList();
		const projectionUniformLocation = ctx.getUniformLocation(program, 'projection');
		ctx.uniformMatrix4fv(projectionUniformLocation, false, projection);
	
		ctx.uniformMatrix4fv(modelUniformLocation, false, model);
		ctx.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
		ctx.clear(ctx.COLOR_BUFFER_BIT);
		ctx.bindVertexArray(vao);
		ctx.drawElements(ctx.TRIANGLES, this.#indices.length, ctx.UNSIGNED_SHORT, 0);
	}

	update(rotation: number, pos: Coord2d) {
		const view = Matrix.createIdentity()
			.translate(-pos.x, 0, pos.y)
			.rotateY(rotation)
			.getList();
		this.#ctx.uniformMatrix4fv(this.#viewUniformLocation, false, view);
		this.#ctx.clear(this.#ctx.COLOR_BUFFER_BIT | this.#ctx.DEPTH_BUFFER_BIT);
		this.#ctx.bindVertexArray(this.#vao);
		this.#ctx.drawElements(this.#ctx.TRIANGLES, this.#indices.length, this.#ctx.UNSIGNED_SHORT, 0);
	}

	updateCanvasSize(width: number, height: number) {
		this.#canvas.width = width;
		this.#canvas.height = height;
		this.#ctx.viewport(0, 0, width, height);
	}

	#canvas: HTMLCanvasElement;
	#ctx: WebGL2RenderingContext;
	#indices: Uint16Array;
	#vao: WebGLVertexArrayObject;
	#viewUniformLocation: WebGLUniformLocation;
}

function createCube(
	x: number,
	w: number,
	y: number,
	h: number,
	z: number,
	d: number
): number[] {
	return [
		x    , y    , z    ,
		x + w, y    , z    ,
		x    , y + h, z    ,
		x + w, y + h, z    ,

		x + w, y    , z    ,
		x + w, y    , z + d,
		x + w, y + h, z    ,
		x + w, y + h, z + d,

		x + w, y    , z + d,
		x    , y    , z + d,
		x + w, y + h, z + d,
		x    , y + h, z + d,

		x    , y    , z    ,
		x    , y    , z + d,
		x    , y + h, z    ,
		x    , y + h, z + d,

		x    , y    , z    ,
		x    , y    , z + d,
		x + w, y    , z    ,
		x + w, y    , z + d,

		x    , y + h, z    ,
		x    , y + h, z + d,
		x + w, y + h, z    ,
		x + w, y + h, z + d,
	];
}

function generateIndices(numVertices: number): number[] {
	const indices = [];
	for (let i = 0; i < numVertices; i += 4) {
		indices.push(i, i + 1, i + 2);
		indices.push(i + 1, i + 3, i + 2);
	}
	return indices;
}

export { MainScreen };
