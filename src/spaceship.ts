import * as moment from 'moment';
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

export function cloneIntoBody(into: Body, from: Body) {
  into.set_vx(from.get_vx());
  into.set_vy(from.get_vy());
  into.set_x(from.get_x());
  into.set_y(from.get_y());
}

const physicsConstants = {
  G: 6.67408e-11,
  maxAccel: 3*1000,
  accelWarning: 3*1000
}

/**
 * @returns Whether or not the acceleration warning limit was hit
 */
function tick_physics(body: Body, delta: number, planets: Planet[], timeAccel: number): boolean {
  let accelWarningHit = false;
  for(let planet of planets) {
    let accel = physicsConstants.G * planet.mass / (Math.pow(planet.x - body.get_x(), 2) + Math.pow(planet.y - body.get_y(), 2));
    if (accel > physicsConstants.accelWarning / timeAccel)
      accelWarningHit = true;
    if (accel > physicsConstants.maxAccel / timeAccel)
      accel = physicsConstants.maxAccel / timeAccel;
    if (planet.y - body.get_y() != 0 && planet.x - body.get_x() != 0) {
      let angle = Math.atan2(planet.y - body.get_y(), planet.x - body.get_x());
      body.set_vy(body.get_vy() + Math.sin(angle) * delta * accel * timeAccel);
      body.set_vx(body.get_vx() + Math.cos(angle) * delta * accel * timeAccel);
    }
  }

  body.set_y(body.get_y() + body.get_vy() * delta * timeAccel);
  body.set_x(body.get_x() + body.get_vx() * delta * timeAccel);

  return accelWarningHit;
}

export class TestRocket implements Body {
  vx: number = 0;
  vy: number = 0;
  x: number = 0;
  y: number = 0;

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
  accel1 = 1e-3 * 52560;
  accel2 = 2e-3 * 52560;
  accel3 = 1e-2 * 52560;
  accel4 = 5e-2 * 52560;
  planets: Planet[];
  planetsToConsider: Planet[];
  timeAccel: number;
  testRocket = new TestRocket();
  futureLine: PIXI.Graphics;

  constructor(app: PIXI.Application, planets: Planet[], timeAccel: number) {
    super(app);

    this.planets = planets;
    this.planetsToConsider = [planets[0], planets[1]];
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

  update(delta: number, controls: Controls, thrusterPower: number, timeAccel: number): void {
    this.timeAccel = timeAccel;
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
      else if (thrusterPower == 4)
        accel = this.accel4;
      else
        throw "Error, thrusterPower must be 1, 2, 3, or 4. Was " + thrusterPower;
      this.vy += Math.sin(angle) * delta * accel; //accel is independent of "timeAccel" so that it's a natural speed at any timescale
      this.vx += Math.cos(angle) * delta * accel; //accel is independent of "timeAccel" so that it's a natural speed at any timescale
    }

    let closestPlanet = this.planets[1];
    for (let planet of this.planets.slice(2)) {
      if (Math.pow(this.x - planet.x, 2) + Math.pow(this.y - planet.y, 2) < Math.pow(this.x - closestPlanet.x, 2) + Math.pow(this.y - closestPlanet.y, 2))
        closestPlanet = planet;
    }
    this.planetsToConsider[1] = closestPlanet;

    tick_physics(this, delta, this.planetsToConsider, this.timeAccel);
  }

  /**
   * Returns true if acceleration warning limit is going to be within the next second
   */
  updateFutureLine(delta: number, controls: Controls, camera: Camera, date: Date): boolean {
    this.futureLine.clear();
    this.futureLine.lineStyle(2, 0xffffff, 1, 0.5);
    this.futureLine.moveTo(
      camera.scale * (this.x - camera.x) + (this.app.renderer.width / 2),
      camera.scale * (this.y - camera.y) + (this.app.renderer.height / 2)
    );

    cloneIntoBody(this.testRocket, this);

    let accelWarningHitSoon = false;
    let accelWarningHit = false;

    let num_steps = 60 * 20;
    for (let i = 0; i < num_steps; i++) {
      let color = 0xffffff;
      if (accelWarningHit)
        color = 0xff9999;
      this.futureLine.lineStyle(2, color, 1 - i / num_steps, 0.5);
      this.futureLine.lineTo(
        camera.scale * (this.testRocket.get_x() - camera.x) + (this.app.renderer.width / 2),
        camera.scale * (this.testRocket.get_y() - camera.y) + (this.app.renderer.height / 2)
      );
      let tickAmt = this.timeAccel * delta;
      date = moment(date).add(Math.round(tickAmt), 'seconds').toDate();
      this.planetsToConsider[1].update(date);

      accelWarningHit = tick_physics(this.testRocket, 1, this.planetsToConsider, this.timeAccel);
      if (accelWarningHit && i < 60)
        accelWarningHitSoon = true;
    }

    return accelWarningHitSoon;
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
