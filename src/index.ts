import * as PIXI from 'pixi.js';

import * as Spaceship from './images/spaceship.png';
import * as SunTexture from './images/sun.png';
import * as MercuryTexture from './images/mercury.png';
import * as VenusTexture from './images/venus.png';
import * as EarthTexture from './images/earth.png';
import * as MarsTexture from './images/mars.png';
import * as JupiterTexture from './images/jupiter.png';
import * as SaturnTexture from './images/saturn.png';
import * as UranusTexture from './images/uranus.png';
import * as NeptuneTexture from './images/neptune.png';

import * as VoyagerTexture from './images/voyager.png';
import * as MarinerTexture from './images/mariner2.png';
import * as PioneerTexture from './images/pioneer10.png';
import * as GalileoTexture from './images/galileo.png';
import * as CassiniTexture from './images/cassini.png';

import World from './world';
import {Controls, KeyMap} from './controls';

let type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas"
}

PIXI.utils.sayHello(type)

//Create a Pixi Application
let app = new PIXI.Application({
    width: 512,         // default: 800
    height: 512,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
  }
);

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", function (event) {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});


let controls = new Controls();

window.onkeyup = function (e) { delete controls.keys[e.code]; }
window.onkeydown = function (e) {
  console.log(e.code);
  controls.keys[e.code] = e;
}

document.addEventListener('mousemove', (mouseMoveEvent) => {
  controls.mouse_x = mouseMoveEvent.pageX;
  controls.mouse_y = mouseMoveEvent.pageY;
}, false);

document.addEventListener('mousedown', (mouseMoveEvent) => {
  controls.mouse_down = true;
}, false);

document.addEventListener('mouseup', (mouseMoveEvent) => {
  controls.mouse_down = false;
}, false);


//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
PIXI.loader
  .add(Spaceship)
  .add(SunTexture)
  .add(MercuryTexture)
  .add(VenusTexture)
  .add(EarthTexture)
  .add(MarsTexture)
  .add(JupiterTexture)
  .add(SaturnTexture)
  .add(UranusTexture)
  .add(NeptuneTexture)
  .add(VoyagerTexture)
  .add(MarinerTexture)
  .add(PioneerTexture)
  .add(GalileoTexture)
  .add(CassiniTexture)
  .load(setup);

  //This `setup` function will run when the image has loaded
function setup() {
  let world = new World(app);
  world.await_assets().then((val: any) => {
    app.ticker.add(delta => world.tick(delta, controls));
  })
}


