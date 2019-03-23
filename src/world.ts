import Sprite from "./sprite";
import Camera from "./camera";
import Spaceship from "./spaceship";
import { Controls } from "./controls";
import Stars from "./stars";

export class World {
  app: PIXI.Application;
  camera: Camera;
  children: Sprite[] = [];
  remapped_controls = new Controls();
  camera_speed = 10;
  camera_scale_speed = 0.05;
  stars: Stars;
  follow_camera = true;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.camera = new Camera();
    this.children.push(new Spaceship(app));
    this.stars = new Stars(app);
  }

  tick(delta: number, controls: Controls): void {

    this.remapped_controls.keys = controls.keys;
    this.remapped_controls.mouse_down = controls.mouse_down;
    this.remapped_controls.mouse_x = controls.mouse_x + this.camera.x - (this.app.renderer.width / 2); //transform to world coordinates
    this.remapped_controls.mouse_y = controls.mouse_y + this.camera.y - (this.app.renderer.height / 2); //transform to world coordinates

    if (controls.keys["Escape"]) {
      this.camera.x = this.children[0].x;
      this.camera.y = this.children[0].y;
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

    for (let c of this.children) {
      c.update(delta, this.remapped_controls);
    }

    if (this.follow_camera) {
      this.camera.x = this.children[0].x;
      this.camera.y = this.children[0].y;
    }

    this.stars.draw(this.camera);
    for (let c of this.children) {
      c.draw(this.camera);
    }
  }
}

export default World;
