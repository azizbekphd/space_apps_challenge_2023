import { App } from "../types/App";
import { MVCController } from "../types/MVCController";

export class AppController implements MVCController {
  app: App;

  constructor (app: App) {
    this.app = app;
  }
}

