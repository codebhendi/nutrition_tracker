import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
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

import { node } from '../../../../urls';

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

// Component to edit user
const AdminUsersEdit = ({ user, match }) => {
  // Obtain meal id from url params
  const { params: { id } } = match;
  // Classes to style this component
  const classes = useStyles();
  // Variable storing loading state.
  const [loading, setLoading] = useState(false);
  // Variable storing data to be updated in user form
  const [formObject, setFormObject] = useState({ username: '', caloriePerDay: '' });
  // Redirection string
  const [redirectString, setRedirectString] = useState('');

  // Function to obtain user data using obtained id
  const getUserData = useCallback(async () => {
    const options = {
      method: 'get',
      url: `${node}/admin/users/${id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
    };

    setLoading(true);

    try {
      const { data: { message: { username: u, calorie_per_day: cpd } } } = await Axios(options);
      // covnerting date to canada date format so that it can show proper date in date type field.
      setFormObject({ username: u, caloriePerDay: cpd });
    } catch (e) {
      console.log(e);
      toast.error('Unable to find user to edit');
    } finally { setLoading(false); }
  }, [id]);

  // Using use effect to call getMealData as soon as component is rendered.
  useEffect(() => {
    getUserData();
  }, [getUserData]);

  // Function to handle change in user form.
  const handleChange = (event) => {
    event.preventDefault();

    // Obtain name and value from event target
    const { name, value } = event.target;

    // Use spread operator to store previous value and update newly obtained field value.
    setFormObject({ ...formObject, [name]: value });
  };

  // Function to check if all form parameters are in correct domain
  const checkForm = () => {
    try {
      if (!formObject.username.trim()) {
        toast.error('No username, please enter an username');
        return true;
      }

      const value = parseFloat(formObject.caloriePerDay);

      if (!value || Number.isNaN(value) || value < 100) {
        toast.error('Invalid calorie per day, should be greater than 100');
        return true;
      }

      return false;
    } catch (e) {
      console.log(e);
      return true;
    }
  };

  // Function to handle deletion of user.
  const handleDelete = async () => {
    const options = {
      method: 'post',
      url: `${node}/admin/users/delete/${id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
    };

    setLoading(true);

    try {
      await Axios(options);
      toast.success('User updated');
      setRedirectString('/admin/users');
    } catch (e) {
      console.log(e);
      toast.error('Unable to update user');
    } finally { setLoading(false); }
  };

  // Function to handle submission of user updation form.
  const handleSubmit = async () => {
    if (checkForm()) return;

    const options = {
      method: 'post',
      url: `${node}/admin/users/${id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
      data: formObject,
    };

    setLoading(true);

    try {
      await Axios(options);
      toast.success('User updated');
    } catch (e) {
      console.log(e);
      toast.error('Unable to update user');
    } finally { setLoading(false); }
  };

  // Function to handle enter key press on the form to submit it then.
  const handleKeyPress = (event) => { if (event.key === 'Enter') handleSubmit(); };

  // Check if admin.
  if (!user || !user.admin) return <Redirect to="/login" />;

  if (redirectString) return <Redirect to={redirectString} push />;

  const { username, caloriePerDay } = formObject;

  return (
    <Container maxWidth="md">
      <div>
        <Card>
          <CardContent title="Edit User">
            <Typography variant="h4" component="h4">
              Edit User
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
              value={username}
            />
            <TextField
              label="Calorie Per Day"
              type="number"
              placeholder="Calorie Per Day"
              margin="normal"
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="caloriePerDay"
              onChange={handleChange}
              value={caloriePerDay}
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
            <div style={{ display: 'flex' }}>
              <div className={classes.wrapper}>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={loading}
                  onClick={handleDelete}
                  style={{ width: '100%' }}
                  size="large"
                >
                  DELETE
                </Button>
                {loading && (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="bottom-right" hideProgressBar />
    </Container>
  );
};

AdminUsersEdit.propTypes = {
  user: PropTypes.shape({ admin: PropTypes.bool }),
  match: PropTypes.shape({ params: PropTypes.shape({ id: PropTypes.string }) }).isRequired,
};

AdminUsersEdit.defaultProps = { user: null };

export default AdminUsersEdit;
