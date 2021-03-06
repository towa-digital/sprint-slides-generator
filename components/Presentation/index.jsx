import PropTypes from 'prop-types';
import { useState, cloneElement, useEffect } from 'react';
import { useRouter } from 'next/router';

import useKeyPress from '@utils/hooks/useKeyPress';

const Presentation = ({ children, isSaved }) => {
  const router = useRouter();
  const slides = children.flat().filter(child => child);

  const presetSlideNo = parseInt(router.query.slide)
    ? router.query.slide < slides.flat().length - 1
      ? parseInt(router.query.slide)
      : slides.flat().length - 1
    : 0;

  const [activeSlide, setActiveSlide] = useState(presetSlideNo);

  const arrowRight = useKeyPress('ArrowRight');
  const arrowLeft = useKeyPress('ArrowLeft');
  const space = useKeyPress('Space');
  const enter = useKeyPress('Enter');
  const backspace = useKeyPress('Backspace');
  const f = useKeyPress('f');
  const escape = useKeyPress('Escape');

  const rightPressed = arrowRight || space || enter;
  const leftPressed = arrowLeft || backspace;
  const fullScreenPressed = f;

  useEffect(() => {
    if (rightPressed && activeSlide < slides.flat().length - 1) {
      setActiveSlide(activeSlide + 1);
    } else if (leftPressed && activeSlide !== 0) {
      setActiveSlide(activeSlide - 1);
    }
    if (activeSlide !== 0) {
      router.prefetch(`${router.query.slug}?slide=${activeSlide + 1}`);
      router.prefetch(`${router.query.slug}?slide=${activeSlide - 1}`);
      router.push(
        `?slide=${activeSlide}`,
        `${router.query.slug}?slide=${activeSlide}`,
        { shallow: true },
      );
    } else if (router.asPath.includes('?')) {
      router.prefetch(`${router.query.slug}?slide=${activeSlide + 1}`);
      router.push(
        `?slide=${activeSlide}`,
        `${router.query.slug}?slide=${activeSlide}`,
        { shallow: true },
      );
    }
  }, [rightPressed, leftPressed]);

  useEffect(() => {
    if (
      document.fullscreenEnabled &&
      !document.fullscreenElement &&
      fullScreenPressed
    ) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen && escape) {
      document.exitFullscreen();
    }
  }, [fullScreenPressed, escape]);

  const teenager = slides.map((child, index) =>
    cloneElement(child, {
      id: `slide-${index}`,
      key: `slide-${index}`,
      isActive: activeSlide === index,
      isSaved,
    }),
  );

  return teenager.filter(teen => teen.props.isActive);
};

export default Presentation;

Presentation.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  isSaved: PropTypes.bool,
};

/** Unit Tests:
 *
 * - has active slide
 * - can increase/decrease active slide
 * - children have key set
 * - children have isActive set
 * - buttons are disabled
 */
