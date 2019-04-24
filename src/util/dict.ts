export class NearestKeyDict<T> {
    data: { [index: number]: T; } = {};
    keys: number[] = [];

    constructor() {}

    set(index: number, value: T) {
        this.keys.push(index);
        this.keys.sort();
        this.data[index] = value;
    }

    get(key: number): T {
        return this.data[key];
    }

    getKey(index: number): number {
        return this.keys[index];
    }

    findKeyIndex(key: number): number {
        return this.findKeyIndexHelper(key, 0, this.keys.length);
    }

    private findKeyIndexHelper(key: number, start: number, end: number): number {
        if(start == end) {
            return start;
        }

        let i = Math.floor((start + end) / 2);
        if(this.keys[i] < key) {
            return this.findKeyIndexHelper(key, i + 1, end);
        }
        else {
            return this.findKeyIndexHelper(key, start, i);
        }
    }
}

export default NearestKeyDict;