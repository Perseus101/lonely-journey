import * as PIXI from 'pixi.js';
import Camera from './camera';
import Controls from './controls';

export abstract class Sprite {
  app: PIXI.Application;
  pixi_sprite: PIXI.Sprite;
  x = 0;
  y = 0;
  rotation = 0;
  sprite_rotation_offset = 0;
  scale = 1;
  minScale: number = undefined;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.pixi_sprite = this.create_sprite();
    this.pixi_sprite.anchor.x = 0.5;
    this.pixi_sprite.anchor.y = 0.5;

    this.setup();

    //Add the ship to the stage
    app.stage.addChild(this.pixi_sprite);
  }

  abstract create_sprite(): PIXI.Sprite;

  setup(): void {

  }

  abstract update(delta: number, controls: Controls): void;

  draw(camera: Camera): void {
    let newScale = this.scale * camera.scale;
    if (this.minScale != undefined && newScale < this.minScale) {
      newScale = this.minScale;
    }
    this.pixi_sprite.scale.set(newScale, newScale);
    this.pixi_sprite.position.set(camera.scale * (this.x - camera.x) + (this.app.renderer.width / 2), camera.scale * (this.y - camera.y) + (this.app.renderer.height / 2));
    this.pixi_sprite.rotation = (this.rotation + this.sprite_rotation_offset);
  }
}

export default Sprite;
