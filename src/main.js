import * as THREE from "/three/three.js";
import Stats from "/three/stats.module.js";

import { OrbitControls } from "/three/OrbitControls.js";

import { World } from "/world.js";

let container, stats;
let camera, controls, scene, renderer;

const worldWidth = 128, worldDepth = 128;
const worldHalfWidth = worldWidth / 2;
const worldHalfDepth = worldDepth / 2;

const clock = new THREE.Clock( );

function init( ) {
    const world = new World( 10000, 10 );
    container = document.getElementById( "container" );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 30000 );
    camera.position.y = 25000;

    scene = new THREE.Scene( );
    scene.background = new THREE.Color( 0xbfd1e5 );
    const ambientLight = new THREE.AmbientLight( 0xeeeeee, 3 );
    scene.add( ambientLight );

    world.makeAccidents( 40, 50 );
    world.buildTriangles( scene );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.useLegacyLights = false;
    container.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );

    controls.movementSpeed = 1000;
    controls.lookSpeed = 0.125;
    controls.lookVertical = true;

    stats = new Stats( );
    container.appendChild( stats.dom );

    window.addEventListener( "resize", onWindowResize );
}

function onWindowResize( ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix( );

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate( ) {
    requestAnimationFrame( animate );

    render( );
    stats.update( );
}

function render( ) {
    controls.update( clock.getDelta( ) );
    renderer.render( scene, camera );
}

init( );
animate( );
