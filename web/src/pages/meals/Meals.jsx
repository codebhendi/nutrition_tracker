import React, { useState, useEffect, useCallback } from 'react';
import { Redirect, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Axios from 'axios';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import { toast, ToastContainer } from 'react-toastify';

import { node } from '../../urls';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    minHeight: '50vh',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  tc: { minHeight: '60vh' },
  green: { backgroundColor: '#29f1c3' },
  red: { backgroundColor: '#d24d57' },
  toolbar: { '& > *': { margin: '1rem' } },
}));

const Meals = ({ user }) => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [meals, setMeals] = useState([]);
  const [consumption, setConsumption] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [filterFlag, setFilter] = useState(false);

  const getMeals = useCallback(async () => {
    if (!user) return;

    const options = {
      method: 'get',
      url: `${node}/meals`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
    };

    setLoading(true);

    try {
      const { data: { message: { meals: m, consumption: c } } } = await Axios(options);

      setMeals(m);
      setConsumption(c);
    } catch (e) {
      console.log(e);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { getMeals(); }, [getMeals]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const compareDates = (date) => {
    try {
      const { startDate: sd, endDate: ed } = dates;
      const startDate = new Date(sd).getTime();
      const endDate = new Date(ed).getTime();
      const filterDate = new Date(new Date(date).toLocaleDateString('en-ca')).getTime();

      if (filterDate >= startDate && filterDate <= endDate) return false;

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const processMeals = (testDates) => {
    const { startDate, endDate } = testDates;

    if (!startDate || !endDate) {
      setFilter(false);
    } else {
      setFilter(true);
    }
  };

  const handleChange = (event) => {
    event.preventDefault();

    const { startDate, endDate } = dates;
    const { name, value } = event.target;
    const testDates = { ...dates, [name]: value };

    try {
      if (value && name === 'startDate' && endDate) {
        const ed = new Date(endDate).getTime();
        const sd = new Date(value).getTime();

        if (sd > ed) {
          toast.error('Start date must be less than start date');
          return;
        }
      } else if (value && name === 'endDate' && startDate) {
        const ed = new Date(value).getTime();
        const sd = new Date(startDate).getTime();

        if (ed < sd) {
          toast.error('End date must be greater than start date');
          return;
        }
      }
    } catch (e) {
      console.log(e);
    }

    setDates({ ...dates, [name]: value });

    processMeals(testDates);
  };

  if (!user) return <Redirect to="/login" />;

  const { startDate, endDate } = dates;

  return (
    <>
      {loading && <LinearProgress />}
      <Container maxWidth="md" className={classes.root}>
        <Paper className={classes.paper}>
          <Toolbar className={classes.toolbar}>
            <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
              Nutrition
            </Typography>
            <TextField
              label="Start Date"
              type="date"
              placeholder="Start Date"
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              name="startDate"
              onChange={handleChange}
              value={startDate}
            />
            <TextField
              label="End Date"
              type="date"
              placeholder="End Date"
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              name="endDate"
              onChange={handleChange}
              value={endDate}
            />
          </Toolbar>
          <TableContainer className={classes.tc}>
            <Table
              className={classes.table}
              aria-labelledby="tableTitle"
              size="medium"
              aria-label="enhanced table"
            >
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Meal</TableCell>
                  <TableCell>Calories</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    if (filterFlag && compareDates(row.date)) return null;
                    const dateConsumption = consumption.find((d) => d.date === row.date) || {};
                    const above = dateConsumption.sum > user.calorie_per_day;

                    return (
                      <TableRow key={row.id} className={above ? classes.red : classes.green}>
                        <TableCell padding="checkbox">
                          <Link to={`/meals/edit/${row.id}`}>Edit</Link>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          {row.description}
                        </TableCell>
                        <TableCell>{row.calories}</TableCell>
                        <TableCell>{new Date(row.date).toLocaleDateString('en-in')}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={meals.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>
      <ToastContainer position="bottom-right" hideProgressBar />
    </>
  );
};

Meals.propTypes = { user: PropTypes.shape({ calorie_per_day: PropTypes.number }) };

Meals.defaultProps = { user: null };

export default Meals;
