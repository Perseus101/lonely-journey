import * as moment from 'moment';

import { TelemetrySource } from './source';

export class HorizonTelemetrySource extends TelemetrySource {
    constructor(id: number, private interval = '10d') {
        super(id);
    }

    fetchRawData(startDate: Date, endDate: Date): Promise<string> {
        let startString = moment(startDate).format('YYYY-MM-DD');
        let endString = moment(endDate).format('YYYY-MM-DD');
        let requestURL = `https://cors-anywhere.herokuapp.com/https://ssd.jpl.nasa.gov/horizons_batch.cgi?batch=1&COMMAND='${this.id}'&QUANTITIES='1,21'&CENTER='500@10'&START_TIME='${startString}'&STOP_TIME='${endString}'&STEP_SIZE='${this.interval}'&CSV_FORMAT='YES'`;
        return fetch(new Request(requestURL, { method: 'GET', }), {cache: "force-cache"})
            .then(response => { return response.text() })
            .then(text => {
                let regex = /\$\$SOE[\s\S]*\$\$EOE/;
                let match = text.match(regex)[0];
                let csv = match.substring(6, match.length-6);
                return csv;
            });
    }
}