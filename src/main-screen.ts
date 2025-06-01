import { createShaderProgram } from './shader-program';
import { Matrix } from './matrix';
import type { Coord3d } from './types';

class Player {
	constructor(ctx: WebGL2RenderingContext, projection: Float32Array) {
		const vertexShaderSource = `#version 300 es
			in vec4 a_position;
			in vec2 a_texCoord;

			out vec2 v_texCoord;

			uniform mat4 u_model;
			uniform mat4 u_view;
			uniform mat4 u_projection;

			void main() {
				gl_Position = u_projection * u_view * u_model * a_position;
				v_texCoord = a_texCoord;
			}
		`;
	
		const fragmentShaderSource = `#version 300 es
			precision mediump float;

			out vec4 outColor;

			in vec2 v_texCoord;

			uniform sampler2D u_texture;

			void main() {
				vec4 color = texture( u_texture, v_texCoord ).rgba;
				if (color.a < 0.1) {
					discard;
				}
				outColor = color;
			}
		`;
		const program = createShaderProgram(ctx, vertexShaderSource, fragmentShaderSource);
		if (!program) {
			throw new Error('Failed to create shader program');
		}
		this.#program = program;

		// Setup uniforms.
		const modelUniformLocation = ctx.getUniformLocation(program, 'u_model');
		if (!modelUniformLocation) {
			throw new Error('Failed to get model uniform location');
		}
		this.#modelUniformLocation = modelUniformLocation;

		const viewUniformLocation = ctx.getUniformLocation(program, 'u_view');
		if (!viewUniformLocation) {
			throw new Error('Failed to get view uniform location');
		}
		this.#viewUniformLocation = viewUniformLocation;

		const projectionUniformLocation = ctx.getUniformLocation(program, 'u_projection');
		ctx.uniformMatrix4fv(projectionUniformLocation, false, projection);

		const textureUniformLocation = ctx.getUniformLocation(program, 'u_texture');
		if (!textureUniformLocation) {
			throw new Error('Failed to get texture uniform location');
		}
		ctx.uniform1i(textureUniformLocation, 3);

		// Generate rendering buffers from vertices.
		const vertices = new Float32Array([
			-1, 1, -1, 0.0, 0.0,
			1, 1, -1, 1.0, 0.0,
			-1, -1, -1, 0.0, 1.0,
			1, -1, -1, 1.0, 1.0,
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
		ctx.activeTexture(ctx.TEXTURE3);
		const texture = ctx.createTexture();
		if (!texture) {
			throw new Error('Failed to create texture');
		}
		ctx.bindTexture(ctx.TEXTURE_2D, texture);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
		const image = new Image();
		image.src = 'bb.png';
		image.onload = () => {
			ctx.bindTexture(ctx.TEXTURE_2D, texture);
			ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
			ctx.generateMipmap(ctx.TEXTURE_2D);
		}
	}

	update(ctx: WebGL2RenderingContext, aspectRatio: number, pos: Coord3d, rotation: number) {
		ctx.useProgram(this.#program);
		const { x, y, z } = pos;
		const model = Matrix.createIdentity()
			.scale(0.25, 0.25 * aspectRatio * (302 / 436), 1.0)
			.translate(x, y - 0.7, -z - 1.0)
			.getList();
		ctx.uniformMatrix4fv(this.#modelUniformLocation, false, model);
		const view = Matrix.createIdentity()
			.translate(-x, 0, z)
			.getList();
		ctx.uniformMatrix4fv(this.#viewUniformLocation, false, view);
		ctx.bindVertexArray(this.#vao);
		ctx.drawElements(ctx.TRIANGLES, this.#indices.length, ctx.UNSIGNED_SHORT, 0);
	}

	#program: WebGLProgram;
	#indices: Uint16Array;
	#vao: WebGLVertexArrayObject;
	#modelUniformLocation: WebGLUniformLocation;
	#viewUniformLocation: WebGLUniformLocation;
}

class SkyBox {
	constructor(ctx: WebGL2RenderingContext, projection: Float32Array) {
		const vertexShaderSource = `#version 300 es
			in vec4 a_position;
			in vec2 a_texCoord;

			out vec2 v_texCoord;
			out float v_y;

			uniform mat4 u_view;
			uniform mat4 u_projection;

			void main() {
				gl_Position = u_projection * u_view * a_position;
				v_texCoord = a_texCoord;
				v_y = (-a_position.y + 0.5)*1.5;
			}
		`;
	
		const fragmentShaderSource = `#version 300 es
			precision mediump float;

			out vec4 outColor;

			in vec2 v_texCoord;
			in float v_y;

			uniform sampler2D u_texture;

			void main() {
				vec3 color = texture( u_texture, v_texCoord ).rgb;
				outColor = vec4(color * vec3(v_y, 0.5, 0.5), 1.0);
			}
		`;
		const program = createShaderProgram(ctx, vertexShaderSource, fragmentShaderSource);
		if (!program) {
			throw new Error('Failed to create shader program');
		}
		this.#program = program;

		// Setup uniforms.
		const viewUniformLocation = ctx.getUniformLocation(program, 'u_view');
		if (!viewUniformLocation) {
			throw new Error('Failed to get view uniform location');
		}
		this.#viewUniformLocation = viewUniformLocation;

		const projectionUniformLocation = ctx.getUniformLocation(program, 'u_projection');
		ctx.uniformMatrix4fv(projectionUniformLocation, false, projection);

		const textureUniformLocation = ctx.getUniformLocation(program, 'u_texture');
		if (!textureUniformLocation) {
			throw new Error('Failed to get texture uniform location');
		}
		ctx.uniform1i(textureUniformLocation, 2);

		// Generate rendering buffers from vertices.
		const vertices = new Float32Array([
			-1, 1, -1, 0.0, 0.0,
			1, 1, -1, 8.0, 0.0,
			-1, -1, -1, 0.0, 2.0,
			1, -1, -1, 8.0, 2.0,
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
		ctx.activeTexture(ctx.TEXTURE2);
		const texture = ctx.createTexture();
		if (!texture) {
			throw new Error('Failed to create texture');
		}
		ctx.bindTexture(ctx.TEXTURE_2D, texture);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
		ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
		const image = new Image();
		image.src = 'skybox.png';
		image.onload = () => {
			ctx.bindTexture(ctx.TEXTURE_2D, texture);
			ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
			ctx.generateMipmap(ctx.TEXTURE_2D);
		}
	}

	update(ctx: WebGL2RenderingContext, rotation: number) {
		ctx.useProgram(this.#program);

		// Make skybox smoothly rotate around world as player rotates.
		let x = rotation / ( Math.PI * 4 );
		while (x > 0.5) {
			x -= 0.5;
		}
		while (x < -0.5) {
			x += 0.5;
		}

		const skyboxView = Matrix.createIdentity()
			.translate(x, 0.5, -100)
			.scale(400, 100 / (16 / 9), 1)
			.getList();
		ctx.uniformMatrix4fv(this.#viewUniformLocation, false, skyboxView);

		ctx.bindVertexArray(this.#vao);
		ctx.drawElements(ctx.TRIANGLES, this.#indices.length, ctx.UNSIGNED_SHORT, 0);
	}

	#program: WebGLProgram;
	#indices: Uint16Array;
	#vao: WebGLVertexArrayObject;
	#viewUniformLocation: WebGLUniformLocation;
}

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

			uniform mat4 u_view;
			uniform mat4 u_projection;

			void main() {
				gl_Position = u_projection * u_view * a_position;
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
				vec3 light = vec3(depthFactor * 2.0, depthFactor * 1.5, depthFactor * 1.0);
				vec3 color = texture( u_texture, v_texCoord ).rgb;
				outColor = vec4(color * light, 1.0);
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

		this.#skybox = new SkyBox(ctx, projection);
		this.#player = new Player(ctx, projection);
	}

	update(rotation: number, pos: Coord3d, aspectRatio: number) {
		// Clear the canvas.
		this.#ctx.clearColor(0.0, 0.0, 0.0, 1.0);
		this.#ctx.clear(this.#ctx.COLOR_BUFFER_BIT | this.#ctx.DEPTH_BUFFER_BIT);

		this.#skybox.update(this.#ctx, rotation);

		this.#ctx.useProgram(this.#program);

		// Update camera view.
		const view = Matrix.createIdentity()
			.translate(-pos.x, 0, pos.z)
			.rotateY(rotation)
			.getList();
		this.#ctx.uniformMatrix4fv(this.#viewUniformLocation, false, view);

		this.#walls.update(this.#ctx, this.#textureUniformLocation);
		this.#floor.update(this.#ctx, this.#textureUniformLocation);

		this.#player.update(this.#ctx, aspectRatio, pos, rotation);
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
	#skybox: SkyBox;
	#walls: Walls;
	#floor: Floor;
	#player: Player;
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
