import * as PIXI from 'pixi.js';

import Sprite from './sprite';
import Telemetry from './telemetry/telemetry';
import { HorizonTelemetrySource } from './telemetry/horizon';
import { OrbitingBody } from './orbit';
import { StaticHorizonTelemetrySource } from './telemetry/horizon_static';
import TelemetrySource from './telemetry/source';

export abstract class Mission extends OrbitingBody {

    constructor(app: PIXI.Application, id: number,
            source: TelemetrySource = new StaticHorizonTelemetrySource(id),
            private finalTelem?: Date) {
        super(app);
        this.scale = 1e7 / this.pixi_sprite.width;
        this.minScale = 0.05;
        this.x = 1e35; // WAY off screen
        this.y = 1e35; // WAY off screen
        this.telemetry = new Telemetry(id, source);
    }

    update(date: Date) {
        if (this.finalTelem === undefined || date <= this.finalTelem) {
            super.update(date);
        }
        else {
            this.x = 1e35; // WAY off screen
            this.y = 1e35; // WAY off screen
        }
    }
}

export class VoyagerMission extends Mission {
    create_sprite(): PIXI.Sprite {
        let sprite = new PIXI.Sprite(PIXI.loader.resources[require('./images/voyager.png')].texture);
        return sprite;
    }
}

export class MarinerMission extends Mission {
    constructor(app: PIXI.Application, id: number) {
        super(app, id, new StaticHorizonTelemetrySource(id), new Date(1963, 0, 1))
        this.minScale = 0.02;
    }

    create_sprite(): PIXI.Sprite {
        let sprite = new PIXI.Sprite(PIXI.loader.resources[require('./images/mariner2.png')].texture);
        return sprite;
    }
}

export class PioneerMission extends Mission {
    constructor(app: PIXI.Application, id: number) {
        super(app, id, new StaticHorizonTelemetrySource(id));
        this.minScale = 0.03;
    }

    create_sprite(): PIXI.Sprite {
        let sprite = new PIXI.Sprite(PIXI.loader.resources[require('./images/pioneer10.png')].texture);
        return sprite;
    }
}

export class GalileoMission extends Mission {
    constructor(app: PIXI.Application, id: number) {
        super(app, id, new StaticHorizonTelemetrySource(id), new Date(2003, 8, 21));
        this.minScale = 0.15;
    }

    create_sprite(): PIXI.Sprite {
        let sprite = new PIXI.Sprite(PIXI.loader.resources[require('./images/galileo.png')].texture);
        return sprite;
    }
}

export class CassiniMission extends Mission {
    constructor(app: PIXI.Application, id: number) {
        super(app, id, new StaticHorizonTelemetrySource(id));
        this.minScale = 0.08;
    }

    create_sprite(): PIXI.Sprite {
        let sprite = new PIXI.Sprite(PIXI.loader.resources[require('./images/cassini.png')].texture);
        return sprite;
    }
}