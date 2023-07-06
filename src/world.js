import * as THREE from "/three/three.js";

const GreensColors = [
    0x006633,
    0x336600
];

const MaroonsColors = [
    0x800000,
    0x8B0000,
    0xA52A2A,
    0xB22222,
    0xCD5C5C,
    0xE9967A,
];

const WaterColor = 0x0000FF;

class World {
    constructor( radius, detail ) {
        this._params = {
            radius: radius,
            detail: detail,
            x: 0,
            y: 0,
            z: 0
        };

        this._pointsIndex = { };
        this._pointsIndex3D = { };
        this._points = World._generatePoints( radius, detail );
        this._states = { }

        this._fillAdyacents( );
    }

    _fillAdyacents( ) {
        const tArray = new Float32Array( 3 );
        const pIndex = this._pointsIndex;
        const pIndex3D = this._pointsIndex3D;

        this._points.forEach( function( points, index ) {
            pIndex3D[points] = index;

            tArray[0] = points[0];
            tArray[1] = points[1];
            tArray[2] = points[2];
            pIndex[tArray] ??= new Set( );
            pIndex[tArray].add( index );            

            tArray[0] = points[3];
            tArray[1] = points[4];
            tArray[2] = points[5];
            pIndex[tArray] ??= new Set( );
            pIndex[tArray].add( index );

            tArray[0] = points[6];
            tArray[1] = points[7];
            tArray[2] = points[8];
            pIndex[tArray] ??= new Set( );
            pIndex[tArray].add( index );
        } );
/*
        const adyacents = this._adyacentsTriangles;
        // Reserve full array.
        adyacents[this._points.length - 1] = new Set( );

        pIndex.values( ).forEach( function( group ) {
            group.forEach( function( index ) {
                adyacents[index] ??= new Set( );
                
            } );
        } );
*/
    }

    makeAccidents( up, down ) {
        if( down ) {
            this._doRandomWater( down );
        }
        if( up ) {
            this._doRandomElevation( up );
        }
    }

    _doRandomWater( count ) {

    }

    _doRandomElevation( count ) {
        const totalPoints = this._points.length;
        const states = this._states;
        const tArray = new Float32Array( 3 );

        for( let idx = 0; idx < count; ++idx ) {
            const triangleIdx = Math.trunc( Math.random( ) * totalPoints );
            const triangle = this._points[triangleIdx];
            const x = triangle[0];
            const y = triangle[1];
            const z = triangle[2];

            tArray[0] = x;
            tArray[1] = y;
            tArray[2] = z;
            if( states[tArray] ) {
                --idx;
                continue;
            }

            // const currentDistance = Math.sqrt( x * x + y * y + z * z );
            const newDistance = 1.05;
            const newX = x * newDistance;
            const newY = y * newDistance;
            const newZ = z * newDistance;

            tArray[0] = newX;
            tArray[1] = newY;
            tArray[2] = newZ;
            states[tArray] = 1; // Mark point raised.

            const toApply = this.findTriangles( triangle[0], triangle[1], triangle[2] );
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

    _doRandomWater( count ) {
        const totalPoints = this._points.length;
        const states = this._states;
        const tArray = new Float32Array( 3 );

        for( let idx = 0; idx < count; ++idx ) {
            const triangleIdx = Math.trunc( Math.random( ) * totalPoints );
            const triangle = this._points[triangleIdx];
            const x = triangle[0];
            const y = triangle[1];
            const z = triangle[2];

            tArray[0] = x;
            tArray[1] = y;
            tArray[2] = z;
            if( states[tArray] ) {
                --idx;
                continue;
            }

            states[tArray] = -1; // Mark point as water.
        }
    }

    findTriangles( x, y, z ) {
        const tArray = new Float32Array( 3 );
        tArray[0] = x;
        tArray[1] = y;
        tArray[2] = z;

        const group = this._pointsIndex[tArray];
        const result = new Set( );

        if( group !== undefined ) {
            group.forEach( function( value ) {
                result.add( value );
            } );
        }

        return result;
    }

    findTriangle( x, y, z, x2, y2, z2, x3, y3, z3 ) {
        let arr;

        if( x instanceof Float32Array ) {
            arr = x;
        } else {
            arr = new Float32Array( 9 );
            arr[0] = x;
            arr[1] = y;
            arr[2] = z;
            arr[3] = x2;
            arr[4] = y2;
            arr[5] = z2;
            arr[6] = x3;
            arr[7] = y3;
            arr[8] = z3;
        }

        return this._pointsIndex3D( arr );
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
        const tArray = new Float32Array( 3 );
        const states = this._states;
        const self = this;
        // const texture = new THREE.TextureLoader( ).load( "/texture.jpg" );

        this._points.forEach( function( position, index ) {
            const geometry = new THREE.BufferGeometry( );
            geometry.setAttribute( "position", new THREE.BufferAttribute( position, 3 ) );
            const state = self._triangleState( position );
            const material = new THREE.MeshBasicMaterial( { color: self._getColor( state ) } );
//            if( state === 0 ) {
//                material = new THREE.MeshBasicMaterial( { map: texture } );
//            } else {
//                material = new THREE.MeshBasicMaterial( { color: self._getColor( state ) } );
//            }
    
            const mesh = new THREE.Mesh( geometry, material );
            mesh.userData.worldTriangleIndex = index;
            scene.add( mesh );
        } );
    }

    _triangleState( position ) {
        const tArray = new Float32Array( 3 );
        let state = 0;

        tArray[0] = position[0];
        tArray[1] = position[1];
        tArray[2] = position[2];

        state = this._states[tArray];
        if( state ) {
            return state;
        }

        tArray[0] = position[3];
        tArray[1] = position[4];
        tArray[2] = position[5];

        state = this._states[tArray];
        if( state ) {
            return state;
        }

        tArray[0] = position[6];
        tArray[1] = position[7];
        tArray[2] = position[8];

        state = this._states[tArray];
        if( state ) {
            return state;
        }

        return 0;
    }

    _getColor( state ) {
        if( state > 0 ) {
            return MaroonsColors[Math.floor( Math.random( ) * 6 )]
        } else if( state < 0 ) {
            return WaterColor;
        } else {
            return GreensColors[Math.floor( Math.random( ) * 2 )]
        }
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

export { World }
