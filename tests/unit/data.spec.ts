import { expect } from 'chai';
import { DataPacket } from '../../src/telemetry/data'

describe('DataPacket', () => {
    it('can be initialized', () => {
        let d = new DataPacket(1, 1);
        expect(d).to.not.be.null;
        expect(d.ra).to.equal(1);
        expect(d.distance).to.equal(1);
    });
    it('can interpolate', () => {
        let d0 = new DataPacket(0, 0);
        let d2 = new DataPacket(2, 2);
        let d1 = d0.interpolate(0.5, d2);

        expect(d1).to.not.be.null;
        expect(d1.ra).to.equal(1);
        expect(d1.distance).to.equal(1);

        let d = d0.interpolate(0.25, d2);

        expect(d).to.not.be.null;
        expect(d.ra).to.equal(0.5);
        expect(d.distance).to.equal(0.5);

    });
});