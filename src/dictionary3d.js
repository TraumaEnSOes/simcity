class Dictionary3D {
    constructor( ) {
        this._xMap = { };
        this._yMap = { };
        this._zMap = { };
        this._values = { };
        this._free = [ ];
        this._nextKey = 0;
    }

    _getSlot( x, y, z, create = false ) {
        let created = false;
        let xSet = this._xMap[x];
        if( !xSet ) {
            if( create ) {
                xSet = new Set( );
                this._xMap[x] = xSet;
                created = true;
            } else {
                return;
            }
        }

        let ySet = this._yMap[y];
        if( !ySet ) {
            if( create ) {
                ySet = new Set( );
                this._yMap[y] = ySet;
                created = true;
            } else {
                return;
            }
        }

        let zSet = this._zMap[z];
        if( !zSet ) {
            if( create ) {
                zSet = new Set( );
                this._zMap[z] = zSet;
                created = true;
            } else {
                return;
            }
        }

        if( created == true ) {
            key = this._allocKey( );

            xSet.add( key );
            ySet.add( key );
            zSet.add( key );
            const slot = [ x, y, z, false ];
            this._values[key] = slot;

            return slot;
        } else {
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
    }

    get( x, y, z ) {
        slot = this._getSlot( x, y, z );

        return Array.isArray( slot ) ? slot[3] : undefined;
    }

    update( x, y, z, value ) {
        slot = this._getSlot( x, y, z, true );
        slot[3] = value;
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
}

export { Dictionary3D }