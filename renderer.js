main();

function main() {
    var canvas = document.getElementById("canvas");
    var vshader = `
    void main() {

        // Set vertex position: vec4(X, Y, Z, 1.0)
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  
        // Point size in pixels: float
        gl_PointSize = 10.0;
    };`

    var fshader = `
    void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
        // Normalized pixel coordinates (from 0 to 1)
        vec2 uv = fragCoord/iResolution.xy;

        // Time varying pixel color
        vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

        // Output to screen
        fragColor = vec4(col,1.0);
    }`
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    // Initialize the GL context
    var gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not support it.",
        );
        return;
    }

    // Compile the vertex shader
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vshader);
    gl.compileShader(vs);

    // Compile the fragment shader
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fshader);
    gl.compileShader(fs);

    // Create the WebGL program and use it
        var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
}