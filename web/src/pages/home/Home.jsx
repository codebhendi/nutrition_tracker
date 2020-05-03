import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

// Home component where user will be redirected based on their roles.
const Home = ({ user }) => {
  if (!user) return <Redirect to="/login" />;

  if (user.admin) return <Redirect to="/admin/meals" />;

  return <Redirect to="/meals" />;
};

Home.propTypes = { user: PropTypes.shape({ admin: PropTypes.bool }) };

Home.defaultProps = { user: null };

export default Home;
