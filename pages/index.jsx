import Head from 'next/head';
import { Page } from '@zeit-ui/react';

import withSession from '@utils/session';
import LoginForm from '@components/LoginForm';

const Home = () => (
  <Page>
    <Head>
      <title>Homepage | SprintGenerator</title>
    </Head>
    <Page.Content>
      <LoginForm />
    </Page.Content>
  </Page>
);

export const getServerSideProps = withSession(async function({ req, res }) {
  const authToken = req.session.get('authToken');

  if (authToken === undefined) {
    return { props: {} };
  }

  res.setHeader('Location', '/dashboard');
  res.statusCode = 302;
  res.end();
  return {
    props: { authToken: req.session.get('authToken') },
  };
});

export default Home;
