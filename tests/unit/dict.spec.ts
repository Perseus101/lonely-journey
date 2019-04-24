import { expect } from 'chai';
import * as moment from 'moment';

import { NearestKeyDict } from '../../src/util/dict';

describe('NearestKeyDict', () => {
    it('can be initialized', () => {
        let d = new NearestKeyDict<number>();
        expect(d).to.not.be.null;
    });
    it('can store values', () => {
        let d = new NearestKeyDict<number>();
        d.set(0, 1);
        expect(d.get(0)).to.equal(1);
    });
    it('can look up keys', () => {
        let d = new NearestKeyDict<number>();
        d.set(1, 1);
        d.set(3, 2);
        d.set(5, 3);
        d.set(7, 4);
        expect(d.findKeyIndex(0)).to.equal(0);
        expect(d.findKeyIndex(2)).to.equal(1);
        expect(d.findKeyIndex(4)).to.equal(2);
        expect(d.findKeyIndex(6)).to.equal(3);
        expect(d.findKeyIndex(8)).to.equal(4);

        expect(d.findKeyIndex(-100)).to.equal(0);
        expect(d.findKeyIndex(100)).to.equal(4);
    });
    it('can look up nearby data', () => {
        let d = new NearestKeyDict<number>();
        d.set(1, 1);
        d.set(3, 2);
        d.set(5, 3);
        d.set(7, 4);

        let index = d.findKeyIndex(2)
        let key = d.getKey(index);

        expect(index).to.equal(1);
        expect(key).to.equal(3);
        expect(d.get(key)).to.equal(2);
    });


    it('can look up by date', () => {
        let date1 = new Date(1960, 0, 1, 0, 0, 0, 0);
        let date2 = new Date(1970, 0, 1, 0, 0, 0, 0);
        let date3 = new Date(1980, 0, 1, 0, 0, 0, 0);

        let d = new NearestKeyDict<number>();
        d.set(moment(date1).valueOf(), 1);
        d.set(moment(date2).valueOf(), 2);
        d.set(moment(date3).valueOf(), 3);

        let index = d.findKeyIndex(moment(new Date(1970, 1)).valueOf())
        let key = d.getKey(index);

        expect(index).to.equal(2);
        expect(d.get(key)).to.equal(3);

        index = d.findKeyIndex(moment(new Date(1960, 1)).valueOf())
        key = d.getKey(index);

        expect(index).to.equal(1);
        expect(d.get(key)).to.equal(2);

        index = d.findKeyIndex(moment(new Date(1950, 1)).valueOf())
        key = d.getKey(index);

        expect(index).to.equal(0);
        expect(d.get(key)).to.equal(1);
    });
});