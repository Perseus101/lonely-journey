import Telemetry from './telemetry/telemetry';
import Sprite from './sprite';

export abstract class OrbitingBody extends Sprite {
    telemetry: Telemetry;

    update(date: Date) {
        let data = this.telemetry.getData(date);
        if (data === undefined) {
            return;
        }
        this.x = data.distance * Math.cos(data.ra);
        this.y = data.distance * Math.sin(data.ra);
    }

    await_assets(): Promise<any> {
        return this.telemetry.await_load();
    }

}