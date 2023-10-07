import { appConfig } from './appConfig';
import './style.css'
import { App } from './types/App'

const app = new App(appConfig);
app.run();

