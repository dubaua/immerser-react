import { createRoot } from 'react-dom/client';
import { Immerser, ImmerserLayer, ImmerserProvider, ImmerserSolid } from '@immerser/react';
import './style.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found.');
}

const root = createRoot(rootElement);

root.render(
  <ImmerserProvider
    solidClassnamesByLayerId={{
      'layer-one': { brand: 'brand--light', pager: 'pager--light' },
      'layer-two': { brand: 'brand--dark', pager: 'pager--dark' },
      'layer-three': { brand: 'brand--accent', pager: 'pager--accent' },
    }}
    pagerLinkActiveClassname="pager__link--active"
    scrollAdjustThreshold={40}
    scrollAdjustDelay={300}
    on={{
      init(immerser) {
        console.log('init', immerser);
      },
      activeLayerChange(activeIndex, immerser) {
        console.log('activeLayerChange', activeIndex, immerser);
      },
    }}
  >
    <Immerser className="fixed">
      <ImmerserSolid name="brand" className="fixed__brand">
        Immerser
      </ImmerserSolid>
      <ImmerserSolid
        as="nav"
        name="pager"
        className="fixed__pager pager"
        data-immerser-pager=""
      >
        <a className="pager__link" href="#layer-one" data-immerser-pager-link="">
          Layer 1
        </a>
        <a className="pager__link" href="#layer-two" data-immerser-pager-link="">
          Layer 2
        </a>
        <a className="pager__link" href="#layer-three" data-immerser-pager-link="">
          Layer 3
        </a>
      </ImmerserSolid>
    </Immerser>

    <main className="layers">
      <ImmerserLayer
        as="section"
        id="layer-one"
        className="layer layer--one"
      >
        <div className="layer__content">
          <h1>Layer One</h1>
          <p>Scroll to switch layers. The fixed elements change styles via Immerser.</p>
        </div>
      </ImmerserLayer>

      <ImmerserLayer
        as="section"
        id="layer-two"
        className="layer layer--two"
      >
        <div className="layer__content">
          <h1>Layer Two</h1>
          <p>Data attributes follow the official Immerser markup pattern.</p>
        </div>
      </ImmerserLayer>

      <ImmerserLayer
        as="section"
        id="layer-three"
        className="layer layer--three"
      >
        <div className="layer__content">
          <h1>Layer Three</h1>
          <p>Use the pager links to jump between layers.</p>
        </div>
      </ImmerserLayer>
    </main>
  </ImmerserProvider>
);
