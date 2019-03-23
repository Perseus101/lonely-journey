export class Camera {
  public scale = 1;
  public x = 0;
  public y = 0;

  clone(): Camera {
    return this.clone_into(new Camera());
  }

  clone_into(cam: Camera): Camera {
    cam.scale = this.scale;
    cam.x = this.x;
    cam.y = this.y;

    return cam;
  }
}

export default Camera;