import { Template } from "../types/Template"
import { introLoader } from "./introLoader"
import { magnitudeGradient } from "./magnitudeGradient"
import { quakeInfo } from "./quakeInfo"
import { viewportData } from "./viewportData"

export type AppTemplates = {[key: string]: (...args: any) => Template}

export const appTemplates: AppTemplates = {
  quakeInfo: quakeInfo,
  viewportData: viewportData,
  magnitudeGradient: magnitudeGradient,
  introLoader: introLoader,
}

