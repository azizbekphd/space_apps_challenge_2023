import { App } from "../types/App";
import { Quake } from "../types/Quake";
import { MVCController } from "../types/MVCController";
import { lunarPhaseFromDate } from "../utils/lunarPhaseFromDate";
import { parseDate } from "../utils/parseDate";

export class AppController implements MVCController {
  app: App;

  constructor (app: App) {
    this.app = app;
  }

  setMoonPhase (phase: number) {
    this.app.model.moonAge = phase / 100;
    this.app.model.updateMoonPhase();
  }

  selectQuake (quakeId: string | null = null) {
    const model = this.app.model;
    const quake: Quake = model.quakes.find((quake) => quake._id === quakeId)!;
    model.selectedQuake = quake;
    if (quake) {
      const quakeDate = parseDate(
        quake.year, quake.day, quake.hour, quake.minute, quake.seconds);
      model.moonAge = lunarPhaseFromDate(quakeDate);
    }
    model.updateSelectedQuake();
  }
}

