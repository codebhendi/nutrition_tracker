import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';
import { Redirect, Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import green from '@material-ui/core/colors/green';
import makeStyles from '@material-ui/styles/makeStyles';
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

const Profile = ({ user }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [formObject, setFormObject] = useState({
    username: user.username, caloriePerDay: user.calorie_per_day,
  });

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;

    setFormObject({ ...formObject, [name]: value });
  };

  const validate = () => {
    try {
      if (!formObject.username) {
        toast.error('No username specified');
        return true;
      }

      const value = parseFloat(formObject.caloriePerDay);

      if (value < 100 || Number.isNaN(value)) {
        toast.error('Calories Per Day must be greater than 100');
        return true;
      }
    } catch (e) {
      console.log(e);
      return true;
    }

    return false;
  };

  const handleSubmit = async () => {
    if (validate()) return;

    const options = {
      method: 'post',
      url: `${node}/profile`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
      data: formObject,
    };

    setLoading(true);

    try {
      await Axios(options);
      toast.success('Updated profile');
    } catch (e) {
      console.log(e);
      toast.error('Unable to update profile');
    } finally { setLoading(false); }
  };

  if (!user) return <Redirect to="/login" />;

  const { username, caloriePerDay } = formObject;

  const handleKeyPress = (event) => { if (event.key === 'Enter') handleSubmit(); };

  return (
    <Container maxWidth="md">
      <div>
        <Card>
          <CardContent title="Add Meals">
            <Typography variant="h4" component="h4">
              Profile
            </Typography>
          </CardContent>
          <CardContent onKeyPress={handleKeyPress}>
            <TextField
              label="Username"
              margin="normal"
              variant="outlined"
              placeholder="Username"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="username"
              onChange={handleChange}
              value={username || user.username}
            />
            <TextField
              label="Calories Per Day"
              type="number"
              placeholder="Calories Per Day"
              margin="normal"
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="caloriePerDay"
              onChange={handleChange}
              value={caloriePerDay || user.calorie_per_day}
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
            <Link to="/profile/resetpassword">Reset Password</Link>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="bottom-right" hideProgressBar />
    </Container>
  );
};

Profile.propTypes = {
  user: PropTypes.shape({
    calorie_per_day: PropTypes.number,
    username: PropTypes.string,
  }),
};

Profile.defaultProps = { user: null };

export default Profile;
