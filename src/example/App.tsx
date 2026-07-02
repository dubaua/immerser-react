import { useEffect, useMemo, useState } from 'react';
import {
  ImmerserLayer,
  ImmerserPager,
  ImmerserProvider,
  ImmerserRoot,
  ImmerserSolid,
  ImmerserSynchroLink,
} from '../../dist/immerser-react.js';
import type { Options } from 'immerser';

import { EmojiFace } from './EmojiFace';
import { exampleHeaderHtml, exampleLayerHtmlById } from './example-content';
import { initEmojiSpin, renderEmojiLayers } from './emoji-animation';

type HighlightableElement = HTMLElement & { isHighlighting?: boolean };

const baseSolidClassnamesByLayerId = {
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

const testLayerSolidClassnames = {
  logo: 'logo--contrast',
  pager: 'pager--contrast',
  language: 'language--contrast',
  menu: 'menu--contrast',
  about: 'about--contrast',
  emoji: 'emoji--inverse',
};

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
  const [isTestLayerShown, setIsTestLayerShown] = useState(false);
  const solidClassnamesByLayerId = useMemo<Options['solidClassnamesByLayerId']>(
    () => ({
      ...baseSolidClassnamesByLayerId,
      ...(isTestLayerShown ? { 'rerender-test': testLayerSolidClassnames } : {}),
    }),
    [isTestLayerShown],
  );
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
      debug
      updateLocationHash={(layerId) => window.history.replaceState(null, '', `#${layerId}`)}
    >
      <ImmerserRoot className="fixed">
        <ImmerserPager
          className="fixed__pager pager"
          linkClassName="pager__link"
          activeClassName="pager__link--active"
        />
        <ImmerserSolid name="logo" className="fixed__logo">
          <ImmerserSynchroLink href="#reasoning" className="logo" hoverClassName="_hover" synchroId="logo">
            immerser
          </ImmerserSynchroLink>
        </ImmerserSolid>
        <ImmerserSolid name="menu" className="fixed__menu menu">
          <ImmerserSynchroLink href="#reasoning" className="menu__link" hoverClassName="_hover" synchroId="reasoning">
            Reasoning
          </ImmerserSynchroLink>
          <ImmerserSynchroLink href="#how-to-use" className="menu__link" hoverClassName="_hover" synchroId="how-to-use">
            How to Use
          </ImmerserSynchroLink>
          <ImmerserSynchroLink
            href="#how-it-works"
            className="menu__link"
            hoverClassName="_hover"
            synchroId="how-it-works"
          >
            How it Works
          </ImmerserSynchroLink>
          <ImmerserSynchroLink href="#options" className="menu__link" hoverClassName="_hover" synchroId="options">
            Options
          </ImmerserSynchroLink>
          <ImmerserSynchroLink href="#recipes" className="menu__link" hoverClassName="_hover" synchroId="recipes">
            Recipes
          </ImmerserSynchroLink>
        </ImmerserSolid>
        <ImmerserSolid name="language" className="fixed__language language">
          <span className="language__link language__link--active">english</span>
          <button
            className="language__link language__link--button"
            type="button"
            onClick={() => setIsTestLayerShown((currentIsTestLayerShown) => !currentIsTestLayerShown)}
          >
            {isTestLayerShown ? 'hide test layer' : 'show test layer'}
          </button>
        </ImmerserSolid>
        <ImmerserSolid name="about" className="fixed__about about">
          <span>&copy; 2026 &mdash; Vladimir Lysov, Chelyabinsk, Russia</span>
          <ImmerserSynchroLink href="https://github.com/dubaua/immerser" hoverClassName="_hover" synchroId="github">
            github
          </ImmerserSynchroLink>
          <ImmerserSynchroLink href="mailto:dubaua@gmail.com" hoverClassName="_hover" synchroId="email">
            dubaua@gmail.com
          </ImmerserSynchroLink>
        </ImmerserSolid>
        <ImmerserSolid as={EmojiFace} name="emoji" />
      </ImmerserRoot>

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
      {isTestLayerShown && <ImmerserLayer id="rerender-test" className="rerender-test-layer" />}

      <footer className="footer">
        <div className="language">
          <span className="language__link language__link--active">english</span>
          <button
            className="language__link language__link--button"
            type="button"
            onClick={() => setIsTestLayerShown((currentIsTestLayerShown) => !currentIsTestLayerShown)}
          >
            {isTestLayerShown ? 'hide test layer' : 'show test layer'}
          </button>
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
