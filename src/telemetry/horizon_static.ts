import * as moment from 'moment';

import { TelemetrySource } from './source';

export class StaticHorizonTelemetrySource extends TelemetrySource {
    private csv: string;

    constructor(id: number) {
        super(id);
        if(id == 199) {
            this.info = require('./raw/mercury.info.horizon').toString();
            this.csv = require('./raw/mercury.horizon').toString();
        }
        else if(id == 299) {
            this.info = require('./raw/venus.info.horizon').toString();
            this.csv = require('./raw/venus.horizon').toString();
        }
        else if(id == 399) {
            this.info = require('./raw/earth.info.horizon').toString();
            this.csv = require('./raw/earth.horizon').toString();
        }
        else if(id == 499) {
            this.info = require('./raw/mars.info.horizon').toString();
            this.csv = require('./raw/mars.horizon').toString();
        }
        else if(id == 599) {
            this.info = require('./raw/jupiter.info.horizon').toString();
            this.csv = require('./raw/jupiter.horizon').toString();
        }
        else if(id == 699) {
            this.info = require('./raw/saturn.info.horizon').toString();
            this.csv = require('./raw/saturn.horizon').toString();
        }
        else if(id == 799) {
            this.info = require('./raw/uranus.info.horizon').toString();
            this.csv = require('./raw/uranus.horizon').toString();
        }
        else if(id == 899) {
            this.info = require('./raw/neptune.info.horizon').toString();
            this.csv = require('./raw/neptune.horizon').toString();
        }
        else {
            throw new Error(`No static data for body: ${id}`);
        }
    }

    fetchRawData(startDate: Date, endDate: Date): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve(this.csv);
        });
    }
}