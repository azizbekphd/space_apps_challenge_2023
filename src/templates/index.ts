import { quakeInfo } from "./quakeInfo"
import { viewportData } from "./viewportData"

export type AppTemplates = {[key: string]: (...args: any) => string}

export const appTemplates: AppTemplates = {
  quakeInfo: quakeInfo,
  viewportData: viewportData,
}

