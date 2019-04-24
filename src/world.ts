import Sprite from "./sprite";
import Camera from "./camera";
import Spaceship from "./spaceship";
import { Controls } from "./controls";
import Stars from "./stars";
import { Planet, Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune } from "./planet";

export class World {
  app: PIXI.Application;
  date: Date;
  camera: Camera;
  spaceship: Spaceship;
  bodies: Planet[] = [];
  remapped_controls = new Controls();
  camera_speed = 10;
  camera_scale_speed = 0.025;
  stars: Stars;
  follow_camera = true;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.date = new Date(1960, 0, 1, 0, 0, 0, 0);
    this.camera = new Camera();
    this.stars = new Stars(app);
    this.bodies.push(new Sun(app), new Mercury(app), new Venus(app), new Earth(app), new Mars(app), new Jupiter(app), new Saturn(app), new Uranus(app), new Neptune(app));
    this.spaceship = new Spaceship(app);
  }

  tick(delta: number, controls: Controls) {
    // Update date based on delta
    this.date.setDate(this.date.getDate() + 1);

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

    this.spaceship.update(delta, this.remapped_controls);

    if (this.follow_camera) {
      this.camera.x = this.spaceship.x;
      this.camera.y = this.spaceship.y;
    }

    this.stars.tick(delta, this.camera);
    this.spaceship.draw(this.camera);

    for (let c of this.bodies) {
      c.update(this.date, this.remapped_controls);
      c.draw(this.camera);
    }
  }
}

export default World;
