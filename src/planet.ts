import * as PIXI from 'pixi.js';

import Sprite from './sprite';
import * as SunTexture from './sun.png';
import * as MercuryTexture from './mercury.png';
import * as VenusTexture from './venus.png';
import * as EarthTexture from './earth.png';
import * as MarsTexture from './mars.png';
import * as JupiterTexture from './jupiter.png';
import * as SaturnTexture from './saturn.png';
import * as UranusTexture from './uranus.png';
import * as NeptuneTexture from './neptune.png';
import Telemetry from './telemetry';

export abstract class Planet extends Sprite {
  telemetry: Telemetry;

  update(delta: number) {
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
  setup() {
    this.scale = 1;
    this.x = 0;
    this.y = 0;
  }

  create_sprite(): PIXI.Sprite {
    let sprite = new PIXI.Sprite(PIXI.loader.resources[SunTexture].texture);
    return sprite;
  }
}

export class Mercury extends Planet {
  setup() {
    this.telemetry = new Telemetry(199);
    this.scale = 1;
    this.x = 0;
    this.y = 1000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[MercuryTexture].texture);
  }
}

export class Venus extends Planet {
  setup() {
    this.telemetry = new Telemetry(299);
    this.scale = 1;
    this.x = 0;
    this.y = 2000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[VenusTexture].texture);
  }
}

export class Earth extends Planet {
  setup() {
    this.telemetry = new Telemetry(399);
    this.scale = 1;
    this.x = 0;
    this.y = 3000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[EarthTexture].texture);
  }
}

export class Mars extends Planet {
  setup() {
    this.telemetry = new Telemetry(499);
    this.scale = 1;
    this.x = 0;
    this.y = 4000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[MarsTexture].texture);
  }
}

export class Jupiter extends Planet {
  setup() {
    this.telemetry = new Telemetry(599);
    this.scale = 1;
    this.x = 0;
    this.y = 5000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[JupiterTexture].texture);
  }
}

export class Saturn extends Planet {
  setup() {
    this.telemetry = new Telemetry(699);
    this.scale = 1;
    this.x = 0;
    this.y = 6000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[SaturnTexture].texture);
  }
}

export class Uranus extends Planet {
  setup() {
    this.telemetry = new Telemetry(799);
    this.scale = 1;
    this.x = 0;
    this.y = 7000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[UranusTexture].texture);
  }
}

export class Neptune extends Planet {
  setup() {
    this.telemetry = new Telemetry(899);
    this.scale = 1;
    this.x = 0;
    this.y = 8000;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[NeptuneTexture].texture);
  }
}

export default Planet;

