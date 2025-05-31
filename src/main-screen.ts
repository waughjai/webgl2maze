import { createShaderProgram } from './shader-program';
import { Matrix } from './matrix';
import type { Coord2d } from './types';

class Floor {
	constructor(ctx: WebGL2RenderingContext, program: WebGLProgram) {
		// Generate rendering buffers from vertices.
		const vertices = new Float32Array([
			-16, -1, -16, 0.0, 0.0,
			16, -1, -16, 16.0, 0.0,
			-16, -1, 16, 0.0, 16.0,
			16, -1, 16, 16.0, 16.0,
		]);
		this.#indices = new Uint16Array([ 0, 1, 2, 1, 2, 3 ]);
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
		const positionAttributeLocation = ctx.getAttribLocation(program, 'a_position');
		ctx.enableVertexAttribArray(positionAttributeLocation);
		ctx.vertexAttribPointer(positionAttributeLocation, 3, ctx.FLOAT, false, 20, 0);
		const texCoordAttributeLocation = ctx.getAttribLocation(program, 'a_texCoord');
		if (texCoordAttributeLocation === 0) {
			throw new Error('Failed to get texture coordinate attribute location');
		}
		ctx.enableVertexAttribArray(texCoordAttributeLocation);
		ctx.vertexAttribPointer(texCoordAttributeLocation, 2, ctx.FLOAT, false, 20, 12);

		// Setup texture.
		ctx.activeTexture(ctx.TEXTURE1);
		const texture = ctx.createTexture();
		if (!texture) {
			throw new Error('Failed to create texture');
		}
		this.#texture = texture;
		ctx.bindTexture(ctx.TEXTURE_2D, texture);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
		const image = new Image();
		image.src = 'rocks.png';
		image.onload = () => {
			ctx.bindTexture(ctx.TEXTURE_2D, texture);
			ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
			ctx.generateMipmap(ctx.TEXTURE_2D);
		}
	}

	update(ctx: WebGL2RenderingContext, textureUniformLocation: WebGLUniformLocation) {
		ctx.activeTexture(ctx.TEXTURE1);
		ctx.bindTexture(ctx.TEXTURE_2D, this.#texture);
		ctx.uniform1i(textureUniformLocation, 1);
		ctx.bindVertexArray(this.#vao);
		ctx.drawElements(ctx.TRIANGLES, this.#indices.length, ctx.UNSIGNED_SHORT, 0);
	}

	#indices: Uint16Array;
	#vao: WebGLVertexArrayObject;
	#texture: WebGLTexture;
}

class Walls {
	constructor(ctx: WebGL2RenderingContext, program: WebGLProgram, map: readonly number[]) {
		// Generate wall planes based on map.
		const sides = [];
		for (let i = 0; i < map.length; i++) {
			if (map[i] === 1) {
				const x = (i % 16);
				const y = Math.floor(i / 16);
				const xpos = (x - 8) * 2;
				const ypos = (y - 8) * 2;
				if (y > 0 && map[i - 16] === 0) {
					sides.push(...createNorthFace(xpos, 2, -1, 2, ypos, 2));
				}
				if (y < 15 && map[i + 16] === 0) {
					sides.push(...createSouthFace(xpos, 2, -1, 2, ypos, 2));
				}
				if (x > 0 && map[i - 1] === 0) {
					sides.push(...createWestFace(xpos, 2, -1, 2, ypos, 2));
				}
				if (x < 15 && map[i + 1] === 0) {
					sides.push(...createEastFace(xpos, 2, -1, 2, ypos, 2));
				}
			}
		}

		// Generate rendering buffers from vertices.
		const vertices = new Float32Array(sides);
		this.#indices = new Uint16Array(generateIndices(sides.length / 5));
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
		const positionAttributeLocation = ctx.getAttribLocation(program, 'a_position');
		ctx.enableVertexAttribArray(positionAttributeLocation);
		ctx.vertexAttribPointer(positionAttributeLocation, 3, ctx.FLOAT, false, 20, 0);
		const texCoordAttributeLocation = ctx.getAttribLocation(program, 'a_texCoord');
		if (texCoordAttributeLocation === 0) {
			throw new Error('Failed to get texture coordinate attribute location');
		}
		ctx.enableVertexAttribArray(texCoordAttributeLocation);
		ctx.vertexAttribPointer(texCoordAttributeLocation, 2, ctx.FLOAT, false, 20, 12);

		// Setup texture.
		ctx.activeTexture(ctx.TEXTURE0);
		const texture = ctx.createTexture();
		if (!texture) {
			throw new Error('Failed to create texture');
		}
		this.#texture = texture;
		ctx.bindTexture(ctx.TEXTURE_2D, texture);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
		const image = new Image();
		image.src = 'brick.png';
		image.onload = () => {
			ctx.bindTexture(ctx.TEXTURE_2D, texture);
			ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
			ctx.generateMipmap(ctx.TEXTURE_2D);
		}
	}

	update(ctx: WebGL2RenderingContext, textureUniformLocation: WebGLUniformLocation) {
		ctx.activeTexture(ctx.TEXTURE0);
		ctx.bindTexture(ctx.TEXTURE_2D, this.#texture);
		ctx.uniform1i(textureUniformLocation, 0);
		ctx.bindVertexArray(this.#vao);
		ctx.drawElements(ctx.TRIANGLES, this.#indices.length, ctx.UNSIGNED_SHORT, 0);
	}

	#indices: Uint16Array;
	#vao: WebGLVertexArrayObject;
	#texture: WebGLTexture;
}

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
			in vec2 a_texCoord;
			out float v_depth;
			out vec2 v_texCoord;
			uniform mat4 u_model;
			uniform mat4 u_view;
			uniform mat4 u_projection;
			void main() {
				gl_Position = u_projection * u_view * u_model * a_position;
				v_depth = gl_Position.z;
				v_texCoord = a_texCoord;
			}
		`;
	
		const fragmentShaderSource = `#version 300 es
			precision mediump float;
			out vec4 outColor;
			in float v_depth;
			in vec2 v_texCoord;
			uniform sampler2D u_texture;
			void main() {
				float depthFactor = ( 0.25 / v_depth ) * 8.0;
				vec3 color = texture( u_texture, v_texCoord ).rgb;
				outColor = vec4(color * depthFactor, 1.0);
			}
		`;
		const program = createShaderProgram(this.#ctx, vertexShaderSource, fragmentShaderSource);
		if (!program) {
			throw new Error('Failed to create shader program');
		}
		this.#program = program;

		// Setup uniforms.
		const modelUniformLocation = ctx.getUniformLocation(program, 'u_model');
		const model = Matrix.createIdentity().getList();
		ctx.uniformMatrix4fv(modelUniformLocation, false, model);
	
		const viewUniformLocation = ctx.getUniformLocation(program, 'u_view');
		if (!viewUniformLocation) {
			throw new Error('Failed to get view uniform location');
		}
		this.#viewUniformLocation = viewUniformLocation;
	
		const projection = Matrix.createProjection(Math.PI / 4, aspectRatio, 0.1, 500.0).getList();
		const projectionUniformLocation = ctx.getUniformLocation(program, 'u_projection');
		ctx.uniformMatrix4fv(projectionUniformLocation, false, projection);

		const textureUniformLocation = ctx.getUniformLocation(program, 'u_texture');
		if (!textureUniformLocation) {
			throw new Error('Failed to get texture uniform location');
		}
		this.#textureUniformLocation = textureUniformLocation;

		this.#walls = new Walls(ctx, program, map);
		this.#floor = new Floor(ctx, program);
	}

	update(rotation: number, pos: Coord2d) {
		// Clear the canvas.
		this.#ctx.clearColor(0.0, 0.0, 0.0, 1.0);
		this.#ctx.clear(this.#ctx.COLOR_BUFFER_BIT | this.#ctx.DEPTH_BUFFER_BIT);

		this.#ctx.useProgram(this.#program);

		// Update camera view.
		const view = Matrix.createIdentity()
			.translate(-pos.x, 0, pos.y)
			.rotateY(rotation)
			.getList();
		this.#ctx.uniformMatrix4fv(this.#viewUniformLocation, false, view);

		this.#walls.update(this.#ctx, this.#textureUniformLocation);
		this.#floor.update(this.#ctx, this.#textureUniformLocation);
	}

	updateCanvasSize(width: number, height: number) {
		this.#canvas.width = width;
		this.#canvas.height = height;
		this.#ctx.viewport(0, 0, width, height);
	}

	#canvas: HTMLCanvasElement;
	#ctx: WebGL2RenderingContext;
	#program: WebGLProgram;
	#viewUniformLocation: WebGLUniformLocation;
	#textureUniformLocation: WebGLUniformLocation;
	#walls: Walls;
	#floor: Floor;
}

function createNorthFace(
	x: number,
	w: number,
	y: number,
	h: number,
	z: number,
	d: number
): number[] {
	return [
		x    , y    , z    , 0.0, 1.0,
		x + w, y    , z    , 1.0, 1.0,
		x    , y + h, z    , 0.0, 0.0,
		x + w, y + h, z    , 1.0, 0.0,
	];
}

function createEastFace(
	x: number,
	w: number,
	y: number,
	h: number,
	z: number,
	d: number
): number[] {
	return [
		x + w, y    , z    , 0.0, 1.0,
		x + w, y    , z + d, 1.0, 1.0,
		x + w, y + h, z    , 0.0, 0.0,
		x + w, y + h, z + d, 1.0, 0.0,
	];
}

function createSouthFace(
	x: number,
	w: number,
	y: number,
	h: number,
	z: number,
	d: number
): number[] {
	return [
		x + w, y    , z + d, 0.0, 1.0,
		x    , y    , z + d, 1.0, 1.0,
		x + w, y + h, z + d, 0.0, 0.0,
		x    , y + h, z + d, 1.0, 0.0,
	];
}

function createWestFace(
	x: number,
	w: number,
	y: number,
	h: number,
	z: number,
	d: number
): number[] {
	return [
		x    , y    , z    , 0.0, 1.0,
		x    , y    , z + d, 1.0, 1.0,
		x    , y + h, z    , 0.0, 0.0,
		x    , y + h, z + d, 1.0, 0.0,
	];
}

// Generate indices for the cube vertices.
function generateIndices(numVertices: number): number[] {
	const indices = [];
	for (let i = 0; i < numVertices; i += 4) {
		indices.push(i, i + 1, i + 2);
		indices.push(i + 1, i + 3, i + 2);
	}
	return indices;
}

export { MainScreen };
