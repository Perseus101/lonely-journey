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
  bufferStars: any[] = [];
  lastCamera: Camera;

  starSettings = {
    numParticles: 250,
    alphaMin: 0.1,
    alphaMax: 0.7,
    sizeChangeSpeed: 0.05,
  };

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.particles.ParticleContainer(
      2 * this.starSettings.numParticles,
      {
        rotation: false,
        // alphaAndtint: true,
        scale: true,
        uvs: false
      }
    );

    for (let i = 0; i < this.starSettings.numParticles; ++i) {
      this.newStar();
    }

    this.app.stage.addChild(this.container);
  }

  tick(delta: number, camera: Camera) {
    if (this.lastCamera) {
      //update scaling
      if (camera.scale != this.lastCamera.scale) {
        let ratio = camera.scale / this.lastCamera.scale;
        for (let star of this.stars) {
          star.position.x = ratio * (star.position.x - this.app.renderer.width / 2) + this.app.renderer.width / 2;
          star.position.y = ratio * (star.position.y - this.app.renderer.height / 2) + this.app.renderer.height / 2;
        }

        //correct for zooming in
        if (camera.scale > this.lastCamera.scale) {
          for (let star of this.stars) {
            if (star.position.x < 0 || star.position.x >= this.app.renderer.width || star.position.y < 0 || star.position.y >= this.app.renderer.height) {
              star.pX = Math.random();
              star.pY = Math.random();
              star.position.x = this.app.renderer.width * star.pX;
              star.position.y = this.app.renderer.height * star.pY;
              star.isSpawning = true;
              star.isDespawning = false;
              star.scale.x = 0;
              star.scale.y = 0;
            }

            //update spawning
            if (star.isSpawning) {
              star.scale.x += this.starSettings.sizeChangeSpeed;
              star.scale.y += this.starSettings.sizeChangeSpeed;
              if (star.scale.x >= star.ogScale || star.scale.y >= star.ogScale) {
                star.scale.x = star.ogScale;
                star.scale.y = star.ogScale;
                star.isSpawning = false;
              }
            }
          }
        } else {
          let p = 1 - ratio*ratio;
          let n = this.starSettings.numParticles;
          let numToRespawn = Math.min(Math.max(Math.round(randomGauss() * Math.sqrt(n * p * (1 - p)) + p*n), 0), n);
          // console.log(ratio, numToRespawn);

          let fun = makeRandomRange(this.stars.length);
          let misses = 0;
          for (let i = 0; i < numToRespawn; i++) {
            //mark a random star to despawn to balance it out
            let despawnStar = this.stars[fun()];
            while (despawnStar.isInBuffer || despawnStar.isDespawning) {
              despawnStar = this.stars[fun()];
              misses += 1;
            }
            despawnStar.isDespawning = true;
            despawnStar.isSpawning = false;

            //now get an unused star, or make one
            let star: any;
            if (this.bufferStars.length > 0) {
              star = this.bufferStars.pop();
              this.newProperties(star);
            } else {
              star = this.newStar();
            }

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

          console.log("Misses: " + misses, " bufferStars: " + this.bufferStars.length);
        }

        for (let star of this.stars) {
          //update despawning
          if (star.isDespawning) {
            star.scale.x -= this.starSettings.sizeChangeSpeed;
            star.scale.y -= this.starSettings.sizeChangeSpeed;
            if (star.scale.x <= 0 || star.scale.y <= 0) {
              star.scale.x = 0;
              star.scale.y = 0;
              star.isSpawning = false;
              star.isDespawning = false;
              star.isInBuffer = true;
              this.bufferStars.push(star);
            }
          }
        }
      }

      //update position
      for (let star of this.stars) {
        star.position.x += camera.scale * (this.lastCamera.x - camera.x);
        star.position.y += camera.scale * (this.lastCamera.y - camera.y);

        if (star.position.x < 0 || star.position.x >= this.app.renderer.width) {
          star.position.x = wrap(star.position.x, this.app.renderer.width);
          star.pY = Math.random();
          star.position.y = this.app.renderer.height * star.pY;
        }
        if (star.position.y < 0 || star.position.y >= this.app.renderer.height) {
          star.position.y = wrap(star.position.y, this.app.renderer.height);
          star.pX = Math.random();
          star.position.x = this.app.renderer.width * star.pX;
        }
      }

      //update last camera store
      camera.clone_into(this.lastCamera);
    } else {
      //set initial positions
      for (let star of this.stars) {
        star.position.x = this.app.renderer.width * star.pX;
        star.position.y = this.app.renderer.height * star.pY;
      }

      this.lastCamera = camera.clone();
    }
  }

  newStar() {
    var texture = PIXI.Texture.fromCanvas(this.getStarGraphic());
    var star: any = new PIXI.Sprite(texture);
    star.id = Math.random();
    this.newProperties(star);
    this.container.addChild(star);
    this.stars.push(star);
    return star;
  }

  newProperties(star: any) {
    var settings = this.starSettings;
    var scale = 0.3 + Math.random() * 0.7;

    star.anchor.x = 0.5;
    star.anchor.y = 0.5;
    star.ogScale = scale;
    star.scale.x = scale;
    star.scale.y = scale;
    star.alpha = (settings.alphaMax - settings.alphaMin) * Math.random() + settings.alphaMin;
    star.rad = 180 * Math.random();
    star.pX = Math.random();
    star.pY = Math.random();
    star.position.x = this.app.renderer.width * star.pX;
    star.position.y = this.app.renderer.height * star.pY;
    star.isInBuffer = false;
    star.isDespawning = false;
    star.isSpawning = false;
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
