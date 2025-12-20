import Immerser from 'immerser';
import './style.css';

const immerserInstance = new Immerser({
  solidClassnameArray: [
    { brand: 'brand--light', pager: 'pager--light' },
    { brand: 'brand--dark', pager: 'pager--dark' },
    { brand: 'brand--accent', pager: 'pager--accent' },
  ],
  pagerLinkActiveClassname: 'pager__link--active',
  scrollAdjustThreshold: 40,
  scrollAdjustDelay: 300,
  on: {
    init(immerser) {
      console.log('init', immerser);
    },
    activeLayerChange(activeIndex, immerser) {
      console.log('activeLayerChange', activeIndex, immerser);
    },
  },
});

window.addEventListener('beforeunload', () => {
  immerserInstance.destroy();
});
