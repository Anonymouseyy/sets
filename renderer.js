main();

function main() {
    var canvas = document.getElementById("canvas");
    var vshader = `
    #version 300 es

    in vec4 vertexPosition;

    void main() {
        gl_Position = vertexPosition;
    }`

    var fshader = `
    #version 300 es
    precision highp float;

    uniform vec2 canvasSize;
    uniform float time;
    out vec4 fragColor;

    void main() {
        // Normalized pixel coordinates (from 0 to 1)
        vec2 uv = gl_FragCoord.xy/canvasSize;

        // Time varying pixel color
        vec3 col = 0.5 + 0.5*cos(time+uv.xyx+vec3(0,2,4));

        // Output to screen
        fragColor = vec4(col,1.0);
    }`

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Initialize the GL context
    var gl = canvas.getContext("webgl2");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not support it.",
        );
        return;
    }

    function createShader(type, sourceCode) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sourceCode.trim());
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw gl.getShaderInfoLog(shader);
        }
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vshader));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fshader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }
    gl.useProgram(program);

    const vertices = [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.flat()), gl.STATIC_DRAW);

    const vertexPosition = gl.getAttribLocation(program, "vertexPosition");
    gl.enableVertexAttribArray(vertexPosition);
    gl.vertexAttribPointer(vertexPosition, vertices[0].length, gl.FLOAT, false, 0, 0);

    gl.uniform2f(
        gl.getUniformLocation(program, 'canvasSize'),
        canvas.width, canvas.height
    );
    const timeUniform = gl.getUniformLocation(program, 'time');

    function draw() {
        gl.uniform1f(timeUniform, performance.now() / 1000.);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);
        requestAnimationFrame(draw);
    }
    draw();
}