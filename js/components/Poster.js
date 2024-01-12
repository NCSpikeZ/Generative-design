import { Canvas, Canvas3d } from './Canvas.js';
import { slugify } from '../tools/slugify.js';

const a4 = {
    width: 595,
    height: 842,
    widthCm: 21,
    realRatio: 2480 / 595
};

const cm = a4.width / a4.widthCm;

class Poster{
    static formats = {
        a4: {
            width: 595,
            height: 842,
            widthCm: 21,
            realRatio: 2480 / 595
        },
        a3: {
            width: 595,
            height: 842,
            realRatio: 3508 / 595,
        }
    };

    static cm = 595 / 21;

    constructor( { parent = '.main-wrapper', margin = 2, context = '2d', rendererOptions = {} } = {} ) {
        this._draw = () => {
            console.log( 'No drawing function passed' );
        }; 

        this.width = Poster.formats.a4.width;
        this.height = Poster.formats.a4.height;
        this.gut = margin * Poster.cm;
        this.footer = this.gut * 2;
        this.innerWidth = Math.round( this.width - this.gut * 2 );
        this.innerHeight = Math.round( this.height - this.gut - this.footer ); 
        this.context = context;
        this.rendererOptions = rendererOptions;
        this.setInfos();
        this.preview = new ChildPoster( this.width, this.height, this.innerWidth, this.innerHeight, { parent: parent, preview: true, context: context, rendererOptions: rendererOptions } );
    }

    async draw( canvas = this.preview ) {
        const options = {};

        if( this.context === '2d' ){
            options.ctx = canvas.getContext();
            options.width = canvas.getWidth();
            options.height = canvas.getHeight();
            options.canvas = canvas.innerCanvas;
            this._draw( options )
            .then( ( result ) => {
                this.drawPoster( canvas );
            });
        } else{
            options.width = canvas.innerCanvas.width;
            options.height = canvas.innerCanvas.height;
            options.canvas = canvas.innerCanvas;
            this._draw( options )
            .then( ( result ) => {
                this.drawPoster( canvas );
            });

        }        
    }

    async drawPoster( _poster ) {
        const poster = _poster.self,
              innerPoster = _poster.innerCanvas,
              ctx = poster.ctx;
        
        ctx.save();
            ctx.fillStyle = 'white';
            ctx.fillRect( 0, 0, poster.width, poster.height );
        ctx.restore();

        // const img = innerPoster.getPixels();

        let bbox,
            fontHeight,
            textY;

        ctx.font = `500 14px Clash Display`;
        bbox = ctx.measureText( this.title );
        fontHeight = bbox.actualBoundingBoxAscent + bbox.actualBoundingBoxDescent;
        textY = this.gut + this.innerHeight + fontHeight + cm * .75;
        ctx.fillText( this.title, this.gut, textY );

        const by = `by ${ this.firstname } ${ this.lastname } · ${ this.schoolClass } · 2023 - 2024`;
        ctx.font = '400 10px Clash Display';
        bbox = ctx.measureText( by );
        fontHeight = bbox.actualBoundingBoxAscent + bbox.actualBoundingBoxDescent;
        ctx.fillText( by, this.gut, textY + fontHeight + Poster.cm * 0.25 );

        Canvas.loadImage( innerPoster.self.toDataURL( "image/png" ) )
            .then( ( image ) => {
                return ctx.drawImage( image, this.gut, this.gut, innerPoster.width, innerPoster.height );
            } )
            .then( () => {
                if( _poster.toExport ){
                    const image = poster.self.toDataURL();
                    // create temporary link  
                    const tmpLink = document.createElement( 'a' );  
                    tmpLink.download = `${ slugify( `${this.firstname}-${this.lastname}-${this.schoolClass}_${_poster.format}`, { prefix: '' }) }.png`; // set the name of the download file 
                    tmpLink.href = image;  
                    
                    // temporarily add link to body and initiate the download  
                    document.body.appendChild( tmpLink );  
                    tmpLink.click();  
                    document.body.removeChild( tmpLink );  
                }
            } );
    }

    setInfos( title = 'Project title', firstname = 'Isaac', lastname = 'Clark', schoolClass = 'B3G' ){
        this.title = title;
        this.firstname = firstname;
        this.lastname = lastname;
        this.schoolClass = schoolClass;
    }

    setDrawing( fn ) {
        this._draw = fn;
    }

    export( _format = 'a4' ) {
        const format = Poster.formats[ _format ];
        const a4 = new ChildPoster( format.width, format.height, this.innerWidth, this.innerHeight, { scaling: format.realRatio, preview: false, toExport: true, format: _format, context: this.context, rendererOptions: this.rendererOptions } );
        this.draw( a4 );
    }
}

class ChildPoster{


    constructor( width, height, innerWidth, innerHeight, { parent = '.main-wrapper', preview = false, scaling = window.devicePixelRatio, margin = 2, toExport = false, format = null, context = "2d", rendererOptions = {} } = {} ) {
        const options = {
            parent: parent,
            append: preview,
            dpr: scaling
        };
        
        this.self = new Canvas( width, height, options );

        if( context === '2d' ){
            this.innerCanvas = new Canvas( innerWidth, innerHeight, { append: false, dpr: scaling, contextOptions: { willReadFrequently: true } } );
        } else {
            this.innerCanvas = new Canvas3d( innerWidth, innerHeight, { append: false, dpr: scaling, rendererOptions: rendererOptions } );
        }

        this.toExport = toExport;
        this.format = format;

        if( preview ){
            this.self.self.style.setProperty( '--ratio-w', width / height );
            this.self.self.style.setProperty( '--ratio-h', height / width );
            this.self.self.style.setProperty( '--width',  width + 'px' );
            this.self.self.style.setProperty( '--height', height + 'px' );
        }
    }

    getWidth() {
        return this.innerCanvas.width;
    }

    getHeight() {
        return this.innerCanvas.height;
    }
    
    getContext() {
        return this.innerCanvas.ctx;
    }
}

export { Poster, ChildPoster };