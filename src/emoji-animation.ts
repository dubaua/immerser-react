type EmojiFaceConfig = {
  mouthEllipse: number;
  mouthLineScaleX: number;
  mouthLineShiftX: number;
  tongueX: number;
  tongueY: number;
  eyeOpenLeft: number;
  eyeOpenRight: number;
  eyeClosedLeft: number;
  eyeClosedRight: number;
  leftBrowScaleX: number;
  leftBrowY: number;
  rightBrowScaleX: number;
  rightBrowY: number;
  glasses: number;
  hand: number;
};

type Point = { x: number; y: number };

type EmojiNodes = {
  mouthClipPath: SVGEllipseElement | null;
  mouthShape: SVGEllipseElement | null;
  mouthLine: SVGPathElement | null;
  tongue: SVGPathElement | null;
  leftEyeClosed: SVGPathElement | null;
  rightEyeClosed: SVGPathElement | null;
  leftEyeOpen: SVGCircleElement | null;
  rightEyeOpen: SVGCircleElement | null;
  leftBrow: SVGPathElement | null;
  rightBrow: SVGPathElement | null;
  glass: SVGGElement | null;
  handInner: SVGGraphicsElement | null;
  handOuter: SVGGElement | null;
  rotator: SVGGElement | null;
};

const closedEyeLeftBase: Point[] = [
  { x: 79, y: 74 },
  { x: 105, y: 100 },
  { x: 105, y: 74 },
  { x: 79, y: 100 },
];

const closedEyeRightBase: Point[] = [
  { x: 145, y: 74 },
  { x: 171, y: 100 },
  { x: 171, y: 74 },
  { x: 145, y: 100 },
];

const layerConfigs: EmojiFaceConfig[] = [
  {
    mouthEllipse: 0,
    mouthLineScaleX: 1,
    mouthLineShiftX: 0.5,
    tongueX: 0.685,
    tongueY: 0,
    eyeOpenLeft: 0.8,
    eyeOpenRight: 0.8,
    eyeClosedLeft: 0,
    eyeClosedRight: 0,
    leftBrowScaleX: 0,
    leftBrowY: 0,
    rightBrowScaleX: 0,
    rightBrowY: 0,
    glasses: 0,
    hand: 0,
  },
  {
    mouthEllipse: 0,
    mouthLineScaleX: 1,
    mouthLineShiftX: 0.5,
    tongueX: 0.685,
    tongueY: 0.7,
    eyeOpenLeft: 0.8,
    eyeOpenRight: 0.8,
    eyeClosedLeft: 0,
    eyeClosedRight: 0,
    leftBrowScaleX: 0,
    leftBrowY: 0,
    rightBrowScaleX: 0,
    rightBrowY: 0,
    glasses: 0,
    hand: 0,
  },
  {
    mouthEllipse: 0,
    mouthLineScaleX: 0.5,
    mouthLineShiftX: 0.67,
    tongueX: 0.685,
    tongueY: 0,
    eyeOpenLeft: 0.8,
    eyeOpenRight: 0.8,
    eyeClosedLeft: 0,
    eyeClosedRight: 0,
    leftBrowScaleX: 1,
    leftBrowY: 1,
    rightBrowScaleX: 1,
    rightBrowY: 0,
    glasses: 0,
    hand: 1,
  },
  {
    mouthEllipse: 0,
    mouthLineScaleX: 1,
    mouthLineShiftX: 0.5,
    tongueX: 0.685,
    tongueY: 0,
    eyeOpenLeft: 0.8,
    eyeOpenRight: 0.8,
    eyeClosedLeft: 0,
    eyeClosedRight: 0,
    leftBrowScaleX: 0,
    leftBrowY: 0,
    rightBrowScaleX: 0,
    rightBrowY: 0,
    glasses: 1,
    hand: 0,
  },
  {
    mouthEllipse: 1,
    mouthLineScaleX: 1,
    mouthLineShiftX: 0.5,
    tongueX: 0.685,
    tongueY: 0,
    eyeOpenLeft: 1,
    eyeOpenRight: 1,
    eyeClosedLeft: 0,
    eyeClosedRight: 0,
    leftBrowScaleX: 0,
    leftBrowY: 0,
    rightBrowScaleX: 0,
    rightBrowY: 0,
    glasses: 0,
    hand: 0,
  },
];

const easeCubicInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const easeCircleIn = (value: number) => 1 - Math.sqrt(1 - Math.pow(value, 2));

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const selectEmojiNodes = (root: HTMLElement): EmojiNodes => ({
  mouthClipPath: root.querySelector<SVGEllipseElement>('[data-mouth-clip-path]'),
  mouthShape: root.querySelector<SVGEllipseElement>('[data-mouth-shape]'),
  mouthLine: root.querySelector<SVGPathElement>('[data-mouth-line]'),
  tongue: root.querySelector<SVGPathElement>('[data-tongue]'),
  leftEyeClosed: root.querySelector<SVGPathElement>('[data-left-eye-closed]'),
  rightEyeClosed: root.querySelector<SVGPathElement>('[data-right-eye-closed]'),
  leftEyeOpen: root.querySelector<SVGCircleElement>('[data-left-eye-open]'),
  rightEyeOpen: root.querySelector<SVGCircleElement>('[data-right-eye-open]'),
  leftBrow: root.querySelector<SVGPathElement>('[data-left-brow]'),
  rightBrow: root.querySelector<SVGPathElement>('[data-right-brow]'),
  glass: root.querySelector<SVGGElement>('[data-glass]'),
  handInner: root.querySelector<SVGGraphicsElement>('[data-emoji-hand]'),
  handOuter: root.querySelector<SVGGElement>('[data-emoji-hand-outer]'),
  rotator: root.querySelector<SVGGElement>('[data-emoji-rotator]'),
});

const buildCrossPath = (points: ReadonlyArray<Point>, center: Point, factor: number) => {
  const scaled = points.map(({ x, y }) => ({
    x: center.x + (x - center.x) * factor,
    y: center.y + (y - center.y) * factor,
  }));

  return `M${scaled[0].x} ${scaled[0].y}L${scaled[1].x} ${scaled[1].y}M${scaled[2].x} ${scaled[2].y}L${scaled[3].x} ${scaled[3].y}`;
};

const mixConfigByProgress = (layersProgress: ReadonlyArray<number>) =>
  layerConfigs.reduce<EmojiFaceConfig>(
    (acc, config, index) => {
      const progress = layersProgress[index] ?? 0;

      acc.mouthEllipse += config.mouthEllipse * progress;
      acc.mouthLineScaleX += config.mouthLineScaleX * progress;
      acc.mouthLineShiftX += config.mouthLineShiftX * progress;
      acc.tongueX += config.tongueX * progress;
      acc.tongueY += config.tongueY * progress;
      acc.eyeOpenLeft += config.eyeOpenLeft * progress;
      acc.eyeOpenRight += config.eyeOpenRight * progress;
      acc.eyeClosedLeft += config.eyeClosedLeft * progress;
      acc.eyeClosedRight += config.eyeClosedRight * progress;
      acc.leftBrowScaleX += config.leftBrowScaleX * progress;
      acc.leftBrowY += config.leftBrowY * progress;
      acc.rightBrowScaleX += config.rightBrowScaleX * progress;
      acc.rightBrowY += config.rightBrowY * progress;
      acc.glasses += config.glasses * progress;
      acc.hand += config.hand * progress;

      return acc;
    },
    {
      mouthEllipse: 0,
      mouthLineScaleX: 0,
      mouthLineShiftX: 0,
      tongueX: 0,
      tongueY: 0,
      eyeOpenLeft: 0,
      eyeOpenRight: 0,
      eyeClosedLeft: 0,
      eyeClosedRight: 0,
      leftBrowScaleX: 0,
      leftBrowY: 0,
      rightBrowScaleX: 0,
      rightBrowY: 0,
      glasses: 0,
      hand: 0,
    },
  );

const renderEmojiFace = (config: EmojiFaceConfig, nodes: EmojiNodes) => {
  const mouthEllipse = 75 * clamp(config.mouthEllipse);
  nodes.mouthClipPath?.setAttribute('ry', mouthEllipse.toString());
  nodes.mouthShape?.setAttribute('ry', mouthEllipse.toString());

  const mouthTranslateX = 50 * (config.mouthLineShiftX - 0.5) * 2;
  nodes.mouthLine?.setAttribute('transform', `translate(${mouthTranslateX} 0) scale(${config.mouthLineScaleX} 1)`);

  const tongueX = 102 * easeCubicInOut(clamp(config.tongueX));
  const tongueY = 72 * easeCubicInOut(clamp(config.tongueY));
  nodes.tongue?.setAttribute('transform', `translate(${tongueX} ${tongueY})`);

  nodes.leftEyeOpen?.setAttribute('r', (12 * clamp(config.eyeOpenLeft)).toString());
  nodes.rightEyeOpen?.setAttribute('r', (12 * clamp(config.eyeOpenRight)).toString());
  nodes.leftEyeClosed?.setAttribute(
    'd',
    buildCrossPath(closedEyeLeftBase, { x: 92, y: 87 }, clamp(config.eyeClosedLeft)),
  );
  nodes.rightEyeClosed?.setAttribute(
    'd',
    buildCrossPath(closedEyeRightBase, { x: 158, y: 87 }, clamp(config.eyeClosedRight)),
  );

  nodes.leftBrow?.setAttribute('transform', `scale(${config.leftBrowScaleX} 1) translate(0 ${-8 * config.leftBrowY})`);
  nodes.rightBrow?.setAttribute(
    'transform',
    `scale(${config.rightBrowScaleX} 1) translate(0 ${-8 * config.rightBrowY})`,
  );

  const glassesValue = easeCircleIn(clamp(config.glasses));
  nodes.glass?.setAttribute(
    'transform',
    `translate(${550 * (1 - glassesValue)} ${-100 * (1 - glassesValue)}) rotate(${30 * (1 - glassesValue)})`,
  );

  const handValue = easeCubicInOut(clamp(config.hand));
  nodes.handOuter?.setAttribute('transform', `translate(${-12 * (1 - handValue)} ${12 * (1 - handValue)})`);
  nodes.handInner?.setAttribute('opacity', handValue.toString());
};

export const renderEmojiLayers = (layersProgress: ReadonlyArray<number>) => {
  const config = mixConfigByProgress(layersProgress);
  const faces = document.querySelectorAll<HTMLElement>('[data-emoji-face]');

  faces.forEach((face) => renderEmojiFace(config, selectEmojiNodes(face)));
};

export const initEmojiSpin = () => {
  const faces = Array.from(document.querySelectorAll<HTMLElement>('[data-emoji-face]'));
  const cleanups = faces.map((face) => {
    const rotator = face.querySelector<SVGGElement>('[data-emoji-rotator]');

    const onClick = () => {
      const startedAt = performance.now();
      const duration = 620;

      const draw = (time: number) => {
        const progress = clamp((time - startedAt) / duration);
        const angle = 360 * easeCubicInOut(progress);

        rotator?.setAttribute('transform', `rotate(${angle} 125 125)`);

        if (progress < 1) {
          requestAnimationFrame(draw);
        } else {
          rotator?.removeAttribute('transform');
        }
      };

      requestAnimationFrame(draw);
    };

    face.addEventListener('click', onClick);

    return () => {
      face.removeEventListener('click', onClick);
    };
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};
