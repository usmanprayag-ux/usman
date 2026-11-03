/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LandingPageFrame, LandingPageFrameProps } from '../../shaders/landing-pages/LandingPageFrame';

export interface KageLandingPageProps extends LandingPageFrameProps {
  className?: string;
}

export const KageLandingPage: React.FC<KageLandingPageProps> = ({
  title = 'Kage',
  sourceUrl = '/landing-pages/kage.html',
  className = '',
  ...props
}) => {
  return (
    <div className={`kage-landing-page-root ${className}`}>
      <LandingPageFrame
        title={title}
        sourceUrl={sourceUrl}
        {...props}
      />
    </div>
  );
};

export default KageLandingPage;
