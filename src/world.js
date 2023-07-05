import * as THREE from "/three/three.js";

class World {
    constructor( radius, detail ) {
        this._params = {
            radius: radius,
            detail: detail,
            x: 0,
            y: 0,
            z: 0
        };
        this._adyacents = { }
        this._points = World._generatePoints( radius, detail );
        this._triangles = { }

        this._fillAdyacents( );
    }

    _fillAdyacents( ) {
        const tArray = new Float32Array( 3 );
        const adyacents = this._adyacents;

        this._points.forEach( function( points, index ) {
            tArray[0] = points[0];
            tArray[1] = points[1];
            tArray[2] = points[2];
            adyacents[tArray] ??= new Set( );
            adyacents[tArray].add( index );

            tArray[0] = points[3];
            tArray[1] = points[4];
            tArray[2] = points[5];
            adyacents[tArray] ??= new Set( );
            adyacents[tArray].add( index );

            tArray[0] = points[6];
            tArray[1] = points[7];
            tArray[2] = points[8];
            adyacents[tArray] ??= new Set( );
            adyacents[tArray].add( index );
        } );
    }

    randomElevation( count = 0 ) {
        if( count === 0 ) {
            count = this._points.length;
        }
        const totalPoints = this._points.length;
        const elevated = { };
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
            if( elevated[tArray] ) {
                --idx;
                continue;
            }

            // const currentDistance = Math.sqrt( x * x + y * y + z * z );
            const newDistance = 1.1;
            const newX = x * newDistance;
            const newY = y * newDistance;
            const newZ = z * newDistance;

            delete elevated[tArray];
            tArray[0] = newX;
            tArray[1] = newY;
            tArray[2] = newZ;
            elevated[tArray] = true;

            const toApply = this.findTriangles( triangle[0], triangle[1], triangle[2] );
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
        const tArray = new Float32Array( 3 );
        tArray[0] = x;
        tArray[1] = y;
        tArray[2] = z;

        const origin = this._adyacents[tArray];
        if( !origin ) {
            return;
        }

        const result = new Set( );

        origin.forEach( function( value ) {
            result.add( value );
        } );

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
            // const material = new THREE.MeshBasicMaterial( { color: 0x33FF33 } );
    
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

export { World }
