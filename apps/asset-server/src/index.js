import express from "express";
import cors from 'cors';
import sharp from 'sharp';

import path from 'path';
import fs from 'fs/promises';
import { error } from "console";

const PORT = process.env.PORT || 6969;
const ASSETS_DIR = path.join( process.cwd(), 'public/assets' );

const app = express();

app.use( cors({
  origin: [ 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}) );

app.use( express.json( { limit : '10mb' } ) )

// Get image
app.get( '/api/images/:filename', async ( req, res ) => {
	try
	{
		const { filename } = req.params;
		const { width, height, format } = req.query;
		const filePath = path.join( ASSETS_DIR, 'images', filename );

		try
		{
			await fs.access( filePath )
		}
		catch
		{
			return res.status( 404 ).json( { error : `Image not found` } );
		}

		return res.sendFile( filePath );

		//TODO : Sharp image processing
	}
	catch( error )
	{
		res.status( 500 ).json( { error : `Failed to process image` } );
	}

} );

// Validate category
function validCategory( res, category )
{
	const validCategories = [ 'json' ];
	if ( !validCategories.includes( category ) )
	{
		return res.status( 400 ).json( { error : 'Invalid category' } );
	}
}

// List data files in a category
app.get( '/api/data/:category', async ( req, res ) => {
	try
	{
		const { category } = req.params;
		const categoryPath = path.join( ASSETS_DIR, 'data', category );

		validCategory( res, category );

		const files = ( await fs.readdir( categoryPath ) ).filter( file => file.endsWith( '.json' ) );

		const fileList = await Promise.all(
			files.map( async ( filename ) => {
				const filePath = path.join( categoryPath, filename );
				const fileStats = await fs.stat( filePath );

				return {
					name : filename.replace( '.json', '' ),
					category,
					filename,
					path : `api/data/${ category }/${ filename }`
				}
			} )
		);

		res.status( 200 ).json( fileList );

	}
	catch( error )
	{
		res.status( 500 ).json( { error : `Failed to process data file` } );
	}

} ); 

// Get specific data file
app.get( '/api/data/:category/:filename', async ( req, res ) => {
	try
	{
		const { category, filename } = req.params;
		
		validCategory( res, category );

		if( category === 'json' && !filename.endsWith( '.json' ) )
		{
			res.status( 400 ).json( { error : "Invalid file type" } )
		}

		const filePath = path.join( ASSETS_DIR, 'data', category, filename );

		try
		{
      await fs.access( filePath );
    }
		catch
		{
      return res.status( 404) .json( { error : 'JSON file not found' } );
    }

		const fileContent = await fs.readFile( filePath, 'utf-8' );
		const data = JSON.parse( fileContent );

		res.status( 200 ).json( data );

	}
	catch( error )
	{
		res.status( 500 ).json( { error : `Failed to process data file` } );
	}

} ); 

app.post( '/api/data/:category/:filename', async ( req, res ) => {
	try
	{
		const { category, filename } = req.params;
		const { data, overwrite = false } = req.body;

		validCategory( res, category );

		if( !data )
		{
			return res.status( 400 ).json( { error : "No data provided" } );
		}

		const filePath = path.join( ASSETS_DIR, 'data', category, filename );

		if( !overwrite )
		{
			try
			{
				await fs.access( filePath );
				return res.status( 409 ).json( {
					error : "File already exists",
					code : "FILE_EXISTS"
				} )
			}
			catch{ /* Continue */ }
		}

		try
		{
			const jsonString = JSON.stringify( data, null, 2 );
			await fs.writeFile( filePath, jsonString, 'utf-8' );

			res.status( 200 ).json( {
				message : "File saved successfully",
				metadata : {
					filename,
					path : filePath
				}
			} )
		}
		catch( jsonError )
		{
			return res.status( 400 ).json( { error : "Invalid JSON structure" } );
		}


	}
	catch( error )
	{
		res.status( 500 ).json( { error : `Failed to save data file` } );
	}
} )

app.get('/', (req, res) => {
  res.send('Welcome to the image server! Access images at /images/your-image-name.jpg');
});

app.listen( PORT, () => {
	console.log( `Asset Server running on port ${PORT}` );
} )