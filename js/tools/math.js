const rand = (max = 1, min = 0, { round = false } = {}) => {
    let n = Math.random() * (max - min) + min;
    if (round) {
        return Math.round(n);
    }
    return n;
};

const getRandomItem = (array) => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
};

const clamp = ( num, min, max ) => {
    return Math.max( Math.min( num, max ), min );
};

const shuffleArray = ( array ) => {
	array.sort( () => {
		return Math.random() - 0.5;
	} );
};

export { rand, getRandomItem, clamp, shuffleArray };
