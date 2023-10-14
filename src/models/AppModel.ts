import { App } from "../types/App";
import { MVCModel } from "../types/MVCModel";
import { Quake } from "../types/Quake";

export class AppModel implements MVCModel {
  app: App;
  quakes: Quake[];
  selectedQuake: Quake | null;
  moonAge: number;

  constructor (args: {app: App, quakes: Quake[],
               selectedQuake: Quake | null,
               moonAge: number,
  }) {
    this.app = args.app;
    this.quakes = args.quakes;
    this.selectedQuake = args.selectedQuake;
    this.moonAge = args.moonAge;
  }

  updateMoonPhase() {
    this.app.view.updateMoonAge()
  }

  updateSelectedQuake() {
    this.app.view.updateSelectedQuake();
    this.app.view.updateMoonAge();
  }
}

