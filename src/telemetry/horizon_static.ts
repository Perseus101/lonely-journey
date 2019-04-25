import * as moment from 'moment';

import { TelemetrySource } from './source';

export class StaticHorizonTelemetrySource extends TelemetrySource {
    private csv: string;
    private loaded = false;

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
        else if(id == -31) {
            this.info = require('./raw/voyager1.info.horizon').toString();
            this.csv = require('./raw/voyager1.horizon').toString();
        }
        else if(id == -32) {
            this.info = require('./raw/voyager2.info.horizon').toString();
            this.csv = require('./raw/voyager2.horizon').toString();
        }
        else if(id == -2) {
            this.info = require('./raw/mariner2.info.horizon').toString();
            this.csv = require('./raw/mariner2.horizon').toString();
        }
        else if(id == -23) {
            this.info = require('./raw/pioneer10.info.horizon').toString();
            this.csv = require('./raw/pioneer10.horizon').toString();
        }
        else if(id == -24) {
            this.info = require('./raw/pioneer11.info.horizon').toString();
            this.csv = require('./raw/pioneer11.horizon').toString();
        }
        else {
            throw new Error(`No static data for body: ${id}`);
        }
    }

    fetchRawData(startDate: Date, endDate: Date): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if(!this.loaded) {
                resolve(this.csv);
                this.loaded = true;
            }
            else {
                reject("Already loaded static telemetry");
            }
        });
    }
}