import * as moment from 'moment';
import NearestKeyDict from './util/dict';
/**
 * A wrapper class for retrieving data from NASA JPL Horizon
 *
 * Documentation: https://ssd.jpl.nasa.gov/?horizons
 *
 * Example request URL:
 * https://ssd.jpl.nasa.gov/horizons_batch.cgi?batch=1&COMMAND='499'&QUANTITIES='1,21'&START_TIME='2000-01-01'&STOP_TIME='2001-01-01'&STEP_SIZE='1d'&CSV_FORMAT='YES'
 *
 */
export class Telemetry {
    readonly INITIAL_DATE = new Date(1960, 0, 1, 0, 0, 0, 0);

    private data: NearestKeyDict<DataPacket> = new NearestKeyDict();

    constructor(
        private id: number,
        private interval="10d"
    ) {
        let endDate = new Date(this.INITIAL_DATE);
        endDate.setFullYear(this.INITIAL_DATE.getFullYear() + 1);
        this.loadData(this.INITIAL_DATE, endDate);
    }

    loadData(startDate: Date, endDate: Date) {
        let startString = moment(startDate).format('YYYY-MM-DD');
        let endString = moment(endDate).format('YYYY-MM-DD');
        let requestURL = `https://cors-anywhere.herokuapp.com/https://ssd.jpl.nasa.gov/horizons_batch.cgi?batch=1&COMMAND='${this.id}'&QUANTITIES='1,21'&CENTER='500@10'&START_TIME='${startString}'&STOP_TIME='${endString}'&STEP_SIZE='${this.interval}'&CSV_FORMAT='YES'`;
        fetch(new Request(requestURL, { method: 'GET', }))
            .then(response => { return response.text() })
            .then(text => {
                let regex = /\$\$SOE[\s\S]*\$\$EOE/;
                let match = text.match(regex)[0];
                match = match.substring(6, match.length-6);
                let lines = match.split('\n');
                lines.forEach(line => {
                    line = line.trim();
                    let cells = line.split(",");
                    let date = moment(cells[0], 'YYYY-MMM-DD HH:mm').valueOf();
                    this.data.set(date, parseToData(cells));
                });
            })
            .catch((e) => { console.error(e) });
    }

    getData(): DataPacket {
        return this.data.get_default();
    }
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
    let distance = 3e8/100000000 * 60 * lt;
    return new DataPacket(ra, distance);
}

class DataPacket {
    constructor(public ra: number, public distance: number) {
        this.ra = this.ra * Math.PI/180;
    }
}

export default Telemetry;