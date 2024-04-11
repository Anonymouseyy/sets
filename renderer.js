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
        vec2 coord = gl_FragCoord.xy/canvasSize.xy; // [0,1]
        coord = 2.*coord - 1.; // [-1,1]
        float scale = (sin(time) + 1.)/2.; // from 1 to 0
        coord /= scale; // from [-1,1] to [-infinity,infinity]
        if (abs(coord.x) < 1. && abs(coord.y) < 1.) {
            coord = (coord + 1.)/2.; // [0,1]
            fragColor = vec4(coord.x, coord.y, 1.-coord.x, 1);
        } else {
            fragColor = vec4(1,1,1,1);
        }
    }`

    canvas.width  = window.innerWidth;
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