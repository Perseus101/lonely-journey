import * as PIXI from 'pixi.js';

import Sprite from './sprite';
import * as SunTexture from './images/sun.png';
import * as MercuryTexture from './images/mercury.png';
import * as VenusTexture from './images/venus.png';
import * as EarthTexture from './images/earth.png';
import * as MarsTexture from './images/mars.png';
import * as JupiterTexture from './images/jupiter.png';
import * as SaturnTexture from './images/saturn.png';
import * as UranusTexture from './images/uranus.png';
import * as NeptuneTexture from './images/neptune.png';
import Telemetry from './telemetry/telemetry';
import { OrbitingBody } from './orbit';
import Camera from './camera';


export abstract class Planet extends OrbitingBody {
  mass: number; //in kg
  planetRadius: number; //in m
  orbitCutoff: number; //in m
  distanceToShip: number = 0;
  distanceText: PIXI.Text;
  recommendedOrbit: number;
  recommendedTimeAccel: number;

  constructor(app: PIXI.Application) {
    super(app);

    this.distanceText = new PIXI.Text('', { fontFamily: 'Rajdhani', fontSize: 12, fill: 0xffffff, align: 'center' })
    this.distanceText.anchor.x = 0.5;
    app.stage.addChild(this.distanceText);
  }

  updateDistanceText(camera: Camera) {
    let drawnScale = this.scale * camera.scale;
    if (this.minScale != undefined && drawnScale < this.minScale) {
      drawnScale = this.minScale;
    }

    let screenX = camera.scale * (this.x - camera.x) + (this.app.renderer.width / 2);
    let screenY = camera.scale * (this.y - camera.y) + (this.app.renderer.height / 2);

    this.distanceText.x = screenX;
    this.distanceText.y = screenY - (this.pixi_sprite.height / 2) - 1.25*this.distanceText.height;

    let prefix = '';
    let number = '';
    if (this.distanceToShip > 1e9) {
      prefix = 'billion';
      number = (this.distanceToShip / 1e9).toFixed(1);
    } else if (this.distanceToShip > 1e6) {
      prefix = 'million';
      number = (this.distanceToShip / 1e6).toFixed(1);
    } else if (this.distanceToShip > 1e3) {
      prefix = 'k';
      number = (this.distanceToShip / 1e3).toFixed(1);
    } else {
      number = this.distanceToShip.toFixed(1);
    }
    this.distanceText.text = number + ' ' + prefix + ' m';
  }

  recalcDistance(x: number, y: number) {
    this.distanceToShip = Math.sqrt(
      Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)
    );
    return this.distanceToShip;
  }
}

export class Sun extends Planet {
  mass = 1.9891e30;
  orbitCutoff = 1e12;
  recommendedOrbit = 250e9;
  recommendedTimeAccel = 100000;

  setup() {
    this.scale = 2 * 695.51e6 / 775;
    this.minScale = 0.025;
    this.x = 0;
    this.y = 0;
  }

  create_sprite(): PIXI.Sprite {
    let sprite = new PIXI.Sprite(PIXI.loader.resources[SunTexture].texture);
    return sprite;
  }

  update(date: Date) {}

  await_assets(): Promise<any> {
    return Promise.resolve();
  }
}

export class Mercury extends Planet {
  mass = 3.285e23;
  orbitCutoff = 15e6;
  recommendedOrbit = 7e6;
  recommendedTimeAccel = 10;

  setup() {
    this.telemetry = new Telemetry(199);
    this.scale = 2 * 2.4397e6 / 312;
    this.minScale = 0.05;
    this.x = 0;
    this.y = 100000000000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[MercuryTexture].texture);
  }
}

export class Venus extends Planet {
  mass = 4.867e24;
  orbitCutoff = 60e6;
  recommendedOrbit = 30e6;
  recommendedTimeAccel = 10;

  setup() {
    this.telemetry = new Telemetry(299);
    this.scale = 2 * 6.0518e6 / 312;
    this.minScale = 0.05;
    this.x = 0;
    this.y = 200000000000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[VenusTexture].texture);
  }
}

export class Earth extends Planet {
  mass = 5.972e24;
  orbitCutoff = 100e6;
  recommendedOrbit = 50e6;
  recommendedTimeAccel = 100;

  setup() {
    this.telemetry = new Telemetry(399);
    this.scale = 2 * 6.371e6 / 312;
    this.minScale = 0.05;
    this.x = 0;
    this.y = 300000000000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[EarthTexture].texture);
  }
}

export class Mars extends Planet {
  mass = 6.39e23;
  orbitCutoff = 50e6; //x100
  recommendedOrbit = 30e6;
  recommendedTimeAccel = 100;

  setup() {
    this.telemetry = new Telemetry(499);
    this.scale = 2 * 3.3895e6 / 312;
    this.minScale = 0.05;
    this.x = 0;
    this.y = 400000000000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[MarsTexture].texture);
  }
}

export class Jupiter extends Planet {
  mass = 1.9e27;
  orbitCutoff = 10e9; //x10,000
  recommendedOrbit = 3e9;
  recommendedTimeAccel = 10000;

  setup() {
    this.telemetry = new Telemetry(599);
    this.scale = 2 * 69.911e6 / 312;
    this.minScale = 0.05;
    this.x = 0;
    this.y = 500000000000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[JupiterTexture].texture);
  }
}

export class Saturn extends Planet {
  mass = 5.683e26;
  orbitCutoff = 10e9; //x10,000
  recommendedOrbit = 3e9;
  recommendedTimeAccel = 10000;

  setup() {
    this.telemetry = new Telemetry(699);
    this.scale = 2 * 58.232e6 / 312;
    this.minScale = 0.05;
    this.x = 0;
    this.y = 600000000000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[SaturnTexture].texture);
  }
}

export class Uranus extends Planet {
  mass = 8.681e25;
  orbitCutoff = 7e9; //10,000, 100,000 is ok
  recommendedOrbit = 3e9;
  recommendedTimeAccel = 10000;

  setup() {
    this.telemetry = new Telemetry(799);
    this.scale = 2 * 25.362e6 / 312;
    this.minScale = 0.05;
    this.x = 0;
    this.y = 700000000000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[UranusTexture].texture);
  }
}

export class Neptune extends Planet {
  mass = 1.024e26;
  orbitCutoff = 8e9; //100,000 ok
  recommendedOrbit = 3e9;
  recommendedTimeAccel = 10000;

  setup() {
    this.telemetry = new Telemetry(899);
    this.scale = 2 * 24.622e6 / 312;
    this.minScale = 0.05;
    this.x = 0;
    this.y = 800000000000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[NeptuneTexture].texture);
  }
}

export default Planet;

