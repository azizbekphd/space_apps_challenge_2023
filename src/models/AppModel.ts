import { App } from "../types/App";
import { MVCModel } from "../types/MVCModel";

export class AppModel implements MVCModel {
  app: App;

  constructor (app: App) {
    this.app = app;
  }
}

