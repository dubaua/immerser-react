import { useEffect, useMemo } from 'react';
import { Immerser, ImmerserLayer, ImmerserPager, ImmerserProvider, ImmerserSolid } from '@immerser/react';
import type { Options } from 'immerser';

import { EmojiFace } from './EmojiFace';
import { exampleHeaderHtml, exampleLayerHtmlById } from './example-content';
import { initEmojiSpin, renderEmojiLayers } from './emoji-animation';

type HighlightableElement = HTMLElement & { isHighlighting?: boolean };

const solidClassnamesByLayerId = {
  reasoning: {
    logo: 'logo--contrast-lg',
    pager: 'pager--contrast-lg',
    language: 'language--contrast-lg',
  },
  'how-to-use': {
    pager: 'pager--contrast-only-md',
    menu: 'menu--contrast',
    about: 'about--contrast',
    emoji: 'emoji--inverse',
  },
  'how-it-works': {
    logo: 'logo--contrast-lg',
    pager: 'pager--contrast-lg',
    language: 'language--contrast-lg',
  },
  options: {
    logo: 'logo--contrast-only-md',
    pager: 'pager--contrast-only-md',
    language: 'language--contrast-only-md',
    menu: 'menu--contrast',
    about: 'about--contrast',
    emoji: 'emoji--inverse',
  },
  recipes: {
    logo: 'logo--contrast-lg',
    pager: 'pager--contrast-lg',
    language: 'language--contrast-lg',
  },
} satisfies Options['solidClassnamesByLayerId'];

const highlightAnimationClassname = 'highlighter-animation-active';

const highlight = (highlighterNode: HTMLElement) => () => {
  const targetSelector = highlighterNode.dataset.highlighter;

  if (!targetSelector) {
    return;
  }

  const targetNodeList = document.querySelectorAll<HighlightableElement>(targetSelector);

  targetNodeList.forEach((targetNode) => {
    if (targetNode.isHighlighting) {
      return;
    }

    targetNode.isHighlighting = true;
    targetNode.classList.add(highlightAnimationClassname);

    window.setTimeout(() => {
      targetNode.classList.remove(highlightAnimationClassname);
      targetNode.isHighlighting = false;
    }, 1500);
  });
};

export const App = () => {
  const on = useMemo<Options['on']>(
    () => ({
      init(immerser) {
        console.log('init', immerser);
        renderEmojiLayers([1, 0, 0, 0, 0]);
      },
      mount(immerser) {
        console.log('mount', immerser);
        renderEmojiLayers(immerser.layerProgressArray);
      },
      unmount(immerser) {
        console.log('unmount', immerser);
      },
      destroy(immerser) {
        console.log('destroy', immerser);
      },
      layerProgressChange(layersProgress, _immerser) {
        renderEmojiLayers(layersProgress);
      },
    }),
    [],
  );

  useEffect(() => {
    const cleanupSpin = initEmojiSpin();
    const highlighterNodeList = document.querySelectorAll<HTMLElement>('[data-highlighter]');
    const highlighterListeners = Array.from(highlighterNodeList, (highlighterNode) => {
      const listener = highlight(highlighterNode);

      highlighterNode.addEventListener('mouseover', listener);
      highlighterNode.addEventListener('click', listener);

      return () => {
        highlighterNode.removeEventListener('mouseover', listener);
        highlighterNode.removeEventListener('click', listener);
      };
    });

    const onKeyDown = ({ altKey, code, keyCode }: KeyboardEvent) => {
      const isR = code === 'KeyR' || keyCode === 82;

      if (altKey && isR) {
        document.getElementById('rulers')?.classList.toggle('rulers--active');
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      cleanupSpin();
      highlighterListeners.forEach((cleanup) => cleanup());
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <ImmerserProvider
      solidClassnamesByLayerId={solidClassnamesByLayerId}
      fromViewportWidth={1024}
      scrollAdjustThreshold={50}
      scrollAdjustDelay={600}
      on={on}
    >
      <Immerser className="fixed">
        <ImmerserPager className="fixed__pager pager" activeClassName="pager__link--active" />
        <ImmerserSolid
          as="a"
          href="#reasoning"
          name="logo"
          className="fixed__logo logo"
          data-immerser-synchro-hover="logo"
        >
          immerser
        </ImmerserSolid>
        <ImmerserSolid name="menu" className="fixed__menu menu">
          <a href="#reasoning" className="menu__link" data-immerser-synchro-hover="reasoning">
            Reasoning
          </a>
          <a href="#how-to-use" className="menu__link" data-immerser-synchro-hover="how-to-use">
            How to Use
          </a>
          <a href="#how-it-works" className="menu__link" data-immerser-synchro-hover="how-it-works">
            How it Works
          </a>
          <a href="#options" className="menu__link" data-immerser-synchro-hover="options">
            Options
          </a>
          <a href="#recipes" className="menu__link" data-immerser-synchro-hover="recipes">
            Recipes
          </a>
        </ImmerserSolid>
        <ImmerserSolid name="language" className="fixed__language language">
          <span className="language__link language__link--active">english</span>
          <a href="./ru.html" className="language__link">
            по-русски
          </a>
        </ImmerserSolid>
        <ImmerserSolid name="about" className="fixed__about about">
          <span>&copy; 2026 &mdash; Vladimir Lysov, Chelyabinsk, Russia</span>
          <a href="https://github.com/dubaua/immerser">github</a>
          <a href="mailto:dubaua@gmail.com">dubaua@gmail.com</a>
        </ImmerserSolid>
        <ImmerserSolid as={EmojiFace} name="emoji" />
      </Immerser>

      <header className="header" dangerouslySetInnerHTML={{ __html: exampleHeaderHtml }} />

      <ImmerserLayer
        id="reasoning"
        className="grid"
        dangerouslySetInnerHTML={{ __html: exampleLayerHtmlById.reasoning }}
      />
      <ImmerserLayer
        id="how-to-use"
        className="grid"
        dangerouslySetInnerHTML={{ __html: exampleLayerHtmlById['how-to-use'] }}
      />
      <ImmerserLayer
        id="how-it-works"
        className="grid"
        dangerouslySetInnerHTML={{ __html: exampleLayerHtmlById['how-it-works'] }}
      />
      <ImmerserLayer id="options" className="grid" dangerouslySetInnerHTML={{ __html: exampleLayerHtmlById.options }} />
      <ImmerserLayer id="recipes" className="grid" dangerouslySetInnerHTML={{ __html: exampleLayerHtmlById.recipes }} />

      <footer className="footer">
        <div className="language">
          <span className="language__link language__link--active">english</span>
          <a href="./ru.html" className="language__link">
            по-русски
          </a>
        </div>
        <div className="about">
          <a href="https://github.com/dubaua/immerser">github</a>
          <a href="mailto:dubaua@gmail.com">dubaua@gmail.com</a>
        </div>
      </footer>
      <div className="rulers" id="rulers" />
    </ImmerserProvider>
  );
};

App.displayName = 'App';
