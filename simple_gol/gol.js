// setting
const world_size_x = 199;
const world_size_y = 199;
const start_life = 10000;

// global var

var i, j;
var x, y;
var neighbor;
var world_switch = true;

var world_buffer_1 = new Array();
var world_buffer_2 = new Array();

for(i = 0; i < world_size_x; i++) {
    world_buffer_1[i] = new Array();
    world_buffer_2[i] = new Array();

    for(j = 0; j < world_size_y; j++) {
        world_buffer_1[i][j] = 0;
        world_buffer_2[i][j] = 0;
    }
}


// set random life
for(i = 0; i < start_life; i++){
    // random x,y
    x = Math.floor(Math.random() * world_size_x);
    y = Math.floor(Math.random() * world_size_y);

    if(world_buffer_1[x][y] == 1) {
        i--;
    }
    else if (world_buffer_1[x][y] == 0) {
        world_buffer_1[x][y] = 1;
        world_buffer_2[x][y] = 1;
    }
}

function make_world_point_color(world_array){
    let data = new Array;
    for(let i = 0, x = -0.99; i < world_size_x; i++, x += 0.01){
        for(let j = 0, y = -0.99; j < world_size_y; j++, y += 0.01){
            if(world_array[i][j] == 0){
                data.push(x, y, 0.0, 0.0, 0.0);
            }
            else if(world_array[i][j] == 1){
                data.push(x, y, 1.0, 1.0, 1.0);
            }
            else{
                console.log('else', world_array[i][j]);
                return;
            }
        }
    }
    return data;
}

function find_neighbor(i, j, world_array) {
    return  world_array[(i+world_size_x-1)%world_size_x] [(j+world_size_y-1)%world_size_y]+ 
            world_array[ i]                              [(j+world_size_y-1)%world_size_y]+
            world_array[(i+1)%world_size_x]              [(j+world_size_y-1)%world_size_y]+
            world_array[(i+world_size_x-1)%world_size_x] [ j]+
            world_array[(i+1)%world_size_x]              [ j]+
            world_array[(i+world_size_x-1)%world_size_x] [(j+1)%world_size_y]+
            world_array[ i]                              [(j+1)%world_size_y]+
            world_array[(i+1)%world_size_x]              [(j+1)%world_size_y];
}



function life_change(){
    let now_world;
    let next_world;

    if (world_switch == true) {
        now_world = world_buffer_1;
        next_world = world_buffer_2;
    } else {
        now_world = world_buffer_2;
        next_world = world_buffer_1;
    }

    for(i = 0; i < world_size_x; i++){
        for(j = 0; j < world_size_y; j++){

            neighbor = find_neighbor(i, j, now_world);

    		if(neighbor < 2 || neighbor > 3) {
                next_world[i][j] = 0;
            }
            else if(neighbor == 3) {
                next_world[i][j] = 1;
        	}
    		else if(neighbor == 2) {
                next_world[i][j] = now_world[i][j];
            }
        }
    }

    world_switch = !world_switch;

    return next_world;
}


var vertexShaderText = [
    'precision mediump float;',
    'attribute vec2 position;',
    'attribute vec3 color;',
    'varying vec3 fragColor;',
    '',
    'void main() {',
    'fragColor = color;',
    'gl_Position = vec4(position, 0.0, 1.0);',
    'gl_PointSize = 2.0;',
    '}',
].join('\n');

var fragmentShaderText = [
    'precision mediump float;',
    'varying vec3 fragColor;',
    '',
    'void main() {',
    'gl_FragColor = vec4(fragColor, 1.0);',
    '}',
].join('\n');

const canvas = document.getElementById('main');
const gl = canvas.getContext('webgl');

// gl.clearColor(0, 0, 0, 1);
// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderText);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('error compile vertexShader', gl.getShaderInfoLog(vertexShader));
    // return;
}

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderText);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('error compile fragmentShader', gl.getShaderInfoLog(fragmentShader));
    // return;
}

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('error link program', gl.getProgramInfoLog(program));
    // return;
}

var data = make_world_point_color(world_buffer_1);
    
var buffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    
var para_position = gl.getAttribLocation(program, 'position');
// gl.vertexAttribPointer(
//     para_position,//location
//     2,//number of element per attriburte
//     gl.FLOAT,// type of elements
//     gl.FLASE,//GL.SHORT normalize or not ; false -> not short -> to [-1, 1]
//     5 * Float32Array.BYTES_PER_ELEMENT,//size of from an individual vertex
//     0// offect fron the beginning of a single vertex to this attribute
// );
// gl.enableVertexAttribArray(para_position);

var para_color = gl.getAttribLocation(program, 'color');
// gl.vertexAttribPointer(
//     para_color,//location
//     3,//number of element per attriburte
//     gl.FLOAT,// type oof elements
//     gl.FALSE,//
//     5 * Float32Array.BYTES_PER_ELEMENT,//size of from an individual vertex
//     2 * Float32Array.BYTES_PER_ELEMENT// offect fron the beginning of a single vertex to this attribute
// );
// gl.enableVertexAttribArray(para_color);

// gl.useProgram(program);

var gen = 0;

document.addEventListener('keydown', (event) =>{

    switch(event.which) {
        // a
        case 65:
            auto = !auto;
            auto_go();
            break;
        // d
        case 68:
            show_word();
            break;

        // f
        case 70:
            location.reload();
            break;
    }

}, false);

function show_word(){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(para_position);
    gl.vertexAttribPointer(para_position,2,gl.FLOAT,gl.FLASE,5 * Float32Array.BYTES_PER_ELEMENT,0);

    gl.enableVertexAttribArray(para_color);
    gl.vertexAttribPointer(para_color,3,gl.FLOAT,gl.FALSE,5 * Float32Array.BYTES_PER_ELEMENT,2 * Float32Array.BYTES_PER_ELEMENT);

    gl.useProgram(program);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // gl.enable(gl.POINT_SPRITE);
    // gl.enable(gl.VERTEX_PROGRAM_POINT_SIZE);
    // console.log(data.length/5);
    gl.drawArrays(gl.POINTS, 0, data.length/5);

    // let world = life_change();
    data = make_world_point_color(life_change());

    document.getElementById("result_output").innerHTML = gen;
    gen ++;
}

var auto = false;
var loop = function() {
    show_word();
    if (auto === true){
        requestAnimationFrame(loop);
    }
    else if (auto === false){
        cancelAnimationFrame(loop);
    }
}

function auto_go(){
    if (auto === true){
        requestAnimationFrame(loop);
    }
    else if (auto === false){
        cancelAnimationFrame(loop);
    }
}