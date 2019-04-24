import * as PIXI from 'pixi.js';
import Sprite from './sprite';
import * as SpaceshipTexture from './images/spaceship.png';
import { Controls } from './controls';
import { Planet } from './planet';

export class Spaceship extends Sprite {
  vx = 30000;
  vy = 0;
  accel = 0.5e-1;
  planets: Planet[];
  G = 6.67408e-11;
  timeAccel: number;

  constructor(app: PIXI.Application, planets: Planet[], timeAccel: number) {
    super(app);

    this.planets = planets;
    this.timeAccel = timeAccel;
    this.x = 0;
    this.y = 150000000000;
  }

  setup(): void {
    this.scale = 0.1;
    this.sprite_rotation_offset = Math.PI / 4;
    this.minScale = 0.05;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[SpaceshipTexture].texture);
  }

  update(delta: number, controls: Controls): void {
    let xdiff = controls.mouse_x - this.x;
    let ydiff = controls.mouse_y - this.y;
    let angle = Math.atan2(ydiff, xdiff);
    this.rotation = angle;

    let num_updates = 5;
    for (let i = 0; i < num_updates; i++) {
      if (controls.keys["Space"] || controls.mouse_down) {
        this.vy += Math.sin(angle) * delta * this.accel * this.timeAccel / num_updates;
        this.vx += Math.cos(angle) * delta * this.accel * this.timeAccel / num_updates;
      }

      for (let planet of this.planets) {
        let accel = this.G * planet.mass / (Math.pow(planet.x - this.x, 2) + Math.pow(planet.y - this.y, 2));
        if (planet.y - this.y != 0 && planet.x - this.x != 0) {
          let angle = Math.atan2(planet.y - this.y, planet.x - this.x);
          this.vy += Math.sin(angle) * delta * accel * this.timeAccel / num_updates;
          this.vx += Math.cos(angle) * delta * accel * this.timeAccel / num_updates;
        }
      }

      this.y += this.vy * delta * this.timeAccel / num_updates;
      this.x += this.vx * delta * this.timeAccel / num_updates;
    }
  }
}

export default Spaceship;
