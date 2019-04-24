import * as moment from 'moment';

import NearestKeyDict from '../util/dict';

import DataPacket from './data';

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
    private latestTimestamp: number;
    private latestDate: Date;

    constructor(
        private id: number,
        private interval="10d"
    ) {
        let endDate = new Date(this.INITIAL_DATE);
        endDate.setFullYear(this.INITIAL_DATE.getFullYear() + 10);
        this.setLatestDate(endDate);
    }

    setLatestDate(date: Date) {
        this.latestTimestamp = moment(date).valueOf();
        this.latestDate = date;
    }

    async loadData(startDate: Date, endDate: Date) {
        let startString = moment(startDate).format('YYYY-MM-DD');
        let endString = moment(endDate).format('YYYY-MM-DD');
        let requestURL = `https://cors-anywhere.herokuapp.com/https://ssd.jpl.nasa.gov/horizons_batch.cgi?batch=1&COMMAND='${this.id}'&QUANTITIES='1,21'&CENTER='500@10'&START_TIME='${startString}'&STOP_TIME='${endString}'&STEP_SIZE='${this.interval}'&CSV_FORMAT='YES'`;
        await fetch(new Request(requestURL, { method: 'GET', }), {cache: "force-cache"})
            .then(response => { return response.text() })
            .then(text => {
                let regex = /\$\$SOE[\s\S]*\$\$EOE/;
                let match = text.match(regex)[0];
                match = match.substring(6, match.length-6);
                let lines = match.split('\n');
                let data = null;
                lines.forEach(line => {
                    line = line.trim();
                    let cells = line.split(",");
                    let timestamp = moment(cells[0], 'YYYY-MMM-DD HH:mm').valueOf();
                    let packet = parseToData(cells);
                    this.data.set(timestamp, packet);
                    data = packet;
                });
                return data;
            });
    }

    getData(date: Date): DataPacket {
        let timestamp = moment(date).valueOf();
        if(this.latestTimestamp - timestamp < 1e8) {
            let startDate = this.latestDate;
            let endDate = new Date(startDate);
            endDate.setFullYear(startDate.getFullYear() + 10);
            this.setLatestDate(endDate);
            this.loadData(startDate, endDate);
        }
        let index = this.data.findKeyIndex(timestamp);

        if(index == 0) {
            return undefined;
        }

        let beforeKey = this.data.getKey(index - 1);
        let afterKey = this.data.getKey(index);

        let beforeData = this.data.get(beforeKey);
        let afterData = this.data.get(afterKey);

        return beforeData.interpolate((timestamp - beforeKey) / (afterKey - beforeKey), afterData);
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
    return new DataPacket(ra * Math.PI/180, distance);
}

export default Telemetry;