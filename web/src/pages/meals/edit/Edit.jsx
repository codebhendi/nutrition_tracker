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

import { node } from '../../../urls';

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

// Component to edit meal obtained from url params
const Edit = ({ user, match }) => {
  // Obtain if from url params
  const { params: { id } } = match;
  // obtain classes to style component
  const classes = useStyles();
  // Variable to show loading status.
  const [loading, setLoading] = useState(false);
  // Variable to store edit meal form variables.
  const [formObject, setFormObject] = useState({ description: '', calories: '', date: '' });
  // Redirect value
  const [redirectString, setRedirect] = useState('');

  // Obtain meal data by making an api call
  const getMealData = useCallback(async () => {
    const options = {
      method: 'get',
      url: `${node}/meals/${id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
    };

    setLoading(true);

    try {
      // store meal data in state.
      const { data: { message: { description, calories, date } } } = await Axios(options);
      // covnerting date to canada date format so that it can show proper date in date type field.
      setFormObject({ description, calories, date: new Date(date).toLocaleDateString('en-ca') });
    } catch (e) {
      console.log(e);
      toast.error('Unable to find meal to edit');
    } finally { setLoading(false); }
  }, [id]);

  // Using effect to call getMealData as soon as component is rendered
  useEffect(() => {
    getMealData();
  }, [getMealData]);

  // handle form input changes to store them in state
  const handleChange = (event) => {
    const { target: { name, value } } = event;

    setFormObject({ ...formObject, [name]: value });
  };

  // Function to handle edit meal form submission and form validity
  const handleSubmit = async () => {
    if (!formObject.description || !formObject.date || !formObject.calories) return;

    const options = {
      method: 'post',
      url: `${node}/meals/${id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
      data: formObject,
    };

    setLoading(true);

    try {
      await Axios(options);
      toast.success('Meal updated');
    } catch (e) {
      console.log(e);
      toast.error('Unable to update meal');
    } finally { setLoading(false); }
  };

  // Function to handle edit meal form submission and form validity
  const handleDelete = async () => {
    const options = {
      method: 'post',
      url: `${node}/meals/delete/${id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
    };

    setLoading(true);

    try {
      await Axios(options);
      toast.success('Meal updated');
      setRedirect('/meals');
    } catch (e) {
      console.log(e);
      toast.error('Unable to update meal');
    } finally { setLoading(false); }
  };

  // Handle enter key press event on form
  const handleKeyPress = (event) => { if (event.key === 'Enter') handleSubmit(); };

  // Check if user is not logged in
  if (!user) return <Redirect to="/login" />;

  if (redirectString) return <Redirect to={redirectString} push />;

  const { description, calories, date } = formObject;

  return (
    <Container maxWidth="md">
      <div>
        <Card>
          <CardContent title="Add Meals">
            <Typography variant="h4" component="h4">
              Add Meal
            </Typography>
          </CardContent>
          <CardContent onKeyPress={handleKeyPress}>
            <TextField
              label="Description"
              margin="normal"
              variant="outlined"
              placeholder="Description"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="description"
              onChange={handleChange}
              value={description}
            />
            <TextField
              label="Calorie Count"
              type="number"
              placeholder="Calorie Count"
              margin="normal"
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="calories"
              onChange={handleChange}
              value={calories}
            />
            <TextField
              label="Date"
              type="date"
              placeholder="Date"
              margin="normal"
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="date"
              onChange={handleChange}
              value={date}
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

Edit.propTypes = {
  user: PropTypes.shape({}),
  match: PropTypes.shape({ params: PropTypes.shape({ id: PropTypes.string }) }).isRequired,
};

Edit.defaultProps = { user: null };

export default Edit;
