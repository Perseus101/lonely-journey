export interface KeyMap {
  [key: string]: KeyboardEvent;
}

export class Controls {
  public mouse_x = 0;
  public mouse_y = 0;
  public keys: KeyMap = {};
  public mouse_down = false;
}

export default Controls;
