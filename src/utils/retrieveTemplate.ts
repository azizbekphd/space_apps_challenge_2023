import { Template } from "../types/Template";

export function retieveTemplate(target: HTMLElement, template: Template) {
  target.innerHTML = template[0];
  if (template.length > 1 && template[1]) {
    template[1]();
  }
}

