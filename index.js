const aspectRatio = 16 / 9;

const createBlankMatrix = () => [
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	0.0, 0.0, 0.0, 1.0,
];

const createVelocity = (startSpeed, maxSpeed, traction = 1) => {
	let velocity = 0;
	return Object.freeze({
		getValue: () => velocity,
		update: (forward, backward) => {
			const acc = forward ? startSpeed : (backward ? -startSpeed : 0);
			velocity += acc;
			if (velocity > maxSpeed) {
				velocity = maxSpeed;
			} else if (velocity < -maxSpeed) {
				velocity = -maxSpeed;
			}
			if (acc === 0.0) {
				velocity *= traction; // Dampen speed
			}
		},
	});
};

const createMovement = (startSpeed, maxSpeed, traction = 1, value = 0) => {
	const velocity = createVelocity(startSpeed, maxSpeed, traction);
	return Object.freeze({
		getValue: () => value,
		update: (forward, backward) => {
			velocity.update(forward, backward);
			value += velocity.getValue();
		},
	});
};

const rotateCamera = (angleX, angleY) => {
	return {
		x: Math.cos(angleX) * Math.cos(angleY),
		y: Math.sin(angleY),
		z: Math.sin(angleX) * Math.cos(angleY),
	};
};

const createCube = (x, w, y, h, z, d) => {
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
	]
};

const generateIndices = (numVertices) => {
	const indices = [];
	for (let i = 0; i < numVertices; i += 4) {
		indices.push(i, i + 1, i + 2);
		indices.push(i + 1, i + 3, i + 2);
	}
	return indices;
};

const translate = (matrix, tx, ty, tz) => {
	return multipleMatrices(matrix, [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		tx, ty, tz, 1
	]);
};

const rotateX = (matrix, angle) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	return multipleMatrices(matrix, [
		1, 0, 0, 0,
		0, cos, -sin, 0,
		0, sin, cos, 0,
		0, 0, 0, 1
	]);
};

const multipleMatrices = (a, b) => {
	const [ a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44 ] = a;
	const [ b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44 ] = b;
	return [
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
		a31 * b14 + a32 * b24 + a33 * b34 + a34 *b44,

		a41 *b11  +a42*b21  +a43*b31  +a44*b41,
		a41*b12  +a42*b22  +a43*b32  +a44*b42,
		a41*b13  +a42*b23  +a43*b33  +a44*b43,
		a41*b14  +a42*b24  +a43*b34  + a44*b44
	];
};

const rotateY = (matrix, angle) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const [ a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p ] = matrix;
	return multipleMatrices(matrix, [
		cos, 0, -sin, 0,
		0, 1, 0, 0,
		sin, 0, cos, 0,
		0, 0, 0, 1
	]);
};

const rotateZ = (matrix, angle) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const [ a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p ] = matrix;
	return multipleMatrices(matrix, [
		cos, -sin, 0, 0,
		sin, cos, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
}

const rotate = (matrix, angle, x, y, z) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const [ a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p ] = matrix;
	return [
		a * cos + x * sin, b * cos + x * sin, c * cos + x * sin, d,
		e * cos + y * sin, f * cos + y * sin, g * cos + y * sin, h,
		i * cos + z * sin, j * cos + z * sin, k * cos + z * sin, l,
		m, n, o, p,
	];
};

const scale = (matrix, sx, sy, sz) => {
	return multipleMatrices(matrix, [
		sx, 0, 0, 0,
		0, sy, 0, 0,
		0, 0, sz, 0,
		0, 0, 0, 1
	]);
};

const createProjectionMatrix = (width, height, depth) => {
	const aspect = width / height;
	const fov = Math.PI / 4; // 45 degrees
	const f = 1.0 / Math.tan(fov / 2);
	const near = 0.1;
	const far = 500.0;
	return [
       f / aspect, 0, 0, 0,
       0, f, 0, 0,
       0, 0, (far + near)/(near - far), -1,
       0, 0, (2 * far * near)/(near - far), 0,
    ];
};

const createMapScreen = () => {
	const canvas = document.getElementById('map');
	const ctx = canvas.getContext('webgl2');

	if (! ctx) {
		throw new Error('WebGL2 not supported');
	}

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
	const vertexShader = ctx.createShader(ctx.VERTEX_SHADER);
	ctx.shaderSource(vertexShader, vertexShaderSource);
	ctx.compileShader(vertexShader);
	if (!ctx.getShaderParameter(vertexShader, ctx.COMPILE_STATUS)) {
		throw new Error('Vertex shader compilation failed: ' + ctx.getShaderInfoLog(vertexShader));
	}
	const fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER);
	ctx.shaderSource(fragmentShader, fragmentShaderSource);
	ctx.compileShader(fragmentShader);
	if (!ctx.getShaderParameter(fragmentShader, ctx.COMPILE_STATUS)) {
		throw new Error('Fragment shader compilation failed: ' + ctx.getShaderInfoLog(fragmentShader));
	}
	const program = ctx.createProgram();
	ctx.attachShader(program, vertexShader);
	ctx.attachShader(program, fragmentShader);
	ctx.linkProgram(program);
	if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
		throw new Error('Program linking failed: ' + ctx.getProgramInfoLog(program));
	}
	ctx.useProgram(program);
	const positionAttributeLocation = ctx.getAttribLocation(program, 'a_position');
	const positionBuffer = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
	const vertices = new Float32Array([
		-1.0, -1.0, 0.0,
		1.0, -1.0, 0.0,
		0.0, 1.0, 0.0,
	]);
	const vao = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, vao);
	ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
	ctx.enableVertexAttribArray(positionAttributeLocation);
	ctx.vertexAttribPointer(positionAttributeLocation, 3, ctx.FLOAT, false, 0, 0);

	const model = scale(createBlankMatrix(), 0.05, 0.05 * aspectRatio, 1.0);
	const modelMatrix = new Float32Array(model);
	const modelUniformLocation = ctx.getUniformLocation(program, 'u_model');
	ctx.uniformMatrix4fv(modelUniformLocation, false, modelMatrix);

	return Object.freeze({
		update: ( rotation, pos ) => {
			const model = scale(
				rotateZ(
					createBlankMatrix(),
					-rotation
				),
				0.05,
				0.05 * aspectRatio,
				1.0
			);
			const modelMatrix = new Float32Array(model);
			ctx.uniformMatrix4fv(modelUniformLocation, false, modelMatrix);

			ctx.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
			ctx.clear(ctx.COLOR_BUFFER_BIT);
			ctx.bindBuffer(ctx.ARRAY_BUFFER, vao);
			ctx.drawArrays(ctx.TRIANGLES, 0, vertices.length / 3);
		},
		updateCanvasSize: (width, height) => {
			canvas.width = width / 8;
			canvas.height = height / 8;
			ctx.viewport(0, 0, canvas.width, canvas.height);
		}
	})
};

document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('webgl2');

	if (! ctx) {
		throw new Error('WebGL2 not supported');
	}

	const mapScreen = createMapScreen();

	let width, height;

	const updateCanvasSize = () => {
		const ratio = window.innerWidth / window.innerHeight;
		if (ratio < aspectRatio) {
			width = window.innerWidth;
			height = window.innerWidth / aspectRatio;
		} else {
			width = window.innerHeight * aspectRatio;
			height = window.innerHeight;
		}
		canvas.width = width;
		canvas.height = height;
		ctx.viewport(0, 0, width, height);

		mapScreen.updateCanvasSize( width, height );
	};
	updateCanvasSize();
	window.addEventListener('resize', updateCanvasSize);

	ctx.enable(ctx.DEPTH_TEST);

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
	const vertexShader = ctx.createShader(ctx.VERTEX_SHADER);
	ctx.shaderSource(vertexShader, vertexShaderSource);
	ctx.compileShader(vertexShader);
	if (!ctx.getShaderParameter(vertexShader, ctx.COMPILE_STATUS)) {
		throw new Error('Vertex shader compilation failed: ' + ctx.getShaderInfoLog(vertexShader));
	}
	const fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER);
	ctx.shaderSource(fragmentShader, fragmentShaderSource);
	ctx.compileShader(fragmentShader);
	if (!ctx.getShaderParameter(fragmentShader, ctx.COMPILE_STATUS)) {
		throw new Error('Fragment shader compilation failed: ' + ctx.getShaderInfoLog(fragmentShader));
	}
	const program = ctx.createProgram();
	ctx.attachShader(program, vertexShader);
	ctx.attachShader(program, fragmentShader);
	ctx.linkProgram(program);
	if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
		throw new Error('Program linking failed: ' + ctx.getProgramInfoLog(program));
	}
	ctx.useProgram(program);
	const positionAttributeLocation = ctx.getAttribLocation(program, 'a_position');
	const positionBuffer = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

	const map = [
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1,
		1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	];

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

	const indices = new Uint16Array(generateIndices(points.length / 3));
	const vao = ctx.createVertexArray();
	ctx.bindVertexArray(vao);
	const vbo = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, vbo);
	ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
	const ebo = ctx.createBuffer();
	ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, ebo);
	ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
	ctx.enableVertexAttribArray(positionAttributeLocation);
	ctx.vertexAttribPointer(positionAttributeLocation, 3, ctx.FLOAT, false, 0, 0);

	let controls = {
		up: false,
		down: false,
		left: false,
		right: false,
		z: false,
		x: false,
	};

	const modelUniformLocation = ctx.getUniformLocation(program, 'model');
	const model = createBlankMatrix();
	const modelMatrix = new Float32Array(model);

	const view = translate(createBlankMatrix(), 0.0, 0.0, -3.0);
	const viewMatrix = new Float32Array(view);
	const viewUniformLocation = ctx.getUniformLocation(program, 'view');
	ctx.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);

	const projection = createProjectionMatrix(width, height, 500.0);
	const projectionMatrix = new Float32Array(projection);
	const projectionUniformLocation = ctx.getUniformLocation(program, 'projection');
	ctx.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);

	ctx.uniformMatrix4fv(modelUniformLocation, false, modelMatrix);
	ctx.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
	ctx.clear(ctx.COLOR_BUFFER_BIT);
	ctx.bindVertexArray(vao);
	ctx.drawElements(ctx.TRIANGLES, indices.length, ctx.UNSIGNED_SHORT, 0);

	const rotation = createMovement(0.005, 0.05, 0.9);
	const acc = createVelocity(0.01, 0.1, 0.9);
	let pos = {
		x: 0,
		y: 0,
	};

	const update = () => {
		rotation.update(controls.left, controls.right);
		acc.update(controls.up, controls.down);
		pos.x += Math.cos(rotation.getValue() + Math.PI / 2) * acc.getValue();
		pos.y += Math.sin(rotation.getValue() + Math.PI / 2) * acc.getValue();
		const gridPos = {
			x: 8 + pos.x / 2,
			y: 8 + pos.y / -2,
		};
		const view = rotateY(
			translate(createBlankMatrix(), -pos.x, 0, pos.y),
			-rotation.getValue()
		);
		const viewMatrix = new Float32Array(view);
		ctx.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);
		ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
		ctx.bindVertexArray(vao);
		ctx.drawElements(ctx.TRIANGLES, indices.length, ctx.UNSIGNED_SHORT, 0);

		mapScreen.update( rotation.getValue(), pos );

		requestAnimationFrame(update);
	};
	requestAnimationFrame(update);

	window.addEventListener('keydown', (event) => {
		switch (event.key) {
			case 'ArrowLeft':
				controls.left = true;
				break;
			case 'ArrowRight':
				controls.right = true;
				break;
			case 'ArrowUp':
				controls.up = true;
				break;
			case 'ArrowDown':
				controls.down = true;
				break;
			case 'z':
				controls.z = true;
				break;
			case 'x':
				controls.x = true;
				break;
			default:
				return; // Exit this handler for other keys
		}
		event.preventDefault(); // Prevent default action (e.g., scrolling)
	});

	window.addEventListener('keyup', (event) => {
		switch (event.key) {
			case 'ArrowLeft':
				controls.left = false;
				break;
			case 'ArrowRight':
				controls.right = false;
				break;
			case 'ArrowUp':
				controls.up = false;
				break;
			case 'ArrowDown':
				controls.down = false;
				break;
			case 'z':
				controls.z = false;
				break;
			case 'x':
				controls.x = false;
				break;
			default:
				return; // Exit this handler for other keys
		}
		event.preventDefault(); // Prevent default action (e.g., scrolling)
	});
});