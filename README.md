# Immerser React

React adapter for declaring Immerser markup with components instead of writing `data-immerser-*` DOM by hand.

The project exposes a small component set:

- `ImmerserProvider` - Owns the core `Immerser` controller lifecycle and shares its scroll state with React components.
- `Immerser` - Renders the fixed immerser root and the per-layer mask structure driven by the core controller.
- `ImmerserLayer` - Marks a real section as an immerser layer.
- `ImmerserSolid` - Declares content positioned inside the `Immerser` root, usually absolutely positioned within that root.
- `ImmerserPager` - Builds a pager solid inside the `Immerser` root from provider layer ids.
- `ImmerserSynchroLink` - Anchor with synchronized hover state across layer clones.

## Install

```ts
import { Immerser, ImmerserLayer, ImmerserProvider, ImmerserSolid } from '@immerser/react';
```

## How to Use

Wrap the page in `ImmerserProvider`, render fixed solids inside `Immerser`, then render scroll sections with `ImmerserLayer`.

`ImmerserProvider` owns the controller lifecycle. Provider props are adapter-specific props plus `Partial<RuntimeOptions>` from `immerser`; that core type is the source of hot options accepted by the React adapter.

`solidClassnamesByLayerId` is the central config. Its top-level keys must match `ImmerserLayer id` values. Layer and pager order comes from the DOM order of `ImmerserLayer` elements, not from config key order. Each layer value maps solid names to CSS classes applied to the copied solids inside that layer mask, so fixed content stays readable when the fixed container overlaps that layer.

`ImmerserLayer` elements must have real layout height. Prefer content-driven height, or define CSS such as `min-height`; zero-height layers cannot be measured correctly.

```tsx
import { useMemo } from 'react';
import {
  Immerser,
  ImmerserLayer,
  ImmerserPager,
  ImmerserProvider,
  ImmerserSolid,
  ImmerserSynchroLink,
} from '@immerser/react';
import type { Options } from 'immerser';

const solidClassnamesByLayerId = {
  intro: {
    logo: 'logo--light',
    pager: 'pager--light',
  },
  details: {
    menu: 'menu--dark',
    pager: 'pager--dark',
  },
} satisfies Options['solidClassnamesByLayerId'];

export const Page = () => {
  const on = useMemo<Options['on']>(
    () => ({
      layerProgressChange(layerProgressArray) {
        console.log(layerProgressArray);
      },
    }),
    [],
  );

  return (
    <ImmerserProvider
      solidClassnamesByLayerId={solidClassnamesByLayerId}
      fromViewportWidth={1024}
      scrollAdjustThreshold={50}
      scrollAdjustDelay={600}
      updateLocationHash={(layerId) => window.history.replaceState(null, '', `#${layerId}`)}
      on={on}
    >
      <Immerser className="fixed">
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
      </Immerser>

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
};
```

## Styling

Position the `Immerser` root and every solid with CSS. Do not pass `style` to adapter components: the adapter reserves inline styles for technical Immerser styles and replaces any user-provided style prop. Child content inside adapter components is regular React.

```css
.fixed {
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
}
```

## Component API

This section is generated from current component files and their JSDoc comments.

## ImmerserProvider

Owns the core `Immerser` controller lifecycle and shares its scroll state with React components. Provider props are adapter-specific props plus `Partial<RuntimeOptions>` from `immerser`. `RuntimeOptions` is the source of hot core options accepted by the React adapter. Event handlers passed through `on` are init-only and registered when the controller is created. `selectorRoot` recreates the core controller when changed. Runtime options are forwarded through `updateOptions`. See [core options docs](https://github.com/dubaua/immerser#options). `solidClassnamesByLayerId` keys must match `ImmerserLayer` ids. `solidClassnamesByLayerId` keeps the same shape as the constructor option, but the adapter uses it to render solid copies inside each layer mask and does not forward it as-is. Init-only and adapter-owned core options are not exposed: `autoMount`, `hasExternalScroll`, `hasExternalRenderer`, `pagerLinkActiveClassname` and the core `solidClassnamesByLayerId` contract. This keeps DOM measurement, mask rendering and scroll listeners in one place while the rest of the API stays declarative.

| prop | required | type | description |
| - | - | - | - |
| children | no | `ReactNode` | React tree that declares an immerser root, its absolute solids and scroll layers. |
| on | no | `Options['on']` | Initial event handlers registered when the core controller is created. Changing this prop does not update the current controller. |
| selectorRoot | no | `Options['selectorRoot']` | Parent node used for selector discovery. Changing it recreates the core controller. |
| solidClassnamesByLayerId | yes | `Options['solidClassnamesByLayerId']` | React-only per-layer solid modifiers keyed by layer id. This is intentionally not passed to the core controller, even though the core has a similarly named option. The React adapter uses it to render masked solid clones itself. |
| debug | no | `boolean` | Enables runtime reporting of warnings and errors. Default: `false`. |
| fromViewportWidth | no | `number` | Minimal viewport width (px) at which immerser mounts runtime; below it unmounts runtime. Default: `0`. |
| updateLocationHash | no | `UpdateLocationHashHandler` | Handles active layer id when it should be pushed into location hash. Default: `undefined`. |
| pagerThreshold | no | `number` | Portion of viewport height that must overlap the next layer before pager switches (0–1). Default: `0.5`. |
| scrollAdjustDelay | no | `number` | Delay in ms before running scroll snapping after user scroll stops. Default: `600`. |
| scrollAdjustThreshold | no | `number` | Pixel threshold near section edges that triggers scroll snapping when exceeded, if 0 - no adjusting. Default: `0`. |

## Immerser

Renders the fixed immerser root and the per-layer mask structure driven by the core controller. Direct children must be `ImmerserSolid` or `ImmerserPager` so each layer can receive its own solid classnames. Fragments and wrapper components are not accepted as direct children. In React mode, the core measures layer masks and moves their transitions; React owns the mask markup itself.

This component has no adapter-specific props.

## ImmerserLayer

Marks a real section as an immerser layer. The core uses these nodes to calculate layer bounds, progress and active index. Render one layer component for every scroll section that should drive solid class changes.

| prop | required | type | description |
| - | - | - | - |
| as | no | `T` | Element used for the layer; defaults to `div`. |
| children | no | `ReactNode` | Layer content that defines the page section measured by the core controller. |
| id | yes | `string` | Stable layer id used for hash links, pager links and solid classname lookup. Must match a `solidClassnamesByLayerId` key. |

## ImmerserSolid

Declares content positioned inside the `Immerser` root, usually absolutely positioned within that root. React renders a copy into each mask and applies layer-specific classnames by solid name.

| prop | required | type | description |
| - | - | - | - |
| name | yes | `string` | Solid id used to read the matching classname from each layer configuration. |
| as | no | `T` | Element or component used to render the solid inside `Immerser` root; defaults to `div`. |
| children | no | `ReactNode` | Interactive content rendered inside every layer mask. Position it with your own CSS. |

## ImmerserPager

Builds a pager solid inside the `Immerser` root from provider layer ids. Renders one link per DOM layer as a solid named `pager`, ordered by `ImmerserLayer` DOM order. Add `pager` classnames to layer configs when the pager needs per-layer visual changes. It mirrors core pager behavior in React so active state comes from context instead of DOM class mutation. In default mode each generated link receives `linkClassName`, `href="#layerId"`, `hoverClassName` with `_hover` as the default, and `synchroId="pager-${layerIndex}"`. Custom render mode receives `isActive`, `layerId` and `layerIndex` and does not add those generated-link props.

| prop | required | type | description |
| - | - | - | - |
| as | no | `T` | Element used for the pager wrapper; defaults to `nav`. |

### Default mode

| prop | required | type | description |
| - | - | - | - |
| activeClassName | yes | `string` | Classname applied to the generated link for the currently active layer. |
| linkClassName | yes | `string` | Classname applied to each generated pager link. |
| hoverClassName | no | `string` | Classname applied to generated link copies while any of them is hovered. |
| renderLink | no | `never` | - |

### Custom render mode

| prop | required | type | description |
| - | - | - | - |
| renderLink | yes | `(props: RenderLinkProps) => ReactNode` | Renders custom content for each configured layer. |
| activeClassName | no | `never` | - |
| linkClassName | no | `never` | - |
| hoverClassName | no | `never` | - |

## ImmerserSynchroLink

Anchor with synchronized hover state across layer clones. One source link is rendered into multiple layer-mask copies; `synchroId` keeps only those generated copies in the same hover group. This mirrors the core `data-immerser-synchro-hover` feature without relying on cloned DOM event wiring.

| prop | required | type | description |
| - | - | - | - |
| hoverClassName | yes | `string` | Classname applied to generated copies of this link while any one of them is hovered. |
| synchroId | yes | `string` | Stable hover group id for this source link. `Immerser` copies the link into every layer mask, so use the same `synchroId` for links that should share hover state, and different values for independent hover groups. |
