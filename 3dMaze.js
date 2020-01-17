//////////////////////////////////////////////////////////////////////////////
//
//  WebGL_example_24_GPU_per_vertex.js 
//
//  Phong Illumination Model on the GPU - Per vertex shading - Several light sources
//
//  Reference: E. Angel examples
//
//  J. Madeira - November 2017 + November 2018
//
//////////////////////////////////////////////////////////////////////////////


//----------------------------------------------------------------------------
//
// Global Variables
//

var gl = null; // WebGL context

var shaderProgram = null;

var time = 0;

var triangleVertexPositionBuffer = null;
	
var triangleVertexNormalBuffer = null;	
var end = false;

// Position of the viewer
var globalTz = -1.0;
var globalTx = -1.5;
var globalTy = -1.5;

// Speed of the "player" and a threshold to make collisions better detected
var threshold = 0.22;
var speed = 0.05;

// AngleZZ that controlls the viewer angle
var globalAngleZZ = 0.0;

// Angle to which we are rotating the whole map to get the view in 1st person
var degrees = -90;

var primitiveType = null;

var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];

var music = new Audio('music/background.mp3');
//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Vertex Coordinates and the Vertex Normal Vectors

function initBuffers( model ) {	
	
	// Vertex Coordinates
		
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems =  model.vertices.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			triangleVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
	
	// Vertex Normal Vectors
		
	triangleVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( model.normals), gl.STATIC_DRAW);
	triangleVertexNormalBuffer.itemSize = 3;
	triangleVertexNormalBuffer.numItems = model.normals.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
			triangleVertexNormalBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);

}

//----------------------------------------------------------------------------

//  Drawing the model

function drawModel( model,
					mvMatrix,
					primitiveType ) {

	// The the global model transformation is an input
	
	// Concatenate with the particular model transformations
	
    // Pay attention to transformation order !!
    
	mvMatrix = mult( mvMatrix, translationMatrix( model.tx, model.ty, model.tz - 1 ) );
	
	mvMatrix = mult( mvMatrix, scalingMatrix( model.sx, model.sy, model.sz ) );
						 
	// Passing the Model View Matrix to apply the current transformation
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    
	// Associating the data to the vertex shader
	
	// This can be done in a better way !!

	// Vertex Coordinates and Vertex Normal Vectors
	
	initBuffers(model);
	
	// Material properties
	
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"), 
		flatten(model.kAmbi) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"),
        flatten(model.kDiff) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"),
        flatten(model.kSpec) );

	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), 
		model.nPhong );

    // Light Sources
	
	var numLights = lightSources.length;
	
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), 
		numLights );

	//Light Sources
	
	for(var i = 0; i < lightSources.length; i++ )
	{
		gl.uniform1i( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].isOn"),
			lightSources[i].isOn );
    
		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );
    
		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
    }

	gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems);
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {

	var pMatrix;

	// Clearing the frame-buffer and the depth-buffer

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.clearColor(0, 0, 0, 0.1);
	pMatrix = perspective(130, 0.5, 0.05, 50);

	// Global transformdeation !!

	// NEW --- The viewer is on (0,0,0)

	pos_Viewer[0] = 50;
	pos_Viewer[1] = 5;
	pos_Viewer[2] = 5.0;
	pos_Viewer[3] = 5.0;

	// TO BE DONE !

	// Allow the user to control the size of the
	// Passing the Projection Matrix to apply the current projection

	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");

	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	// NEW --- Passing the viewer position to the vertex shader

	gl.uniform4fv(gl.getUniformLocation(shaderProgram, "viewerPosition"),
		flatten(pos_Viewer));

	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE

	mvMatrix = mult(translationMatrix(0, 0, 0), rotationXXMatrix(degrees));
	mvMatrix = mult(mvMatrix, rotationZZMatrix(globalAngleZZ));
	mvMatrix = mult(mvMatrix, translationMatrix(globalTx, globalTy, globalTz));

	// FOR EACH LIGHT SOURCE
	for (var i = 0; i < lightSources.length; i++) {
		// Animating the light source, if defined

		var lightSourceMatrix = mat4();

		if (!lightSources[i].isOff()) {

			// COMPLETE THE CODE FOR THE OTHER ROTATION AXES

			if (lightSources[i].isRotYYOn()) {
				lightSourceMatrix = mult(
					lightSourceMatrix,
					rotationYYMatrix(lightSources[i].getRotAngleYY()));
			}
		}

		// NEW Passing the Light Souree Matrix to apply

		var lsmUniform = gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].lightSourceMatrix");

		gl.uniformMatrix4fv(lsmUniform, false, new Float32Array(flatten(lightSourceMatrix)));
	}

	// Instantianting all scene models

	for (var i = 0; i < sceneModels.length; i++) {
		drawModel(sceneModels[i],
			mvMatrix,
			primitiveType);

	}
}

// Timer

function tick() {
	time += 1;
	requestAnimFrame(tick);
	handleKeys();
	drawScene();
}


//----------------------------------------------------------------------------

function setEventListeners(){
	
	// Dropdown list
	function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
    }

    function handleKeyUp(event) {
		currentlyPressedKeys[event.keyCode] = false;
    }

	document.getElementById('reset').onclick = function() {
		// Position of the viewer
		resetPosition();
	};

	document.getElementById('seeAbove').onclick = function() {
		// Position of the viewer
		if(confirm("If you decide to see the map you'll reset your position. Still want it?"))
		{
			seeFromAbove(3);
		}
	};

	document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

var currentlyPressedKeys = {};

function handleKeys() {
	music.play();
	// W key
	if (currentlyPressedKeys[87]) {
		var moveY = parseFloat((speed * Math.cos(radians(-globalAngleZZ))));
		var moveX = parseFloat((speed * Math.sin(radians(-globalAngleZZ)+Math.PI)));

		if(maze.map[ Math.floor(Math.abs(-globalTy + moveY) + threshold)][ Math.floor(Math.abs(-globalTx + moveX) + threshold)] == 0)
		{
			document.getElementById('button1').innerHTML = Math.floor(Math.abs(-globalTy + moveY) + threshold);
			document.getElementById('button2').innerHTML = Math.floor(Math.abs(-globalTx + moveX) + threshold);
			document.getElementById('score').innerHTML = Math.floor(100000/time);
			globalTy -= moveY;
			globalTx -= moveX;
		}
		else if(maze.map[ Math.floor(Math.abs(-globalTy + moveY) + threshold)][ Math.floor(Math.abs(-globalTx + moveX) + threshold)] == 2)
		{
			end = true;
			console.log(end);
			alert("You ended the game! Your score is: " + Math.floor(100000/time));
			if (confirm("Restart?"))
			{
				resetPosition();
			}
		}
	}


	// S Key
	if (currentlyPressedKeys[83]) {
		var moveY = parseFloat((speed * Math.cos(radians(-globalAngleZZ))));
		var moveX = parseFloat((speed * Math.sin(radians(-globalAngleZZ)+Math.PI)));

		if(maze.map[ Math.floor(Math.abs(-globalTy - moveY)- threshold)][ Math.floor(Math.abs(-globalTx - moveX)+ threshold)] == 0)
		{
			document.getElementById('button1').innerHTML = Math.floor(Math.abs(-globalTy - moveY)- threshold);
			document.getElementById('button2').innerHTML = Math.floor(Math.abs(-globalTx - moveX)+ threshold);
			document.getElementById('score').innerHTML = Math.floor(100000/time);
			globalTy += moveY;
			globalTx += moveX;
		}
		else if(maze.map[Math.floor(Math.abs(-globalTy - moveY)- threshold)][ Math.floor(Math.abs(-globalTx - moveX)+ threshold)] == 2)
		{
			end = true;
			console.log(end);
			alert("You ended the game! Your score is: " + Math.floor(100000/time));
			if (confirm("Restart?"))
			{
				resetPosition();
			}
		}
	}

	// A key
	if (currentlyPressedKeys[65]) {
		globalAngleZZ-=3.8;
	}
	// D key
	if (currentlyPressedKeys[68]) {
		globalAngleZZ+=3.8;

	}

	//footSteps.pause();
}

function initWebGL( canvas ) {
	try {
		// Create the WebGL context
		// Some browsers still need "experimental-webgl"
		canvas.width = window.innerWidth * 0.8;
		canvas.height = window.innerHeight * 0.8;

		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		primitiveType = gl.TRIANGLES;

		gl.enable( gl.CULL_FACE );

		gl.cullFace( gl.BACK );
		
		gl.enable( gl.DEPTH_TEST );
	} 
	catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

//----------------------------------------------------------------------------

function runWebGL() {
	var canvas = document.getElementById("my-canvas");

	initWebGL( canvas );

	shaderProgram = initShaders( gl );

	setEventListeners();

	tick();		// A timer controls the rendering / animation

}

function resetPosition() {
	time = 0;
	globalTz = -1.0;
	globalTx = -1.5;
	globalTy = -1.5;
	globalAngleZZ = 0.0;
	degrees = -90;
	pMatrix = perspective(130, 0.5, 0.05, 50);
	document.getElementById('button1').innerHTML = Math.floor(Math.abs(-globalTy) + threshold);
	document.getElementById('button2').innerHTML = Math.floor(Math.abs(-globalTx) + threshold);
}

function seeFromAbove(x) {

	if (x) {
		pMatrix = perspective(90, 1, 0.5, 30);
		globalTz = -25.0;
		globalTx = -6.5;
		globalTy = 2;
		globalAngleZZ = 0.0;
		degrees = -70;
		// will call itself until x=0
		setTimeout(seeFromAbove, 1000, --x);
	} else {
		resetPosition();
	}
}



