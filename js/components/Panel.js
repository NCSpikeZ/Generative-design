import {Pane} from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js";

const initPanel = ( options, poster ) => {
    const pane = new Pane();

    // FOLDERS
    const paramsFolder = pane.addFolder({
        title: 'Parameters',
    });

    const infosFolder = pane.addFolder({
        title: 'Poster',
    });

    const actionsFolder = pane.addFolder({
        title: 'Actions',
    });


    // INPUTS

    const fullscreenBtn = paramsFolder.addBinding(options, 'fullScreen', { label: 'Fit height' }  )

    infosFolder.addBinding(options, 'projectTitle', { label: 'Title' } );
    infosFolder.addBinding(options, 'firstname', { label: 'Firstname' });
    infosFolder.addBinding(options, 'lastname', { label: 'Lastname' });
    infosFolder.addBinding(options, 'schoolClass', {
        label: 'Class',
        options: {
            B3G: 'B3G',
            B2G: 'B2G'
        }
    });

    const btnDraw = actionsFolder.addButton({
        title: 'Draw' 
    });

    const btnA4 = actionsFolder.addButton({
        title: 'Export A4' 
    });

    const btnA3 = actionsFolder.addButton({
        title: 'Export A3' 
    });

    // EVENTS

    fullscreenBtn.on( 'change', ( e ) => {
        if( e.value === true ){
            poster.preview.self.self.classList.add('fullscreen');
        } else {
            poster.preview.self.self.classList.remove('fullscreen');
        }
    } );

    infosFolder.on( 'change', () => {
        poster.setInfos( options.projectTitle, options.firstname, options.lastname, options.schoolClass );
        poster.draw();
    } );

    btnA4.on( 'click', () => {
        poster.export();
    } );

    btnA3.on( 'click', () => {
        poster.export( 'a3' );
    } );

    btnDraw.on( 'click', () => {
        poster.draw();
    } );
};

export { initPanel };

