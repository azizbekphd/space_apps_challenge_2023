import { Runnable } from "./Runnable";
import { AppController } from "../controllers/AppController";
import { AppModel } from "../models/AppModel";
import { AppView } from "../views/AppView";
import { MVCModel } from "./MVCModel";
import { MVCView } from "./MVCView";
import { MVCController } from "./MVCController";
import { AppConfig } from "./AppConfig";

interface MVC {
  model: MVCModel;
  view: MVCView;
  controller: MVCController;
}

export class App implements Runnable, MVC {
  model: AppModel;
  view: AppView;
  controller: AppController;
  config: AppConfig;

  constructor (config: AppConfig) {
    this.model = new AppModel(this);
    this.view = new AppView(this);
    this.controller = new AppController(this);
    this.config = config;
  }

  run () {
    this.view.run();
  }
}

