class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    divide(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magnitudeSq() {
        return this.x * this.x + this.y * this.y;
    }

    limit(scalar) {
        const mSq = this.magnitudeSq();
        if (mSq > scalar * scalar) {
            this.divide(Math.sqrt(mSq)).multiply(scalar);
        }
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    static fromAngle(radian) {
        const x = Math.cos(radian * Math.PI),
            y = Math.sin(radian * Math.PI);
        return new Vector2(x, y);
    }
}

export { Vector2 };