const slugify = ( string, { prefix = '/' } = {} ) => {
    const slug = string
		.normalize( 'NFD' )
		.replace( /^\/|[\u0300-\u036f]/g, '' )
		.replace( /\W+/g, '-')
		.toLowerCase();
	return prefix + slug;
};

export { slugify };