/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LandingPageFrame, LandingPageFrameProps } from './LandingPageFrame';

export interface LandingPagesProps extends Partial<LandingPageFrameProps> {
  activePage?: 'kage';
}

export const LandingPages: React.FC<LandingPagesProps> = ({
  activePage = 'kage',
  title = 'Kage',
  sourceUrl = '/landing-pages/kage.html',
  ...props
}) => {
  return (
    <LandingPageFrame
      title={title}
      sourceUrl={sourceUrl}
      {...props}
    />
  );
};

export default LandingPages;
