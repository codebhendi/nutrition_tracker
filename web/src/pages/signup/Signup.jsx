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
import { toast, ToastContainer } from 'react-toastify';

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

// Component to signup new users.
// Props:
// user: user object.
// updateUser: Function to update user in root component.
const Signup = ({ user, updateUser }) => {
  // Classe to style component
  const classes = useStyles();
  // Variable to show loading status.
  const [loading, setLoading] = useState(false);
  // Form varialbe to store signup form data.
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  // handle login form input changes to store them in state
  const handleChange = (event) => {
    const { target: { name, value } } = event;

    setCredentials({ ...credentials, [name]: value });
  };

  // Function to submit form data to create new user.
  const signUp = async () => {
    const { username, password } = credentials;

    if (!username || !password) {
      toast.error('Invalid username or password.');
    }

    setLoading(true);

    const options = {
      method: 'post',
      url: `${node}/auth/signup`,
      data: { username: username.trim(), password },
    };

    try {
      // obtain token and user data.
      const { data: { token, user: newUser } } = await Axios(options);

      // Store token in local storage
      window.localStorage.setItem('authToken', token);
      toast.success('User Signed up');
      // Store use in root component.
      updateUser(newUser);
    } catch (e) {
      console.log('login error', e);
      toast.error('Wrong email or password. Please check and retry');
    } finally { setLoading(false); }
  };

  // Function to submit signup form so that the user can be authenticated
  const handleSubmit = () => {
    if (loading) return;
    signUp();
  };

  // Function to handle pressing enter button on signup form.
  const handleKeyPress = (event) => { if (event.key === 'Enter') handleSubmit(); };

  // Check if user is logged in.
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
                Signup
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
            <Link to="/login">Login</Link>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="bottom-right" hideProgressBar />
    </Container>
  );
};

Signup.propTypes = {
  classes: PropTypes.shape({
    loader: PropTypes.string,
    wrapper: PropTypes.string,
    buttonProgress: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({}),
  updateUser: PropTypes.func.isRequired,
};

Signup.defaultProps = { user: null };

export default Signup;
