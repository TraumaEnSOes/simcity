const Express = require( "express" );
const app = Express( );
const port = 3000;

app.use( Express.static( "src" ) );

app.listen( port, ( ) => {
  console.log( `Example app listening on port ${port}` )
} );
