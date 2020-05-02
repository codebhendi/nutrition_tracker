import React, { Component } from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import { Switch, Route, Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Backdrop from '@material-ui/core/Backdrop';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/styles/withStyles';

import Signup from './pages/signup/Signup';
import Login from './pages/login/Login';
import Meals from './pages/meals/Meals';
import AddMeal from './pages/add/Add';
import Home from './pages/home/Home';
import { node } from './urls';

import 'react-toastify/dist/ReactToastify.css';

const useStyles = () => ({
  backdrop: {
    zIndex: 3,
    color: '#fff',
  },
  header: {
    backgroundColor: '#2e3131',
    '& > *': {
      color: 'white',
      margin: '1rem',
      fontWeight: 500,
      textDecoration: 'none',
      letterSpacing: 1,
      fontSize: '1rem',
    },
  },
});

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { loading: true, user: null };
  }

  getUserData = async () => {
    const options = {
      method: 'get',
      url: `${node}/auth/user/data`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
    };

    this.setState({ loading: true });

    try {
      const { data: { user: userData } } = await Axios(options);
      this.setState({ user: userData });
    } catch (e) {
      console.log(e);
    } finally { this.setState({ loading: false }); }
  }

  componentDidMount = () => { this.getUserData(); }

  updateUser = (userObject) => { this.setState({ user: userObject }); }

  render = () => {
    const { classes } = this.props;
    const { loading, user } = this.state;

    if (loading) {
      return (
        <Container maxWidth="sm">
          Loading user information
        </Container>
      );
    }

    const props = { user, updateUser: this.updateUser };

    if (loading) {
      return (
        <Backdrop className={classes.backdrop} open>
          <CircularProgress color="inherit" />
        </Backdrop>
      );
    }

    return (
      <>
        <AppBar position="static">
          <Toolbar className={classes.header}>
            {user && (
              <>
                <Typography variant="h6" className={classes.title} component={Link} to="/meals">
                  Meals
                </Typography>
                <Typography variant="h6" className={classes.title} component={Link} to="/add">
                  Add Meal
                </Typography>
              </>
            )}
            {user && <Button color="inherit">Logout</Button>}
            {!user && <Button color="inherit">Login</Button>}
          </Toolbar>
        </AppBar>
        <Switch>
          <Route render={(pr) => <Signup {...pr} {...props} />} path="/signup" />
          <Route render={(pr) => <Login {...pr} {...props} />} path="/login" />
          <Route render={(pr) => <Meals {...pr} {...props} />} path="/meals" />
          <Route render={(pr) => <AddMeal {...pr} {...props} />} path="/add" />
          <Route render={(pr) => <Home {...pr} {...props} />} exact path="/" />
        </Switch>
      </>
    );
  }
}

App.propTypes = {
  classes: PropTypes.shape({
    header: PropTypes.string,
    title: PropTypes.string,
    backdrop: PropTypes.string,
  }).isRequired,
};

export default withStyles(useStyles)(App);
