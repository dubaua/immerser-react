import classNames from 'classnames';
import { Children, cloneElement, isValidElement, type ReactNode } from 'react';

import { ImmerserPager } from '../ImmerserPager';
import { ImmerserSolid } from '../ImmerserSolid';
import type { SolidElementProps } from '../types';

/** @internal */
export const renderSolidsForLayer = (children: ReactNode, solidClassnames: Record<string, string> = {}): ReactNode =>
  Children.map(children, (child) => {
    if (child === null || child === undefined || child === false) {
      return child;
    }

    if (!isValidElement<SolidElementProps>(child) || (child.type !== ImmerserSolid && child.type !== ImmerserPager)) {
      throw new Error('ImmerserRoot accepts only ImmerserSolid or ImmerserPager as direct children.');
    }

    const name = child.props.name ?? 'pager';

    return cloneElement(child, {
      className: classNames(child.props.className, solidClassnames[name]),
    });
  });
