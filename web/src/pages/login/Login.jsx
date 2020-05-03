import React, { useState } from 'react';
import Axios from 'axios';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import green from '@material-ui/core/colors/green';
import makeStyles from '@material-ui/styles/makeStyles';
import { Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';

import { node } from '../../urls';

const useStyles = makeStyles(() => ({
  loader: {
    display: 'flex',
    width: '100%',
    height: '90vh',
    position: 'absolute',
    zIndex: 1300,
    background: 'white',
    opacity: 0.5,
  },
  wrapper: {
    margin: '1rem',
    position: 'relative',
    width: '100%',
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

// Component to log user in
// Props:
// user: User object
// updateUse: Function to update user in the root component.
const Login = ({ user, updateUser }) => {
  // Classes for styling
  const classes = useStyles();
  // Variable to show loading status
  const [loading, setLoading] = useState(false);
  // Variable to store login form information
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  // handle login form input changes to store them in state
  const handleChange = (event) => {
    const { target: { name, value } } = event;

    setCredentials({ ...credentials, [name]: value });
  };

  // Function to submit login information to api to log user in.
  const login = async () => {
    const { username, password } = credentials;

    // Check validity
    if (!username || !password) {
      toast.error('Invalid email or password.');
    }

    const options = {
      method: 'post',
      url: `${node}/auth/login`,
      data: { username: username.trim(), password },
    };

    setLoading(true);

    try {
      // obtain token and user.
      const { data: { token, user: newUser } } = await Axios(options);
      // Store token to local storage
      window.localStorage.setItem('authToken', token);

      toast.success('User logged in. Please wait redirecting');
      // Store user in root component
      updateUser(newUser);
    } catch (e) {
      console.log('login error', e);
      toast.error('Wrong email or password. Please check and retry');
    } finally { setLoading(false); }
  };

  // Function to submit login form so that the user can be authenticated
  const handleSubmit = () => {
    if (loading) return;

    login(credentials);
  };

  // Function to handle enter key press on login form to submit the form.
  const handleKeyPress = (event) => { if (event.key === 'Enter') handleSubmit(); };

  // Check if user is already logged in
  if (user) return <Redirect to="/" />;

  const { username, password } = credentials;

  return (
    <Container maxWidth="sm">
      <div className="login-container">
        <Card className="form-card">
          <div className="photo-cover">
            <CardContent
              title="Login"
              className="form-heading"
            >
              <Typography variant="h4" component="h2" className="white-bold">
                Login
              </Typography>
            </CardContent>
          </div>
          <CardContent onKeyPress={handleKeyPress}>
            <br />
            <TextField
              label="Username"
              margin="normal"
              variant="outlined"
              placeholder="Username"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="username"
              onChange={handleChange}
              value={username}
            />
            <TextField
              label="Password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              margin="normal"
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="password"
              onChange={handleChange}
              value={password}
            />
            <div style={{ display: 'flex' }}>
              <div className={classes.wrapper}>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={loading}
                  onClick={handleSubmit}
                  style={{ width: '100%' }}
                  size="large"
                >
                  SUBMIT
                </Button>
                {loading && (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                )}
              </div>
            </div>
          </CardContent>
          <CardContent>
            <Link to="/signup">Create Account</Link>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="bottom-right" hideProgressBar />
    </Container>
  );
};

Login.propTypes = {
  user: PropTypes.shape({}),
  updateUser: PropTypes.func.isRequired,
};

Login.defaultProps = { user: null };

export default Login;
