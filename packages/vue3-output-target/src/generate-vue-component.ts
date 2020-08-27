import { dashToPascalCase } from './utils';
import { ComponentCompilerMeta } from '@stencil/core/internal';
import { ComponentModelConfig, ComponentOptions } from './types';

export const createComponentDefinition = (
  importTypes: string,
  componentModelConfig: ComponentModelConfig[] | undefined,
  routerLinkConfig: string[] | undefined,
) => (cmpMeta: Pick<ComponentCompilerMeta, 'properties' | 'tagName' | 'methods' | 'events'>) => {
  const tagNameAsPascal = dashToPascalCase(cmpMeta.tagName);
  let props: string[] = [];

  if (Array.isArray(cmpMeta.properties) && cmpMeta.properties.length > 0) {
    props = cmpMeta.properties.map((prop) => `'${prop.name}'`);
  }

  if (Array.isArray(cmpMeta.events) && cmpMeta.events.length > 0) {
    props = [
      ...props,
      ...cmpMeta.events.map((event) => `'${event.name}'`)
    ]
  }

  let templateString = `
export const ${tagNameAsPascal} = /*@__PURE__*/ defineContainer<${importTypes}.${tagNameAsPascal}>('${
  cmpMeta.tagName
}', [
  ${props.join(',\n  ')}
]`;

  let options: ComponentOptions = {};
  const findModel = componentModelConfig && componentModelConfig.find(config => config.elements.includes(cmpMeta.tagName));
  const findRouterLink = routerLinkConfig && routerLinkConfig.find(config => config.includes(cmpMeta.tagName));

  if (findModel) {
    options.modelProp = findModel.targetAttr;
    options.modelUpdateEvent = findModel.event;
  }

  if (findRouterLink) {
    options.routerLinkComponent = true;
  }

  if (Object.keys(options).length > 0) {
    templateString += `,\n`;
    templateString += JSON.stringify(options, null, 2);
  }

  templateString += `);\n`;


  return templateString;
};