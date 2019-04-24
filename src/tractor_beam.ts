import * as PIXI from 'pixi.js';
import Sprite from './sprite';
import Spaceship from './spaceship';

export class TractorBeam extends Sprite {
  setup(): void {
    this.scale = 1e7;
  }

  create_sprite(): PIXI.Sprite {
    let texture = PIXI.Texture.fromCanvas(makeRingGraphic());
    return new PIXI.Sprite(texture);
  }

  update(spaceship: Spaceship): void {
    this.x = spaceship.x;
    this.y = spaceship.y;
  }

  radius() {
    this.scale * this.pixi_sprite.width/2;
  }
}

function makeRingGraphic() {
  let ringCanvas = document.createElement('canvas');
  ringCanvas.setAttribute("width", "500");
  ringCanvas.setAttribute("height", "500");
  let ringCTX = ringCanvas.getContext("2d");
  ringCTX.beginPath();
  ringCTX.arc(250, 250, 230, 0, 2 * Math.PI, true);
  ringCTX.strokeStyle = "white";
  // ringCTX.fillStyle = "white";
  ringCTX.lineWidth = 15;
  ringCTX.stroke();
  // ringCTX.fill();
  return ringCanvas;
}

export default TractorBeam;
