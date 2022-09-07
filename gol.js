// setting
const world_size_x = 199;
const world_size_y = 199;
const start_life = 10000;

// global var
var i, j;
var x, y;
var neighbor;
var world_switch = true;

// global var for count
var living = 0;
var md = 0;
var mb = 0;
var max_die = 0;
var max_born = 0;
var fps = 0;
var dt_start = 0;

// some parameter
const param_mutation = 0.1;
const param_heredity = 0.8;
const param_prop_effect = 0.001;

const mutation_lv1 = 2;
const mutation_lv2 = 1;

const heredity_lv1 = 1;
const heredity_lv2 = 0.5;

// world buffer for now world and next world
var world_buffer_1 = new Array();
var world_buffer_2 = new Array();

//initialize world
for(i = 0; i < world_size_x; i++) {
    world_buffer_1[i] = new Array();
    world_buffer_2[i] = new Array();

    for(j = 0; j < world_size_y; j++) {
        // die -> when neighbor over 3 or less 2, not easy to die
        // born -> when neighbor == 2, maybe be living
        world_buffer_1[i][j] = {'status': 0, 'die': 0, 'born': 0};
        world_buffer_2[i][j] = {'status': 0, 'die': 0, 'born': 0};
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
    else if (world_buffer_1[x][y]['status'] == 0) {
        world_buffer_1[x][y]['status'] = 1;
        world_buffer_2[x][y]['status'] = 1;
    }
}

function make_world_point_color(world_array){
    let data = new Array;

    for(let i = 0, x = -0.99; i < world_size_x; i++, x += 0.01){
        for(let j = 0, y = -0.99; j < world_size_y; j++, y += 0.01){
            if(world_array[i][j]['status'] == 0){
                data.push(x, y, 0.0, 0.0, 0.0);
            }
            else if(world_array[i][j]['status'] == 1){
                living += 1;
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

    if (world_array[i][j]['die'] + world_array[i][j]['born'] > max_born + max_die){
        max_born = world_array[i][j]['born'];
        max_die = world_array[i][j]['die'];
    }

    if (world_array[i][j]['die'] + world_array[i][j]['born'] > mb + md){
        mb = world_array[i][j]['born'];
        md = world_array[i][j]['die'];
    }

    return  {
            'living':  
                        world_array[(i+world_size_x-1)%world_size_x] [(j+world_size_y-1)%world_size_y] ['status']+ 
                        world_array[ i]                              [(j+world_size_y-1)%world_size_y] ['status']+
                        world_array[(i+1)%world_size_x]              [(j+world_size_y-1)%world_size_y] ['status']+
                        world_array[(i+world_size_x-1)%world_size_x] [ j]                              ['status']+
                        world_array[(i+1)%world_size_x]              [ j]                              ['status']+
                        world_array[(i+world_size_x-1)%world_size_x] [(j+1)%world_size_y]              ['status']+
                        world_array[ i]                              [(j+1)%world_size_y]              ['status']+
                        world_array[(i+1)%world_size_x]              [(j+1)%world_size_y]              ['status'],
            'die':
                        world_array[(i+world_size_x-1)%world_size_x] [(j+world_size_y-1)%world_size_y] ['die']+ 
                        world_array[ i]                              [(j+world_size_y-1)%world_size_y] ['die']+
                        world_array[(i+1)%world_size_x]              [(j+world_size_y-1)%world_size_y] ['die']+
                        world_array[(i+world_size_x-1)%world_size_x] [ j]                              ['die']+
                        world_array[(i+1)%world_size_x]              [ j]                              ['die']+
                        world_array[(i+world_size_x-1)%world_size_x] [(j+1)%world_size_y]              ['die']+
                        world_array[ i]                              [(j+1)%world_size_y]              ['die']+
                        world_array[(i+1)%world_size_x]              [(j+1)%world_size_y]              ['die'],
            'born': 
                        world_array[(i+world_size_x-1)%world_size_x] [(j+world_size_y-1)%world_size_y] ['born']+ 
                        world_array[ i]                              [(j+world_size_y-1)%world_size_y] ['born']+
                        world_array[(i+1)%world_size_x]              [(j+world_size_y-1)%world_size_y] ['born']+
                        world_array[(i+world_size_x-1)%world_size_x] [ j]                              ['born']+
                        world_array[(i+1)%world_size_x]              [ j]                              ['born']+
                        world_array[(i+world_size_x-1)%world_size_x] [(j+1)%world_size_y]              ['born']+
                        world_array[ i]                              [(j+1)%world_size_y]              ['born']+
                        world_array[(i+1)%world_size_x]              [(j+1)%world_size_y]              ['born'],
        }
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

    		if(neighbor['living'] < 2 || neighbor['living'] > 3) {
                // check neighbor property
                // use random with 'die'

                // if die
                if (compute_cell_next_die(now_world[i][j])){
                    cell_die(next_world[i][j]);
                }
                // if no die -> stay now
                else{
                    next_world[i][j]['status'] = now_world[i][j]['status'];
                    next_world[i][j]['die'] = now_world[i][j]['die'];
                    next_world[i][j]['born'] = now_world[i][j]['born'];
                }
            }
            else if(neighbor['living'] == 3) {
                // 
                // next_world[i][j]['status'] = 1;
                // check neighbor property
                // add heredity
                // add mutation
                // add new life property
                cell_live(next_world[i][j], neighbor);
        	}
    		else if(neighbor['living'] == 2) {
                // check neighbor 
                // maybe be living maybe die
                
                // if status == 1 -> stay now
                if (now_world[i][j]['status'] == 1){
                    next_world[i][j]['status'] = now_world[i][j]['status'];
                    next_world[i][j]['die'] = now_world[i][j]['die'];
                    next_world[i][j]['born'] = now_world[i][j]['born'];
                }
                // if status == 0 -> maybe living
                else if (now_world[i][j]['status'] == 0){
                    if (compute_cell_next_live(neighbor)){
                        cell_live(next_world[i][j], neighbor);
                    }

                    else{
                        cell_die(next_world[i][j]);
                    }
                }
            }
        }
    }

    world_switch = !world_switch;

    return next_world;
}

function cell_live(cell, neighbor){
    // let prop = {'die': 0, 'born': 0};
    let prop_h = {'die': 0, 'born': 0};
    let prop_m = {'die': 0, 'born': 0};

    // neighbor die, living, add mutation?0.0001?
    if (Math.random() < param_heredity){
        prop_h = compute_heredity(neighbor);
        // console.log(prop_h);
    }

    if (Math.random() < param_mutation){
        prop_m = compute_mutation();
        // console.log(prop_m);
    }

    cell['status'] = 1;
    cell['die'] = prop_h['die'] + prop_m['die'];
    cell['born'] = prop_h['born'] + prop_m['born'];
}

function cell_die(cell){
    cell['status'] = 0;
    cell['die'] = 0;
    cell['born'] = 0;
}

// heredity  // 50% get heredity 90% get no heredity -> param_heredity
// 10% get all 'parents' die and 'born'
// 15% get all 'parents' die or 'born'
// 25% get 1/2 'parents' die and born
// 50% get 1/2 'parents' die or born
function compute_heredity(neighbor){
    let prop = {'die': 0, 'born': 0};
    // get or not
    if(Math.random() < param_heredity){
        // get level
        let level = Math.random();
        let option = Math.random();
        if (level < 0.1 ){
            prop['die'] += neighbor['die'];
            prop['born'] += neighbor['born'];
        }
        else if (level >= 0.1 && level < 0.25){
            if (option < 0.5){
                prop['die'] += neighbor['die'];
            }
            else{
                prop['born'] += neighbor['born'];
            }
        }
        else if (level >= 0.25 && level < 0.5){
            prop['die'] += parseInt(0.5 * neighbor['die']);
            prop['born'] += parseInt(0.5 * neighbor['born']);
        }
        else if (level >= 0.5){
            if (option < 0.5){
                prop['die'] += parseInt(0.5 * neighbor['die']);
            }
            else{
                prop['born'] += parseInt(0.5 * neighbor['born']);
            }
        }
    }

    return prop
}

// mutation  // 0.01% get mutation -> param_mutation
// 10% born +2 and die +2 
// 15% born +2 or die +2 
// 25% die +1 and die +1
// 50% die +1 or die +1
function compute_mutation(){    
    let prop = {'die': 0, 'born': 0};
    // get or not
    if (Math.random() < param_mutation){
        // get level
        let level = Math.random();
        let direction = Math.random();
        let option = Math.random();

        // console.log(level, direction, option);

        if (level < 0.1 ){
            if(direction < 0.5){
                prop['die'] -= 5;
                prop['born'] -= 5;
            }
            else{
                prop['die'] += 5;
                prop['born'] += 5;
            }
        }
        else if (level >= 0.1 && level < 0.25){
            if(direction < 0.5){
                if (option < 0.5){
                    prop['die'] -= 5;
                }
                else{
                    prop['born'] -= 5;
                }
            }
            else{
                if (option < 0.5){
                    prop['die'] += 5;
                }
                else{
                    prop['born'] += 5;
                }
            }
        }
        else if (level >= 0.25 && level < 0.5){
            if(direction < 0.5){
                prop['die'] -= 2;
                prop['born'] -= 2;
            }
            else{
                prop['die'] += 2;
                prop['born'] += 2;
            }
        }
        else if (level >= 0.5){
            if(direction < 0.5){
                if (option < 0.5){
                    prop['die'] -= 2;
                }
                else{
                    prop['born'] -= 2;
                }
            }
            else{
                if (option < 0.5){
                    prop['die'] += 2;
                }
                else{
                    prop['born'] += 2;
                }
            }
        }
    }

    return prop
}

function compute_cell_next_live(neighbor){
    // if live return true
    // else return false
    // born_chance = param_prop_effect * neighbor['born'];
    if (Math.random() < param_prop_effect * neighbor['born']) {
        return true;
    }
    else{
        return false;
    }
}

function compute_cell_next_die(cell){
    // if die return true
    // else return false
    if (Math.random() < param_prop_effect * cell['die']) {
        return false;
    }
    else{
        return true;
    }
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

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderText);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('error compile vertexShader', gl.getShaderInfoLog(vertexShader));
}

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderText);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('error compile fragmentShader', gl.getShaderInfoLog(fragmentShader));
}

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('error link program', gl.getProgramInfoLog(program));
}

var data = make_world_point_color(world_buffer_1);
    
var buffer = gl.createBuffer();
var para_position = gl.getAttribLocation(program, 'position');
var para_color = gl.getAttribLocation(program, 'color');

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
            show_world();
            break;
        // f
        case 70:
            location.reload();
            break;
    }
}, false);


var fps_arv_count = 0;

var his_max_count = 0;

function show_world(){

    dt_start = Date.now();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(para_position);
    gl.vertexAttribPointer(para_position,2,gl.FLOAT,gl.FLASE,5 * Float32Array.BYTES_PER_ELEMENT,0);

    gl.enableVertexAttribArray(para_color);
    gl.vertexAttribPointer(para_color,3,gl.FLOAT,gl.FALSE,5 * Float32Array.BYTES_PER_ELEMENT,2 * Float32Array.BYTES_PER_ELEMENT);

    gl.useProgram(program);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, data.length/5);

    data = make_world_point_color(life_change());

    document.getElementById("max_this").innerHTML = max_die + '-' + max_born;
    document.getElementById("max_his").innerHTML = md + '-' + mb;

    max_die = 0;
    max_born = 0;

    his_max_count ++;
    if (his_max_count % 100 === 0){
        his_max_count = 0;
        md = 0;
        mb = 0;
    }

    document.getElementById("living").innerHTML = living;

    living = 0;

    document.getElementById("result_output").innerHTML = gen;
    gen ++;

    fps = (fps + 1000/(Date.now() - dt_start)) / 2;
    fps_arv_count ++; 
    if (fps_arv_count % 20 === 0) {
        document.getElementById("fps").innerHTML = fps;
        fps_arv_count = 0;
    }
}

var auto = false;
var loop = function() {
    show_world();
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