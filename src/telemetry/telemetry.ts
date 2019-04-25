import * as moment from 'moment';

import NearestKeyDict from '../util/dict';

import DataPacket from './data';
import TelemetrySource from './source';
import { StaticHorizonTelemetrySource } from './horizon_static';

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

    private unresolved: Promise<void>[] = [];

    constructor(
        private id: number,
        private source: TelemetrySource = new StaticHorizonTelemetrySource(id)
    ) {
        this.setLatestDate(this.INITIAL_DATE);
        this.loadData();
    }

    await_load(): Promise<any> {
        let promise = Promise.all(this.unresolved);
        this.unresolved = [];
        return promise;
    }

    setLatestDate(date: Date) {
        this.latestTimestamp = moment(date).valueOf();
        this.latestDate = date;
    }

    private loadData(step = 10) {
        let startDate = this.latestDate;
        let endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + step);
        this.setLatestDate(endDate);

        // Catch and ignore errors loading telemetry
        this.unresolved.push(this.source.loadData(startDate, endDate,
            (timestamp: number, packet: DataPacket) => {
                this.data.set(timestamp, packet);
            })
            .catch((e) => {})
        );
    }

    getData(date: Date): DataPacket {
        let timestamp = moment(date).valueOf();
        if(this.latestTimestamp - timestamp < 1e8) {
            this.loadData();
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

export default Telemetry;
