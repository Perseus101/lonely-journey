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
  futureLinePoints: number[] = [];
  futurePlanetPoints: number[] = [];

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

    for (let planet of this.planets) {
      planet.recalcDistance(this.x, this.y);
    }

    let closestI = 1;
    for (let i = 2; i < this.planets.length; i++) {
      if (this.planets[i].distanceToShip < this.planets[closestI].distanceToShip)
        closestI = i;
    }
    this.planetsToConsider[1] = this.planets[closestI];

    tick_physics(this, delta, this.planetsToConsider, this.timeAccel);
  }

  /**
   * Returns true if acceleration warning limit is going to be within the next second
   */
  updateFutureLine(delta: number, controls: Controls, camera: Camera, date: Date): boolean {
    let warningTimeWindow = 60; // 1 second

    this.futureLinePoints.length = 0; //clear the line points
    this.futurePlanetPoints.length = 0; //clear the planet points
    this.futureLine.clear();

    this.futureLinePoints.push(this.x, this.y);
    this.futurePlanetPoints.push(this.planetsToConsider[1].x, this.planetsToConsider[1].y);

    cloneIntoBody(this.testRocket, this);

    let num_steps = 60 * 20;
    let accelWarningHitIndex = Number.MAX_SAFE_INTEGER;
    let closestDistToPlanet = Number.MAX_SAFE_INTEGER;
    let furthestDistToPlanet = 0;
    for (let i = 0; i < num_steps; i++) {
      this.futureLinePoints.push(this.testRocket.get_x(), this.testRocket.get_y());
      this.futurePlanetPoints.push(this.planetsToConsider[1].x, this.planetsToConsider[1].y);

      let dist = Math.pow(this.planetsToConsider[1].x - this.testRocket.get_x(), 2) + Math.pow(this.planetsToConsider[1].y - this.testRocket.get_y(), 2);
      if (dist < closestDistToPlanet)
        closestDistToPlanet = dist;
      if (dist > furthestDistToPlanet)
        furthestDistToPlanet = dist;

      let tickAmt = this.timeAccel * delta;
      date = moment(date).add(Math.round(tickAmt), 'seconds').toDate();
      this.planetsToConsider[1].update(date);

      let accelWarningHit = tick_physics(this.testRocket, 1, this.planetsToConsider, this.timeAccel);
      if (accelWarningHit && i < accelWarningHitIndex)
        accelWarningHitIndex = i;
    }

    //convert from squared distance
    closestDistToPlanet = Math.sqrt(closestDistToPlanet);
    furthestDistToPlanet = Math.sqrt(furthestDistToPlanet);

    let inOrbit = false;
    if (furthestDistToPlanet / closestDistToPlanet < 100 && furthestDistToPlanet < this.planetsToConsider[1].orbitCutoff) { //roughly within ellipse ratios, and close enough
      inOrbit = true;
    }

    let self = this;
    function drawLine(initialColor: number, usePlanetaryCorrection: boolean) {
      self.futureLine.lineStyle(2, initialColor, 1, 0.5);
      self.futureLine.moveTo(
        camera.scale * (self.futureLinePoints[0] - camera.x) + (self.app.renderer.width / 2),
        camera.scale * (self.futureLinePoints[1] - camera.y) + (self.app.renderer.height / 2)
      );

      for (let i = 1; i < self.futureLinePoints.length / 2; i += 1) {
        let x = self.futureLinePoints[2 * i];
        let y = self.futureLinePoints[2 * i + 1];
        let color = initialColor;
        if (i >= accelWarningHitIndex - warningTimeWindow)
          color = 0xffff99;
        self.futureLine.lineStyle(2, color, 1 - i / num_steps, 0.5);

        let planetaryCorrectionX = 0;
        let planetaryCorrectionY = 0;

        if (usePlanetaryCorrection) {
          planetaryCorrectionX = self.futurePlanetPoints[2 * i] - self.futurePlanetPoints[0];
          planetaryCorrectionY = self.futurePlanetPoints[2 * i + 1] - self.futurePlanetPoints[1];
        }

        self.futureLine.lineTo(
          camera.scale * (x - camera.x - planetaryCorrectionX) + (self.app.renderer.width / 2),
          camera.scale * (y - camera.y - planetaryCorrectionY) + (self.app.renderer.height / 2)
        );
      }
    }
    drawLine(0xffffff, false);
    if (inOrbit)
      drawLine(0x99ff99, true);

    return accelWarningHitIndex < warningTimeWindow;
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
