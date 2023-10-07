import { data } from "../data/data";
import { App } from "../types/App";
import { MVCModel } from "../types/MVCModel";

export class AppModel implements MVCModel {
  app: App;
  quakes: typeof data;

  constructor (app: App) {
    this.app = app;
    this.quakes = data;
  }
}

