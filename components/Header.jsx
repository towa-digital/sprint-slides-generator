import styled from 'styled-components';
import PropTypes from 'prop-types';

const HeaderOuter = styled.header`
  width: 100%;

  display: ${({ displayHeader }) => (displayHeader ? 'flex' : 'none')};
  background-color: ${({ theme }) => theme.colors.navBackground};
`;

const HeaderInner = styled.div`
  width: 100%;
  max-width: 1024px;

  margin: 0 auto;
  padding: 1rem 2rem;
`;

const Header = ({ children, displayHeader }) => (
  <>
    <HeaderOuter displayHeader={displayHeader}>
      <HeaderInner>{children}</HeaderInner>
    </HeaderOuter>
  </>
);

export default Header;

Header.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  displayHeader: PropTypes.bool,
};