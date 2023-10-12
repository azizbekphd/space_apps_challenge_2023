import { quakeInfo } from "./quakeInfo"

type AppTemplates = {[key: string]: (...args: any) => string}

export const appTemplates: AppTemplates = {
  quakeInfo: quakeInfo,
}

