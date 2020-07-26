import { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import withSession from '@utils/session';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;

  padding: 15px;
`;

const GridItem = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  height: 100px;
  padding: 20px 40px;
  border: 0;
  outline: none;

  background-color: ${({ theme, isFavourited }) =>
    isFavourited ? 'green' : theme.colors.navBackground};

  &:hover {
    cursor: pointer;
  }
`;

const Boards = ({ boards, user, favourites }) => {
  const [favouriteBoards, addFavouriteBoard] = useState(favourites);

  const toggleFavourite = board => {
    if (favouriteBoards.includes(board)) {
      fetch(`/api/boards/${board.id}/favourite`, {
        method: 'DELETE',
        body: JSON.stringify({ user }),
      });
      const boards = favouriteBoards.filter(
        favBoard => favBoard.id !== board.id,
      );
      addFavouriteBoard(boards);
    } else {
      fetch(`/api/boards/${board.id}/favourite`, {
        method: 'PUT',
        body: JSON.stringify({ user, name: board.name }),
      });

      addFavouriteBoard([...favouriteBoards, board]);
    }
  };

  return (
    <Grid>
      {boards.map(board => (
        <GridItem
          key={board.id}
          isFavourited={favouriteBoards.some(fav => fav.id === board.id)}
          onClick={() => toggleFavourite(board)}
        >
          {board.name}
          <a
            href={
              board.jira_url ||
              `https://jira.towa-digital.com/secure/RapidBoard.jspa?rapidView=${board.id}`
            }
            target="_blank"
          >
            (Jira)
          </a>
        </GridItem>
      ))}
    </Grid>
  );
};

export const getServerSideProps = withSession(async function({ req, res }) {
  const user = req.session.get('user');
  const authToken = req.session.get('authToken');

  // TODO: move this to an HOC
  if (user === undefined || authToken === undefined) {
    res.setHeader('location', '/');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  // TODO: move to a seperate function maybe
  const boardsResponse = await fetch(`http://${req.headers.host}/api/boards`, {
    method: 'POST',
    body: JSON.stringify({ authToken }),
  });

  const favouritesResponse = await fetch(
    `http://${req.headers.host}/api/boards/favourites`,
    {
      method: 'POST',
      body: JSON.stringify({ user }),
    },
  );

  let boards, favourites;

  try {
    boards = await boardsResponse.json();
    favourites = await favouritesResponse.json();
  } catch (error) {
    console.error(error);
    return {
      props: {
        user: req.session.get('user'),
        authToken: req.session.get('authToken'),
        error,
      },
    };
  }

  return {
    props: {
      user: req.session.get('user'),
      authToken: req.session.get('authToken'),
      boards,
      favourites,
    },
  };
});

export default Boards;

Boards.propTypes = {
  boards: PropTypes.array,
  user: PropTypes.array,
  favourites: PropTypes.array,
};
