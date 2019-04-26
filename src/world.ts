import * as moment from 'moment';

import Camera from "./camera";
import Spaceship, { TestRocket, cloneIntoBody } from "./spaceship";
import { Controls } from "./controls";
import Stars from "./stars";
import { Planet, Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune } from "./planet";
import TractorBeam from "./tractor_beam";
import { Mission, VoyagerMission, MarinerMission, PioneerMission } from './mission';

export class World {
  app: PIXI.Application;
  dateText: PIXI.Text;
  date: Date;
  camera: Camera;
  spaceship: Spaceship;
  // tractor_beam: TractorBeam;
  planets: Planet[] = [];
  missions: Mission[] = [];
  remapped_controls = new Controls();
  camera_speed = 10;
  camera_scale_speed = 0.025;
  camera_scroll_scale_speed = 0.001;
  stars: Stars;
  follow_camera = true;
  timeAccel = 1000;//365 * 24 * 60 / 365; // 1 year in 10 seconds
  accScroll = 0;
  maxAccScroll = 50;
  thrusterPower = 4;
  dateElement: Element;
  previousRocket: TestRocket;
  timeAccelEl = document.getElementById("time-accel");
  timeSpedUp = false;
  timeSlowedDown = false;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.date = new Date(1960, 0, 1, 0, 0, 0, 0);

    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fontWeight: 'bold',
      fill: '#ffffff', // gradient
    });

    this.camera = new Camera();
    this.stars = new Stars(app);
    this.planets.push(new Sun(app), new Mercury(app), new Venus(app), new Earth(app), new Mars(app), new Jupiter(app), new Saturn(app), new Uranus(app), new Neptune(app));

    this.missions.push(
      new VoyagerMission(app, -31),
      new VoyagerMission(app, -32),
      new MarinerMission(app, -2),
      new PioneerMission(app, -23),
      new PioneerMission(app, -24),
    );

    this.spaceship = new Spaceship(app, this.planets, this.timeAccel);
    this.previousRocket = new TestRocket();
    // this.tractor_beam = new TractorBeam(app);

    var self = this;
    window.addEventListener("wheel", function(e: any) {
      self.accScroll += e.deltaY;
    });

    this.dateElement = document.getElementById("date");

    this.timeAccelEl.innerHTML = "x" + self.timeAccel;

    let speed1El = document.getElementById("speed-1");
    let speed2El = document.getElementById("speed-2");
    let speed3El = document.getElementById("speed-3");
    let speed4El = document.getElementById("speed-4");
    let active = "speed-activated";

    function activateSpeed1() {
      self.thrusterPower = 1;
      speed1El.classList.add(active);
      speed2El.classList.remove(active);
      speed3El.classList.remove(active);
      speed4El.classList.remove(active);
    }
    function activateSpeed2() {
      self.thrusterPower = 2;
      speed1El.classList.remove(active);
      speed2El.classList.add(active);
      speed3El.classList.remove(active);
      speed4El.classList.remove(active);
    }
    function activateSpeed3() {
      self.thrusterPower = 3;
      speed1El.classList.remove(active);
      speed2El.classList.remove(active);
      speed3El.classList.add(active);
      speed4El.classList.remove(active);
    }
    function activateSpeed4() {
      self.thrusterPower = 4;
      speed1El.classList.remove(active);
      speed2El.classList.remove(active);
      speed3El.classList.remove(active);
      speed4El.classList.add(active);
    }

    speed1El.onclick = (e) => { activateSpeed1(); };
    speed2El.onclick = (e) => { activateSpeed2(); };
    speed3El.onclick = (e) => { activateSpeed3(); };
    speed4El.onclick = (e) => { activateSpeed4(); };

    window.addEventListener("keydown", function (e) {
      if (e.code == "Digit1")
        activateSpeed1();
      if (e.code == "Digit2")
        activateSpeed2();
      if (e.code == "Digit3")
        activateSpeed3();
      if (e.code == "Digit4")
        activateSpeed4();
    });
  }

  await_assets(): Promise<any> {
    let unresolved: Promise<any>[] = [];
    for (let p of this.planets) {
      unresolved.push(p.await_assets());
    }
    return Promise.all(unresolved);
  }

  updateDateText() {
    this.dateElement.innerHTML = moment(this.date).format('YYYY-MM-DD');
  }

  tick(delta: number, controls: Controls) {
    delta = 1;

    this.remapped_controls.keys = controls.keys;
    this.remapped_controls.mouse_down = controls.mouse_down;
    this.remapped_controls.mouse_x = (controls.mouse_x - this.app.renderer.width / 2) / this.camera.scale + this.camera.x; //transform to world coordinates
    this.remapped_controls.mouse_y = (controls.mouse_y - this.app.renderer.height / 2) / this.camera.scale + this.camera.y; //transform to world coordinates

    if (controls.keys["Escape"]) {
      this.camera.x = this.spaceship.x;
      this.camera.y = this.spaceship.y;
      this.follow_camera = true;
    }

    if (controls.keys["KeyW"]) {
      this.camera.y -= this.camera_speed * delta / this.camera.scale;
      this.follow_camera = false;
    }
    if (controls.keys["KeyS"]) {
      this.camera.y += this.camera_speed * delta / this.camera.scale;
      this.follow_camera = false;
    }
    if (controls.keys["KeyA"]) {
      this.camera.x -= this.camera_speed * delta / this.camera.scale;
      this.follow_camera = false;
    }
    if (controls.keys["KeyD"]) {
      this.camera.x += this.camera_speed * delta / this.camera.scale;
      this.follow_camera = false;
    }
    if (controls.keys["ShiftLeft"]) {
      this.camera.scale *= 1 + (this.camera_scale_speed * delta);
    }
    if (controls.keys["ControlLeft"]) {
      this.camera.scale *= 1 - (this.camera_scale_speed * delta);
    }
    if (this.accScroll != 0) {
      if (this.accScroll > this.maxAccScroll)
        this.accScroll = this.maxAccScroll;
      if (this.accScroll < -this.maxAccScroll)
        this.accScroll = -this.maxAccScroll;
      this.camera.scale *= Math.pow(1 + this.camera_scroll_scale_speed * delta, -this.accScroll);
      this.accScroll = 0;
    }

    //Attempt to honor controls for slowing down or speeding up time
    if (controls.keys["Period"] && this.timeAccel < 1000000 && !this.timeSpedUp) {
      this.timeAccel *= 10;
      this.timeAccelEl.innerHTML = "x" + this.timeAccel;
      this.timeSpedUp = true;
    }
    if (controls.keys["Comma"] && this.timeAccel > 1 && !this.timeSlowedDown) {
      this.timeAccel /= 10;
      this.timeAccelEl.innerHTML = "x" + this.timeAccel;
      this.timeSlowedDown = true;
    }
    if (!controls.keys["Period"])
      this.timeSpedUp = false;
    if (!controls.keys["Comma"])
      this.timeSlowedDown = false;

    cloneIntoBody(this.previousRocket, this.spaceship);
    while (true) {
      this.spaceship.update(delta, this.remapped_controls, this.thrusterPower, this.timeAccel);

      if (this.follow_camera) {
        this.camera.x = this.spaceship.x;
        this.camera.y = this.spaceship.y;
      }

      let shouldSlowDown = this.spaceship.updateFutureLine(delta, this.remapped_controls, this.camera, this.date);

      if (shouldSlowDown && this.timeAccel > 1) {
        this.timeAccel /= 10;
        this.timeAccelEl.innerHTML = "x" + this.timeAccel;
        cloneIntoBody(this.spaceship, this.previousRocket);
        this.timeSpedUp = false;
      } else {
        break;
      }
    }

    // Update date based on delta
    let tickAmt = this.timeAccel * delta;
    this.date = moment(this.date).add(Math.round(tickAmt), 'seconds').toDate();
    this.updateDateText()


    for (let c of this.planets) {
      c.update(this.date);
      c.updateDistanceText(this.camera);
    }

    // this.tractor_beam.update(this.spaceship);

    this.stars.tick(delta, this.camera);
    this.spaceship.draw(this.camera);

    for (let c of this.planets) {
      c.update(this.date);
      c.draw(this.camera);
    }

    for (let m of this.missions) {
      m.update(this.date);
      m.draw(this.camera);
    }
    // this.tractor_beam.draw(this.camera);
  }
}

export default World;
