import * as PIXI from 'pixi.js';
import Sprite from './sprite';
import * as SpaceshipTexture from './spaceship.png';
import { Controls } from './controls';

export class Spaceship extends Sprite {
  vx = 0;
  vy = 0;
  accel = 0.2;

  setup(): void {
    this.scale = 0.1;
    this.sprite_rotation_offset = Math.PI / 4;
    this.pixi_sprite.anchor.x = 0.5;
    this.pixi_sprite.anchor.y = 0.5;
  }

  create_sprite(): PIXI.Sprite {
    return new PIXI.Sprite(PIXI.loader.resources[SpaceshipTexture].texture);
  }

  update(delta: number, controls: Controls): void {
    let xdiff = controls.mouse_x - this.x;
    let ydiff = controls.mouse_y - this.y;
    let angle = Math.atan2(ydiff, xdiff);
    this.rotation = angle;

    if (controls.keys["Space"] || controls.mouse_down) {
      this.vy += Math.sin(angle) * this.accel;
      this.vx += Math.cos(angle) * this.accel;
    }

    this.y += this.vy * delta;
    this.x += this.vx * delta;
  }
}

export default Spaceship;
