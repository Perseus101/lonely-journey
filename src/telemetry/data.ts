export class DataPacket {
    constructor(public ra: number, public distance: number) {}

    /**
     * Interpolate between two data packets
     * @param alpha Value 0-1, determines how close to this packet(0)
     *              or the other packet(1) the output should be
     * @param other The packet to interpolate between
     */
    interpolate(alpha: number, other: DataPacket): DataPacket {
        if(other === undefined) {
            return this;
        }
        let old_ra = this.ra;
        let new_ra = other.ra;
        if(Math.abs(this.ra - other.ra) > Math.PI) {
            if(this.ra < other.ra) {
                old_ra += 2 * Math.PI;
            }
            else {
                new_ra += 2 * Math.PI;
            }
        }

        return new DataPacket(
            (alpha * new_ra + (1 - alpha) * old_ra),
            (alpha * other.distance + (1 - alpha) * this.distance)
        );
    }
}

export default DataPacket;