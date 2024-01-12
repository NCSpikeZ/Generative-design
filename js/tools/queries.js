const getElement = ( domString, { parent = document, asArray = false } = {} ) => {
    let e = parent.querySelectorAll( domString );

    if( ! asArray && e.length === 1 ){
        e = e[ 0 ];
    }

    if( e.length === 0 ){
        return false;
    }

    return e;
};

const create = ( domstring, { className = null } ) => {
    const element = document.createElement( domstring );
    element.className = className;
    return element;
};

export { getElement, create };