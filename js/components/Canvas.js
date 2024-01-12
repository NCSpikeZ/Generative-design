import { Vector2 } from "../tools/Vector2.js";
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

class Canvas {
    constructor(
        width = 300,
        height = width,
        {
            canvasElement = document.createElement("canvas"),
            parent = "body",
            dpr = window.devicePixelRatio,
            append = true,
            context = "2d",
            contextOptions = {}
        } = {}
    ) {
        this.self = canvasElement;
        this.ctx = this.self.getContext( context, contextOptions );
        this.update(width, height, dpr);

        if (append) {
            document.querySelector(parent).appendChild(this.self);
        }
    }

    update(width = this.width, height = this.height, dpr = window.devicePixelRatio ) {
        this.dpr = dpr;
        this.width = width;
        this.height = height;
        this.self.width = Math.round( width * this.dpr );
        this.self.height = Math.round( height * this.dpr );
        this.ratio = height / width;
        this.self.style.width = `${90}vmin`;
        this.self.style.height = `${ 90 * this.ratio }vmin`;
        this.ctx.resetTransform();
        this.ctx.scale( this.dpr, this.dpr );
    }

    clear( x = 0, y = 0, width = this.width, height = this.height ) {
        this.ctx.clearRect(x, y, width, height);
    }

    getPixels( x = 0, y = 0, w = this.width, h = this.height ) {
        return this.ctx.getImageData( x, y, w * this.dpr, h * this.dpr );
    }

    triangle( x, y, radius, rotation = 0 ) {
        const offset = new Vector2( x + radius, y + radius ),
              angle = 2 / 3;
        const p1 = Vector2.fromAngle(0 + rotation)
            .multiply(radius)
            .add(offset),
        p2 = Vector2.fromAngle(angle + rotation)
            .multiply(radius)
            .add(offset),
        p3 = Vector2.fromAngle(angle * 2 + rotation)
            .multiply(radius)
            .add(offset);

        
        this.ctx.moveTo( p1.x, p1.y );
        this.ctx.lineTo( p2.x, p2.y );
        this.ctx.lineTo( p3.x, p3.y );
    }

    // getImage( cb ) {
    //     return Canvas.loadImage( this.self.toDataURL( "image/png" ));
    // }

    static loadImage(url) {
        return new Promise((resolve) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.addEventListener("load", () => {
                resolve(image);
            });

            image.src = url;
        });
    }
}

class Canvas3d{
    constructor(
        width = 300,
        height = width,
        {
            canvas = document.createElement( 'canvas' ),
            parent = 'body',
            append = true,
            dpr = window.devicePixelRatio,
            fov = 75,
            aspect = width / height,
            near = 1,
            far = 100,
            rendererOptions = {
                // alpha: true
            }
        } = {}
    ) {
        this.self = canvas;
        this.width = width;
        this.height = height;
        rendererOptions.canvas = canvas;

        if( append ){
            document.querySelector( parent ).appendChild( this.self );
        }
        this.renderer = new THREE.WebGLRenderer( rendererOptions );
        this.renderer.setSize( width, height );
        this.renderer.setPixelRatio( dpr );
        
        this.camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
        this.camera.position.z = 20;
        
        this.scene = new THREE.Scene();
        this.scene.add( this.camera );

        this.renderer.render( this.scene, this.camera );

        // this.renderer.setClearColor( 'white', 0 );
        // this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        // this.renderer.setSize( width, height );
        // this.renderer.setPixelRatio( dpr );

        // this.scene = new THREE.Scene();

        // console.log(arguments);
        // this.camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
        // console.log(this.camera);
        // this.camera.position.z = 10;
        // this.camera.lookAt( 0, 0, 0 );
                
        // this.scene = new THREE.Scene();
        // this.scene.add( this.camera );

        // this.renderer.render( this.scene, this.camera );
    }
}

export { Canvas, Canvas3d };