import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { OptionConfig } from 'immerser';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = path.join(rootDir, 'README.md');
const sourceDir = path.join(rootDir, 'src');
const immerserTypesPath = path.join(rootDir, 'node_modules/immerser/dist/immerser.min.d.ts');
const componentFiles = [
  'ImmerserProvider.tsx',
  'ImmerserRoot.tsx',
  'ImmerserLayer.tsx',
  'ImmerserSolid.tsx',
  'ImmerserPager.tsx',
  'ImmerserSynchroLink.tsx',
];

const exampleCode = `import {
  ImmerserLayer,
  ImmerserPager,
  ImmerserProvider,
  ImmerserRoot,
  ImmerserSolid,
  ImmerserSynchroLink,
} from '@immerser/react';

export const Page = () => {
  return (
    <ImmerserProvider
      solidClassnamesByLayerId={{
        intro: {
          logo: 'logo--light',
          pager: 'pager--light',
        },
        details: {
          menu: 'menu--dark',
          pager: 'pager--dark',
        },
      }}
      fromViewportWidth={1024}
      scrollAdjustThreshold={50}
      scrollAdjustDelay={600}
      updateLocationHash={(layerId) => window.history.replaceState(null, '', \`#\${layerId}\`)}
      on={{
        layerProgressChange(layerProgressArray) {
          console.log(layerProgressArray);
        },
      }}
    >
      <ImmerserRoot className="fixed">
        <ImmerserPager className="fixed__pager pager" activeClassName="pager__link--active" />

        <ImmerserSolid name="logo" className="fixed__logo logo">
          <ImmerserSynchroLink href="#intro" hoverClassName="_hover" synchroId="logo">
            immerser
          </ImmerserSynchroLink>
        </ImmerserSolid>

        <ImmerserSolid name="menu" className="fixed__menu menu">
          <ImmerserSynchroLink href="#intro" hoverClassName="_hover" synchroId="intro">
            Intro
          </ImmerserSynchroLink>
          <ImmerserSynchroLink href="#details" hoverClassName="_hover" synchroId="details">
            Details
          </ImmerserSynchroLink>
        </ImmerserSolid>
      </ImmerserRoot>

      <ImmerserLayer id="intro" className="section section--intro">
        <h1>Intro</h1>
        <p>Section content gives the layer real layout height.</p>
      </ImmerserLayer>
      <ImmerserLayer id="details" className="section section--details">
        <h2>Details</h2>
        <p>Immerser measures this layout to calculate mask transitions.</p>
      </ImmerserLayer>
    </ImmerserProvider>
  );
};`;

const cssCode = `.fixed {
  position: fixed;
  inset: 32px;
  z-index: 10;
}

.fixed__logo,
.fixed__menu,
.fixed__pager {
  position: absolute;
}

.fixed__logo {
  left: 0;
  top: 0;
}

.fixed__menu {
  right: 0;
  top: 0;
}

.fixed__pager {
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

.logo--light,
.pager--light {
  color: white;
}

.menu--dark,
.pager--dark {
  color: black;
}

.section {
  min-height: 100vh;
  padding: 120px 32px;
}`;

const providerDescription =
  'Owns the core `Immerser` controller lifecycle and shares its scroll state with React components. Provider props are adapter-specific props plus the runtime controls exposed by the React adapter. Event handlers passed through `on` are init-only and registered when the controller is created. `selectorRoot` recreates the core controller when changed. Runtime controls are forwarded to the underlying controller. `solidClassnamesByLayerId` keys must match `ImmerserLayer` ids. The React adapter uses `solidClassnamesByLayerId` to render solid copies inside each layer mask itself. Init-only and adapter-owned controller options are not exposed. This keeps DOM measurement, mask rendering and scroll listeners in one place while the rest of the API stays declarative.';

const readmeTypeBySourceType = new Map([
  ["Options['on']", 'Record<EventName, Handler>'],
  ["Options['selectorRoot']", 'ParentNode'],
  ["Options['solidClassnamesByLayerId']", 'layer id -> solid id -> classname'],
]);

const readmeDescriptionByPropName = new Map([
  [
    'on',
    'Initial event handlers registered when the core controller is created. Changing this prop does not update the current controller. See [core events](https://github.com/dubaua/immerser#events).',
  ],
  [
    'solidClassnamesByLayerId',
    'Map of layer ids to solid ids to CSS classes. Layer ids must match `ImmerserLayer id` values; solid ids must match `ImmerserSolid name` values.',
  ],
]);

function getJsDoc(node) {
  const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc);
  const comment = docs.at(-1)?.comment;

  if (!comment) {
    return '';
  }

  if (Array.isArray(comment)) {
    return comment.map((part) => part.text).join('');
  }

  return String(comment).replace(/\s+/g, ' ').trim();
}

function escapeMarkdown(value) {
  return value.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function getSummary(description) {
  return description.match(/.*?\./)?.[0] ?? description;
}

function findExportedComponent(sourceFile) {
  let component = null;

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) {
      return;
    }

    const isExported = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

    if (!isExported) {
      return;
    }

    const declaration = node.declarationList.declarations.find((item) => ts.isIdentifier(item.name));

    if (!declaration || !ts.isIdentifier(declaration.name)) {
      return;
    }

    component = {
      description: getJsDoc(node),
      name: declaration.name.text,
    };
  });

  return component;
}

function findPropsAlias(sourceFile) {
  let propsAlias = null;

  sourceFile.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === 'Props') {
      propsAlias = node;
    }
  });

  return propsAlias;
}

function collectTypeAliases(sourceFile) {
  const aliases = new Map();

  sourceFile.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      aliases.set(node.name.text, node);
    }
  });

  return aliases;
}

function collectPropertySignatures(typeNode, aliases) {
  if (!typeNode) {
    return [];
  }

  if (ts.isParenthesizedTypeNode(typeNode)) {
    return collectPropertySignatures(typeNode.type, aliases);
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    return typeNode.members.filter(ts.isPropertySignature);
  }

  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    return collectPropertySignatures(aliases.get(typeNode.typeName.text)?.type, aliases);
  }

  if (ts.isIntersectionTypeNode(typeNode)) {
    return typeNode.types.flatMap((type) => collectPropertySignatures(type, aliases));
  }

  if (ts.isUnionTypeNode(typeNode)) {
    return typeNode.types.flatMap((type) => collectPropertySignatures(type, aliases));
  }

  return [];
}

function getModeName(typeNode, sourceFile) {
  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    return typeNode.typeName.text
      .replace(/Props$/, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/^\w/, (letter) => letter.toUpperCase());
  }

  return typeNode.getText(sourceFile);
}

function formatType(typeNode, sourceFile) {
  if (!typeNode) {
    return 'unknown';
  }

  const sourceType = typeNode.getText(sourceFile).replace(/\s+/g, ' ');

  return readmeTypeBySourceType.get(sourceType) ?? sourceType;
}

function formatProp(property, sourceFile) {
  const name = property.name.getText(sourceFile);

  return {
    description: readmeDescriptionByPropName.get(name) ?? getJsDoc(property),
    name,
    required: !property.questionToken,
    type: formatType(property.type, sourceFile),
  };
}

function findTypeAlias(sourceFile, typeName) {
  let typeAlias = null;

  sourceFile.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
      typeAlias = node;
    }
  });

  return typeAlias;
}

function readExternalTypeSource(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');

  return ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function getRuntimeOptionNames(runtimeOptionsAlias) {
  const type = runtimeOptionsAlias.type;

  if (
    !ts.isTypeReferenceNode(type) ||
    !ts.isIdentifier(type.typeName) ||
    type.typeName.text !== 'Pick' ||
    !type.typeArguments?.[1] ||
    !ts.isUnionTypeNode(type.typeArguments[1])
  ) {
    throw new Error('Could not read RuntimeOptions keys from immerser types.');
  }

  return type.typeArguments[1].types.map((item) => {
    if (!ts.isLiteralTypeNode(item) || !ts.isStringLiteral(item.literal)) {
      throw new Error('RuntimeOptions contains unsupported key syntax.');
    }

    return item.literal.text;
  });
}

function collectOptionsProperties(optionsAlias, sourceFile) {
  if (!ts.isTypeLiteralNode(optionsAlias.type)) {
    throw new Error('Could not read Options properties from immerser types.');
  }

  return new Map(
    optionsAlias.type.members
      .filter(ts.isPropertySignature)
      .map((property) => [property.name.getText(sourceFile), property]),
  );
}

function formatDefaultValue(value) {
  if (value === undefined) {
    return 'undefined';
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  return JSON.stringify(value);
}

function formatRuntimeOptionDescription(description) {
  return description.replace(/^Hot\.\s*/, '');
}

function readRuntimeOptions() {
  const sourceFile = readExternalTypeSource(immerserTypesPath);
  const optionsAlias = findTypeAlias(sourceFile, 'Options');
  const runtimeOptionsAlias = findTypeAlias(sourceFile, 'RuntimeOptions');

  if (!optionsAlias || !runtimeOptionsAlias) {
    throw new Error('Could not find Options or RuntimeOptions in immerser types.');
  }

  const optionsProperties = collectOptionsProperties(optionsAlias, sourceFile);

  return getRuntimeOptionNames(runtimeOptionsAlias).map((name) => {
    const property = optionsProperties.get(name);

    if (!property) {
      throw new Error(`Could not find ${name} in immerser Options.`);
    }

    return {
      description: `${formatRuntimeOptionDescription(getJsDoc(property))} Default: \`${formatDefaultValue(
        OptionConfig[name]?.default,
      )}\`.`,
      name,
      required: false,
      type: formatType(property.type, sourceFile),
    };
  });
}

function readProps(propsAlias, sourceFile) {
  const aliases = collectTypeAliases(sourceFile);
  const sharedProps = [];
  const propGroups = [];

  if (!ts.isIntersectionTypeNode(propsAlias.type)) {
    return {
      propGroups,
      props: collectPropertySignatures(propsAlias.type, aliases).map((property) => formatProp(property, sourceFile)),
    };
  }

  propsAlias.type.types.forEach((type) => {
    const currentType = ts.isParenthesizedTypeNode(type) ? type.type : type;

    if (ts.isUnionTypeNode(currentType)) {
      currentType.types.forEach((unionType) => {
        propGroups.push({
          name: getModeName(unionType, sourceFile),
          props: collectPropertySignatures(unionType, aliases).map((property) => formatProp(property, sourceFile)),
        });
      });

      return;
    }

    sharedProps.push(
      ...collectPropertySignatures(currentType, aliases).map((property) => formatProp(property, sourceFile)),
    );
  });

  return {
    propGroups,
    props: sharedProps,
  };
}

function readComponents() {
  return componentFiles.map((fileName) => {
    const filePath = path.join(sourceDir, fileName);
    const source = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const component = findExportedComponent(sourceFile);
    const propsAlias = findPropsAlias(sourceFile);

    if (!component) {
      throw new Error(`Could not find exported component in ${fileName}`);
    }

    if (!propsAlias) {
      throw new Error(`Could not find Props type in ${fileName}`);
    }

    const { propGroups, props } = readProps(propsAlias, sourceFile);

    return {
      ...component,
      fileName,
      propGroups,
      props,
    };
  });
}

function renderPropsTable(props) {
  if (props.length === 0) {
    return 'This component has no adapter-specific props.';
  }

  return [
    '| prop | required | type | description |',
    '| - | - | - | - |',
    props
      .map(
        ({ description, name, required, type }) =>
          `| ${name} | ${required ? 'yes' : 'no'} | \`${escapeMarkdown(type)}\` | ${escapeMarkdown(description || '-')} |`,
      )
      .join('\n'),
  ].join('\n');
}

function renderPropGroups(propGroups) {
  if (propGroups.length === 0) {
    return '';
  }

  return propGroups.map(({ name, props }) => `### ${name}\n\n${renderPropsTable(props)}`).join('\n\n');
}

function renderComponents(components) {
  const runtimeOptions = readRuntimeOptions();

  return components
    .map(({ description, fileName, name, propGroups, props }) => {
      const componentProps = fileName === 'ImmerserProvider.tsx' ? [...props, ...runtimeOptions] : props;
      const componentDescription = fileName === 'ImmerserProvider.tsx' ? providerDescription : description;

      return `## ${name}

${componentDescription}

${renderPropsTable(componentProps)}${propGroups.length > 0 ? `\n\n${renderPropGroups(propGroups)}` : ''}`;
    })
    .join('\n\n');
}

function renderReadme() {
  const components = readComponents();

  return `# Immerser React

React adapter for [Immerser](https://github.com/dubaua/immerser). It lets you declare Immerser markup with components instead of writing \`data-immerser-*\` DOM by hand.

The project exposes a small component set:

${components.map(({ description, name }) => `- \`${name}\` - ${getSummary(description)}`).join('\n')}

## Terms

- \`Immerser\` (here \`ImmerserRoot\` component) is the fixed root node.
- \`Solid\` is a piece of fixed UI rendered inside the root and copied into every layer mask.
- \`Layer\` is a real scroll section that drives mask transitions.
- \`Mask\` is internal clipping markup rendered by the adapter.
- \`Synchro\` means shared state between solid copies.

## Install

\`\`\`ts
import { ImmerserLayer, ImmerserProvider, ImmerserRoot, ImmerserSolid } from '@immerser/react';
\`\`\`

## How to Use

Wrap the page in \`ImmerserProvider\`, render fixed solids inside \`ImmerserRoot\`, then render scroll sections with \`ImmerserLayer\`.

\`ImmerserProvider\` owns the controller lifecycle. Provider props are adapter-specific props plus the runtime controls exposed by the React adapter.

\`solidClassnamesByLayerId\` is the central config. Its top-level keys must match \`ImmerserLayer id\` values. Layer and pager order comes from the DOM order of \`ImmerserLayer\` elements, not from config key order. Each layer value maps solid names to CSS classes applied to the copied solids inside that layer mask, so fixed content stays readable when the fixed container overlaps that layer.

\`ImmerserLayer\` elements must have real layout height. Prefer content-driven height, or define CSS such as \`min-height\`; zero-height layers cannot be measured correctly.

\`\`\`tsx
${exampleCode}
\`\`\`

## Styling

Position \`ImmerserRoot\` and every solid with CSS. Do not pass \`style\` to adapter components: the adapter reserves inline styles for technical Immerser styles and replaces any user-provided style prop. Child content inside adapter components is regular React.

\`\`\`css
${cssCode}
\`\`\`

## Component API

This section is generated from current component files and their JSDoc comments.

${renderComponents(components)}
`;
}

fs.writeFileSync(readmePath, renderReadme());
console.log(`Built ${path.relative(rootDir, readmePath)}`);
