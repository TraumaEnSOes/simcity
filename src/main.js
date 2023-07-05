import * as THREE from '/three/three.js';
import Stats from '/three/stats.module.js';

import { OrbitControls } from '/three/OrbitControls.js';

class Dictionary3D {
    constructor( ) {
        this._xMap = { };
        this._yMap = { };
        this._zMap = { };
        this._values = { };
        this._free = [ ];
        this._nextKey = 0;
    }

    _getSlot( x, y, z ) {
        const xSet = this._xMap[x];
        if( !xSet ) {
            return;
        }

        const ySet = this._yMap[y];
        if( !ySet ) {
            return;
        }

        const zSet = this._zMap[z];
        if( !zSet ) {
            return;
        }

        const xuySet = new Set( );
        xSet.forEach( function( value ) {
            if( ySet.has( value ) ) {
                xuySet.add( value )
            }
        } );

        const result = new Set( );
        xuySet.forEach( function( value ) {
            if( zSet.has( value ) ) {
                result.add( value );
            }
        } );

        result.forEach( function( key ) {
            const slot = this._values[key];
            if( slot && ( slot[0] === x ) && ( slot[1] === y ) && ( slot[2] === z ) ) {
                return slot;
            }
        } )
    }

    get( x, y, z ) {
        slot = this._getSlot( x, y, z );

        return Array.isArray( slot ) ? slot[3] : undefined;
    }

    update( x, y, z, value ) {
        slot = this._getSlot( x, y, z );

        if( Array.isArray( slot ) ) {
            slot[3] = value;
        } else {
            
        }
    }

    _allocKey( ) {
        var result;

        if( this._free.length ) {
            result = this._free.pop( );
        } else {
            result = this._nextKey;
            ++this._nextKey;
        }

        return result;
    }

    _freeKey( key ) {
        this._freeKey.push( key );
    }
};

class World {
    constructor( radius, detail ) {
        this._params = {
            radius: radius,
            detail: detail,
            x: 0,
            y: 0,
            z: 0
        };
        this._xMap = { };
        this._yMap = { };
        this._zMap = { };
        this._points = World._generatePoints( radius, detail );
        this._triangles = { }

        this._fillMaps( );
    }

    _fillMaps( ) {
        const xMap = this._xMap;
        const yMap = this._yMap;
        const zMap = this._zMap;

        this._points.forEach( function( points, index ) {
            xMap[points[0]] ??= new Set( );
            xMap[points[0]].add( index );
            yMap[points[1]] ??= new Set( );
            yMap[points[1]].add( index );
            zMap[points[2]] ??= new Set( );
            zMap[points[2]].add( index );

            xMap[points[3]] ??= new Set( );
            xMap[points[3]].add( index );
            yMap[points[4]] ??= new Set( );
            yMap[points[4]].add( index );
            zMap[points[5]] ??= new Set( );
            zMap[points[5]].add( index );

            xMap[points[6]] ??= new Set( );
            xMap[points[6]].add( index );
            yMap[points[7]] ??= new Set( );
            yMap[points[7]].add( index );
            zMap[points[8]] ??= new Set( );
            zMap[points[8]].add( index );
        } );
    }

    randomElevation( count = 0 ) {
        if( count === 0 ) {
            count = this._points.length;
        }
        const totalPoints = this._points.length;

        const modified = { };
        for( let idx = 0; idx < count; ++idx ) {
            const triangleIdx = Math.trunc( Math.random( ) * totalPoints );
            const triangle = this._points[triangleIdx];
            let x, y, z;

            while( true ) {
                x = triangle[0];
                y = triangle[1];
                z = triangle[2];

                if( modified[x] === undefined ) {

                }
            }
    
            // const currentDistance = Math.sqrt( x * x + y * y + z * z );
            const newDistance = 1.15;
            const newX = x * newDistance;
            const newY = y * newDistance;
            const newZ = z * newDistance;

            const toApply = this.findTriangles( x, y, z );
            console.log( "Aplicando sobre", toApply.size, "triangulos" );
            const self = this;

            toApply.forEach( function( index ) {
                const triangle = self._points[index];

                if( ( triangle[0] == x ) && ( triangle[1] == y ) && ( triangle[2] == z ) ) {
                    triangle[0] = newX;
                    triangle[1] = newY;
                    triangle[2] = newZ;
                } else if( ( triangle[3] == x ) && ( triangle[4] == y ) && ( triangle[5] == z ) ) {
                    triangle[3] = newX;
                    triangle[4] = newY;
                    triangle[5] = newZ;
                } else if( ( triangle[6] == x ) && ( triangle[7] == y ) && ( triangle[8] == z ) ) {
                    triangle[6] = newX;
                    triangle[7] = newY;
                    triangle[8] = newZ;
                }
            } );
        }
    }

    findTriangles( x, y, z ) {
        const xMap = this._xMap[x];
        const yMap = this._yMap[y];
        const zMap = this._zMap[z];

        const xuyMap = new Set( );
        xMap.forEach( function( index ) {
            if( yMap.has( index ) ) {
                xuyMap.add( index );
            }
        } );

        const result = new Set( );
        xuyMap.forEach( function( index ) {
            if( zMap.has( index ) ) {
                result.add( index );
            }
        } )

        return result;
    }

    buildTriangles( scene ) {
        const incX = this._params.x;
        const incY = this._params.y;
        const incZ = this._params.z;
        if( incX || incY || incZ ) {
            this._points.forEach( function( points ) {
                points[0] += incX;
                points[1] += incY;
                points[2] += incZ;

                points[3] += incX;
                points[4] += incY;
                points[5] += incZ;

                points[6] += incX;
                points[7] += incY;
                points[8] += incZ;
            } );
        }

        const pow = Math.pow( 256, 3 );

        this._points.forEach( function( position ) {
            const geometry = new THREE.BufferGeometry( );
            geometry.setAttribute( "position", new THREE.BufferAttribute( position, 3 ) );
            const material = new THREE.MeshBasicMaterial( { color: Math.floor( Math.random( ) * pow ) } );
    
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        } );
    }

    static _generatePoints( radius, detail ) {    
        const geo = new THREE.IcosahedronGeometry( radius, detail );
        const v = geo.attributes.position.array;
        const limit = geo.attributes.position.count * 3;
        const result = [ ];

        for( let idx = 0; idx < limit; idx += 9 ) {
            const current = new Float32Array( 9 );
            current[0] = v[idx];
            current[1] = v[idx + 1];
            current[2] = v[idx + 2];
            current[3] = v[idx + 3];
            current[4] = v[idx + 4];
            current[5] = v[idx + 5];
            current[6] = v[idx + 6];
            current[7] = v[idx + 7];
            current[8] = v[idx + 8];

            result.push( current );
        }

        geo.dispose( );

        return result;
    }
}

let container, stats;
let camera, controls, scene, renderer;

const worldWidth = 128, worldDepth = 128;
const worldHalfWidth = worldWidth / 2;
const worldHalfDepth = worldDepth / 2;

const clock = new THREE.Clock( );

function init( ) {
    const world = new World( 10000, 5 );
    container = document.getElementById( "container" );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.y = 20000;

    scene = new THREE.Scene( );
    scene.background = new THREE.Color( 0xbfd1e5 );
    const ambientLight = new THREE.AmbientLight( 0xeeeeee, 3 );
    scene.add( ambientLight );

    // world.randomElevation( 2 );
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
