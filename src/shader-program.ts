function createShaderProgram (
	ctx: WebGL2RenderingContext,
	vertexShaderSource: string,
	fragmentShaderSource: string
): WebGLProgram {
	const vertexShader = ctx.createShader(ctx.VERTEX_SHADER);
	if (!vertexShader) {
		throw new Error('Failed to create vertex shader');
	}
	ctx.shaderSource(vertexShader, vertexShaderSource);
	ctx.compileShader(vertexShader);
	if (!ctx.getShaderParameter(vertexShader, ctx.COMPILE_STATUS)) {
		throw new Error('Vertex shader compilation failed: ' + ctx.getShaderInfoLog(vertexShader));
	}
	const fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER);
	if (!fragmentShader) {
		throw new Error('Failed to create fragment shader');
	}
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
	return program;
}

export { createShaderProgram };
