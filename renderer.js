main()

function main() {
    var canvas = document.getElementById("canvas")
    var vshader = `#version 300 es
    in vec4 a_position;
    void main() {
        gl_Position = a_position;
    }`

    var fshader = `#version 300 es
    precision highp float;

    uniform vec2 u_resolution;
    uniform vec2 u_center;
    uniform float u_scale;
    uniform int u_maxIterations;

    out vec4 outColor;

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
        vec2 c = u_center + uv * u_scale;

        vec2 z = vec2(0.0);
        int iter;
        for (iter = 0; iter < u_maxIterations; ++iter) {
            if (dot(z, z) > 4.0) break;
            z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        }

        float t = float(iter) / float(u_maxIterations);
        outColor = vec4(vec3(t), 1.0);
    }`

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    // Initialize the GL context
    var gl = canvas.getContext("webgl2")

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not support it.",
        )
        return
    }

    function createShader(gl, type, source) {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader))
            gl.deleteShader(shader)
            throw new Error("Shader compile failed.")
        }
        return shader
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program))
            gl.deleteProgram(program)
            throw new Error("Program link failed.")
        }
        return program
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vshader)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fshader)
    const program = createProgram(gl, vertexShader, fragmentShader)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ]), gl.STATIC_DRAW)

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const positionLocation = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")
    const centerLocation = gl.getUniformLocation(program, "u_center")
    const scaleLocation = gl.getUniformLocation(program, "u_scale")
    const maxIterationsLocation = gl.getUniformLocation(program, "u_maxIterations")

    function render(center, scale, maxIterations) {
        gl.viewport(0, 0, canvas.width, canvas.height)

        gl.useProgram(program)
        gl.bindVertexArray(vao)

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
        gl.uniform2f(centerLocation, center[0], center[1])
        gl.uniform1f(scaleLocation, scale)
        gl.uniform1i(maxIterationsLocation, maxIterations)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    let center = [-0.75, 0.0]
    let scale = 3.0
    const maxIterations = 1000

    canvas.addEventListener("wheel", (e) => {
        const zoomFactor = 1.1
        scale *= e.deltaY > 0 ? zoomFactor : 1 / zoomFactor
    })

    canvas.addEventListener("mousemove", (e) => {
        if (e.buttons === 1) { // Left mouse button
            const dx = (e.movementX / canvas.width) * scale
            const dy = (e.movementY / canvas.height) * scale
            center[0] -= dx
            center[1] += dy
        }
    })

    function animate() {
        render(center, scale, maxIterations)
        requestAnimationFrame(animate)
    }

    animate()
}