import * as PIXI from 'pixi.js';

import Sprite from './sprite';
import Telemetry from './telemetry/telemetry';
import { HorizonTelemetrySource } from './telemetry/horizon';
import { OrbitingBody } from './orbit';
import { StaticHorizonTelemetrySource } from './telemetry/horizon_static';

export abstract class Mission extends OrbitingBody {
    constructor(app: PIXI.Application, id: number) {
        super(app);
        this.telemetry = new Telemetry(id, new StaticHorizonTelemetrySource(id));
    }
}

export class VoyagerMission extends Mission {
    create_sprite(): PIXI.Sprite {
        let sprite = new PIXI.Sprite(PIXI.loader.resources[require('./images/voyager.png')].texture);
        return sprite;
    }
}