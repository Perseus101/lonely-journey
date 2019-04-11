export class NearestKeyDict<T> {
    private _data: { [index: number]: T; } = {};
    private _keys: number[] = [];

    constructor() {}

    set(index: number, value: T) {
        this._keys.push(index);
        this._data[index] = value;
    }

    get(index: number): T {
        return this._data[index];
    }

    get_default(): T {
        return this._data[this._keys[0]];
    }
}

export default NearestKeyDict;