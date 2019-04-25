import * as PIXI from 'pixi.js';
import Sprite from './sprite';
import * as SpaceshipTexture from './images/spaceship.png';
import { Controls } from './controls';
import { Planet } from './planet';
import Camera from './camera';

interface Body {
  get_vx(): number;
  get_vy(): number;

  set_vx(vx: number): void;
  set_vy(vy: number): void;

  get_x(): number;
  get_y(): number;
  set_x(x: number): void;
  set_y(y: number): void;
}

const physicsConstants = {
  G: 6.67408e-11,
  maxAccel: 3
}

function tick_physics(body: Body, delta: number, planets: Planet[], timeAccel: number): void {
  for(let planet of planets) {
    let accel = physicsConstants.G * planet.mass / (Math.pow(planet.x - body.get_x(), 2) + Math.pow(planet.y - body.get_y(), 2));
    if (accel > physicsConstants.maxAccel) {
      accel = physicsConstants.maxAccel;
    }
    if (planet.y - body.get_y() != 0 && planet.x - body.get_x() != 0) {
      let angle = Math.atan2(planet.y - body.get_y(), planet.x - body.get_x());
      body.set_vy(body.get_vy() + Math.sin(angle) * delta * accel * timeAccel);
      body.set_vx(body.get_vx() + Math.cos(angle) * delta * accel * timeAccel);
    }
  }

  body.set_y(body.get_y() + body.get_vy() * delta * timeAccel);
  body.set_x(body.get_x() + body.get_vx() * delta * timeAccel);
}

class TestRocket implements Body {
  vx: number = 0;
  vy: number = 0;
  x: number = 0;
  y: number = 0;

  clone_into(from: Body) {
    this.vx = from.get_vx();
    this.vy = from.get_vy();
    this.x = from.get_x();
    this.y = from.get_y();
  }

  get_vx(): number { return this.vx; }
  get_vy(): number { return this.vy; }
  set_vx(vx: number): void { this.vx = vx; }
  set_vy(vy: number): void { this.vy = vy; }

  get_x(): number { return this.x; }
  get_y(): number { return this.y; }
  set_x(x: number): void { this.x = x; }
  set_y(y: number): void { this.y = y; }
}

export class Spaceship extends Sprite implements Body {
  vx = -30000;
  vy = 0;
  accel1 = 2e-3 * 52560;
  accel2 = 1e-2 * 52560;
  accel3 = 5e-2 * 52560;
  planets: Planet[];
  timeAccel: number;
  testRocket = new TestRocket();
  futureLine: PIXI.Graphics;

  constructor(app: PIXI.Application, planets: Planet[], timeAccel: number) {
    super(app);

    this.planets = planets;
    this.timeAccel = timeAccel;
    this.x = 0;
    this.y = 150000000000;

    this.futureLine = new PIXI.Graphics();
    app.stage.addChild(this.futureLine);
  }
  setup(): void {
    this.scale = 0.1;
    this.sprite_rotation_offset = Math.PI / 4;
    this.minScale = 0.05;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[SpaceshipTexture].texture);
  }

  update(delta: number, controls: Controls, thrusterPower: number, camera: Camera): void {
    let xdiff = controls.mouse_x - this.x;
    let ydiff = controls.mouse_y - this.y;
    let angle = Math.atan2(ydiff, xdiff);
    this.rotation = angle;

    if (controls.keys["Space"] || controls.mouse_down) {
      let accel;
      if (thrusterPower == 1)
        accel = this.accel1;
      else if (thrusterPower == 2)
        accel = this.accel2;
      else if (thrusterPower == 3)
        accel = this.accel3;
      else
        throw "Error, thrusterPower must be 1, 2, or 3. Was " + thrusterPower;
      this.vy += Math.sin(angle) * delta * accel; //accel is independent of "timeAccel" so that it's a natural speed at any timescale
      this.vx += Math.cos(angle) * delta * accel; //accel is independent of "timeAccel" so that it's a natural speed at any timescale
    }

    tick_physics(this, delta, this.planets, this.timeAccel);

    this.futureLine.clear();
    this.futureLine.lineStyle(2, 0xffffff, 1, 0.5);
    this.testRocket.clone_into(this);
    this.futureLine.moveTo(
      camera.scale * (this.testRocket.get_x() - camera.x) + (this.app.renderer.width / 2),
      camera.scale * (this.testRocket.get_y() - camera.y) + (this.app.renderer.height / 2)
    );
    let num_steps = 60*30;
    for (let i = 0; i < num_steps; i++) {
      tick_physics(this.testRocket, 1, this.planets, this.timeAccel);

      this.futureLine.lineStyle(2, 0xffffff, 1 - i/num_steps, 0.5);
      this.futureLine.lineTo(
        camera.scale * (this.testRocket.get_x() - camera.x) + (this.app.renderer.width / 2),
        camera.scale * (this.testRocket.get_y() - camera.y) + (this.app.renderer.height / 2)
      );
    }
  }

  get_vx(): number { return this.vx; }
  get_vy(): number { return this.vy; }
  set_vx(vx: number): void { this.vx = vx; }
  set_vy(vy: number): void { this.vy = vy; }

  get_x(): number { return this.x; }
  get_y(): number { return this.y; }
  set_x(x: number): void { this.x = x; }
  set_y(y: number): void { this.y = y; }
}

export default Spaceship;
