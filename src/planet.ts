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
import Controls from './controls';
import Telemetry from './telemetry';


export abstract class Planet extends Sprite {
  telemetry: Telemetry;
  mass: number; //in kg

  update(delta: number, controls: Controls) {
    if (this.telemetry === undefined) {
      return;
    }
    let data = this.telemetry.getData();
    if (data === undefined) {
      return;
    }
    this.x = data.distance * Math.cos(data.ra);
    this.y = data.distance * Math.sin(data.ra);
  }
}

export class Sun extends Planet {
  mass = 1.9891e30;

  setup() {
    this.scale = 1;
    this.minScale = 0.025;
    this.x = 0;
    this.y = 0;
  }

  create_sprite(): PIXI.Sprite {
    let sprite = new PIXI.Sprite(PIXI.loader.resources[SunTexture].texture);
    return sprite;
  }
}

export class Mercury extends Planet {
  mass = 3.285e23;

  setup() {
    this.telemetry = new Telemetry(199);
    this.scale = 1;
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

  setup() {
    this.telemetry = new Telemetry(299);
    this.scale = 1;
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

  setup() {
    this.telemetry = new Telemetry(399);
    this.scale = 1;
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

  setup() {
    this.telemetry = new Telemetry(499);
    this.scale = 1;
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

  setup() {
    this.telemetry = new Telemetry(599);
    this.scale = 5;
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

  setup() {
    this.telemetry = new Telemetry(699);
    this.scale = 4;
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

  setup() {
    this.telemetry = new Telemetry(799);
    this.scale = 3;
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

  setup() {
    this.telemetry = new Telemetry(899);
    this.scale = 3;
    this.minScale = 0.05;
    this.x = 0;
    this.y = 800000000000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[NeptuneTexture].texture);
  }
}

export default Planet;

