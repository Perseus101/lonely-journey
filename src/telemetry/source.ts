import * as moment from 'moment';

import DataPacket from './data';

export abstract class TelemetrySource {
    public info: string;

    constructor(public id: number) {
        this.info = "";
    }

    loadData(startDate: Date, endDate: Date,
            callback: (timestamp: number, packet: DataPacket) => void): Promise<void> {
        return this.fetchRawData(startDate, endDate)
            .then((csv: string) => {
                let lines = csv.split('\n');
                lines.forEach(line => {
                    line = line.trim();
                    let cells = line.split(",");
                    let timestamp = moment(cells[0], 'YYYY-MMM-DD HH:mm').valueOf();
                    try {
                        let packet = parseToData(cells);
                        callback(timestamp, packet);
                    }
                    catch(e) {
                        (window as any).test = cells;
                    }
                });
            });
    }

    abstract fetchRawData(startDate: Date, endDate: Date): Promise<string>;
}

function parseToData(cells: string[]): DataPacket {
    let raString = cells[3];
    let ltString = cells[5];

    // Parse right ascension
    let raElements = raString.split(" ");
    let ra = parseInt(raElements[0]) * 360 / 24
        + parseInt(raElements[1]) * 360 / (24 * 60)
        + parseFloat(raElements[2]) * 360 / (24 * 3600);

    // Parse light-minutes and convert to distance
    let lt = parseFloat(ltString);
    // c * (60 seconds / 1 minutes) * lt minutes
    let distance = 3e8 * 60 * lt;
    return new DataPacket(ra * Math.PI/180, distance);
}

export default TelemetrySource;