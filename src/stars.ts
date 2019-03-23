import * as PIXI from 'pixi.js';
import Camera from './camera';

function wrap(val: number, by: number): number {
  val = val % by;
  if (val < 0) {
    return val + by;
  } else {
    return val;
  }
}


function randomGauss(): number {
  let randA = Math.random();
  let randB = Math.random();
  return Math.sqrt(-2 * Math.log(randA)) * Math.cos(2 * Math.PI * randB);
}

// unique random number generation from
// https://stackoverflow.com/questions/11808804/generate-unique-number-within-range-0-x-keeping-a-history-to-prevent-duplic/11809348#11809348
function makeRandomRange(x: number): any {
  var range = new Array(x),
    pointer = x;
  return function getRandom() {
    pointer = (pointer - 1 + x) % x;
    var random = Math.floor(Math.random() * pointer);
    var num = (random in range) ? range[random] : random;
    range[random] = (pointer in range) ? range[pointer] : pointer;
    return range[pointer] = num;
  };
}

function randSign(): number {
  return 2 * Math.round(Math.random()) - 1;
}

export class Stars {
  app: PIXI.Application;
  container: PIXI.particles.ParticleContainer;
  starGraphic: any;
  stars: any[] = [];
  last_camera: Camera;

  starSettings = {
    numParticles: 1000,
    alphaMin: 0.1,
    alphaMax: .7,
  };

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.particles.ParticleContainer();

    for (let i = 0; i < this.starSettings.numParticles; ++i) {
      this.newStar();
    }

    this.app.stage.addChild(this.container);
  }

  draw(camera: Camera) {
    if (this.last_camera) {
      //update scaling
      if (camera.scale != this.last_camera.scale) {
        let ratio = camera.scale / this.last_camera.scale;
        for (let star of this.stars) {
          star.position.x = ratio * (star.position.x - this.app.renderer.width / 2) + this.app.renderer.width / 2;
          star.position.y = ratio * (star.position.y - this.app.renderer.height / 2) + this.app.renderer.height / 2;
        }

        //correct for zooming in
        if (camera.scale > this.last_camera.scale) {
          for (let star of this.stars) {
            if (star.position.x < 0 || star.position.x >= this.app.renderer.width || star.position.y < 0 || star.position.y >= this.app.renderer.height) {
              star.pX = Math.random();
              star.pY = Math.random();
              star.position.x = this.app.renderer.width * star.pX;
              star.position.y = this.app.renderer.height * star.pY;
            }
          }
        } else {
          let p = 1 - ratio*ratio;
          let n = this.starSettings.numParticles;
          let numToRespawn = Math.min(Math.max(Math.round(randomGauss() * Math.sqrt(n * p * (1 - p)) + p*n), 0), n);
          console.log(ratio, numToRespawn);

          let fun = makeRandomRange(n);
          for (let i = 0; i < numToRespawn; i++) {
            let star = this.stars[fun()];
            let range = (1 - ratio) / 2;
            let offset = ratio / 2;

            let dim1 = randSign() * (range * Math.random() + offset) + 0.5;
            let dim2 = Math.random();
            if (Math.random() > 0.5) {
              star.pX = dim1;
              star.pY = dim2;
            } else {
              star.pX = dim2;
              star.pY = dim1;
            }

            // console.log(star.pX, star.pY);
            star.position.x = this.app.renderer.width * star.pX;
            star.position.y = this.app.renderer.height * star.pY;
          }
        }
      }

      //update position
      for (let star of this.stars) {
        star.position.x += camera.scale * (this.last_camera.x - camera.x);
        star.position.y += camera.scale * (this.last_camera.y - camera.y);

        star.position.x = wrap(star.position.x, this.app.renderer.width);
        star.position.y = wrap(star.position.y, this.app.renderer.height);
      }

      //update last camera store
      camera.clone_into(this.last_camera);
    } else {
      //set initial positions
      for (let star of this.stars) {
        star.position.x = this.app.renderer.width * star.pX;
        star.position.y = this.app.renderer.height * star.pY;
      }

      this.last_camera = camera.clone();
    }
  }

  newStar() {
    var settings = this.starSettings;
    var texture = PIXI.Texture.fromCanvas(this.getStarGraphic());
    var star: any = new PIXI.Sprite(texture);
    var scale = 0.3 + Math.random() * 0.7;

    this.container.addChild(star);
    star.anchor.x = 0.5;
    star.anchor.y = 0.5;
    star.scale.x = scale;
    star.scale.y = scale;
    star.alpha = (settings.alphaMax - settings.alphaMin) * Math.random() + settings.alphaMin;
    star.rad = 180 * Math.random();
    star.pX = Math.random();
    star.pY = Math.random();
    star.position.x = this.app.renderer.width * star.pX;
    star.position.y = this.app.renderer.height * star.pY;
    this.stars.push(star);
    return star;
  }

  getStarGraphic() {
    var starCanvas;
    if (!this.starGraphic) {
      starCanvas = document.createElement('canvas');
      starCanvas.setAttribute("width", "20");
      starCanvas.setAttribute("height", "20");
      let starCTX = starCanvas.getContext("2d");
      starCTX.beginPath();
      starCTX.arc(10, 10, 3, 0, 2 * Math.PI, true);
      starCTX.fillStyle = '#FFFFFF';
      starCTX.fill();
      this.starGraphic = starCanvas;
    } else {
      starCanvas = this.starGraphic;
    }
    return starCanvas;
  }
}

export default Stars;
