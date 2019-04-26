export class DataPacket {
    constructor(public ra: number, public distance: number) {}

    /**
     * Interpolate between two data packets
     * @param alpha Value 0-1, determines how close to this packet(0)
     *              or the after packet(1) the output should be
     * @param before The packet before "this" packet, used to get the derivative for smoothing. Can be undefined.
     * @param after The packet to interpolate to. Can be undefined.
     * @param twoAfter The packet after "after", used to get the derivative for smoothing. Can be undefined.
     */
    interpolate(alpha: number, before: DataPacket, after: DataPacket, twoAfter: DataPacket): DataPacket {
        if(after === undefined) {
            return this;
        }

        let before_ra = undefined;
        let cur_ra = this.ra;
        let after_ra = after.ra;
        let two_after_ra = undefined;

        after_ra = this.loopAngleToBeCloseTo(after_ra, cur_ra);

        if (before)
            before_ra = this.loopAngleToBeCloseTo(before.ra, cur_ra);
        if (twoAfter)
            two_after_ra = this.loopAngleToBeCloseTo(twoAfter.ra, after_ra);

        let before_dist = undefined;
        let two_after_dist = undefined;
        if (before)
            before_dist = before.distance;
        if (twoAfter)
            two_after_dist = twoAfter.distance;

        return new DataPacket(
            this.interpolateValue(alpha, before_ra, cur_ra, after_ra, two_after_ra),
            this.interpolateValue(alpha, before_dist, this.distance, after.distance, two_after_dist)
        );
    }

    private loopAngleToBeCloseTo(to_be_looped: number, to_be_close_to: number): number {
        if (Math.abs(to_be_close_to - to_be_looped) > Math.PI) {
            if (to_be_close_to < to_be_looped) {
                to_be_looped -= 2 * Math.PI;
            }
            else {
                to_be_looped += 2 * Math.PI;
            }
        }
        return to_be_looped;
    }

    /**
     * Interpolates beteween "curVal" and "afterVal", using beforeVal and twoAfterVal to get the derivatives in order to smooth.
     * @param alpha Value 0-1, determines how close to this packet(0)
     *              or the after packet(1) the output should be
     * @param beforeVal The value before curVal, used to get the derivative for smoothing. Can be undefined.
     * @param curVal The value to start interpolating from
     * @param afterVal The value to interpolate to.
     * @param twoAfterVal The value after afterVal, used to get the derivative for smoothing. Can be undefined.
     */
    private interpolateValue(alpha: number, beforeVal: number, curVal: number, afterVal: number, twoAfterVal: number): number {
        // linear => (alpha * afterVal + (1 - alpha) * curVal)

        let y1 = curVal;
        let y2 = afterVal;

        let middleDeriv = afterVal - curVal;

        let m1 = middleDeriv;
        let m2 = middleDeriv;

        if (beforeVal)
            m1 = ((curVal - beforeVal) + middleDeriv) / 2;

        if (twoAfterVal)
            m2 = ((twoAfterVal - afterVal) + middleDeriv) / 2;

        let a = m2 + m1 - 2*y2 + 2*y1;
        let b = -m2 - 2*m1 + 3*y2 - 3*y1;
        let c = m1;
        let d = y1;

        return a * Math.pow(alpha, 3) + b * Math.pow(alpha, 2) + c * alpha + d;
    }
}

export default DataPacket;