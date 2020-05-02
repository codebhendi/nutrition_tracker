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
import LinearProgress from '@material-ui/core/LinearProgress';

import { node } from '../../../urls';

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
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const AllMeals = ({ user }) => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMeals = useCallback(async () => {
    if (!user) return;

    const options = {
      method: 'get',
      url: `${node}/admin/meals`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
    };

    setLoading(true);

    try {
      const { data: { message } } = await Axios(options);

      setMeals(message);
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

  if (!user || !user.admin) return <Redirect to="/login" />;

  return (
    <>
      {loading && <LinearProgress />}
      <Container maxWidth="md" className={classes.root}>
        <Paper className={classes.paper}>
          <Toolbar>
            <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
              Nutrition
            </Typography>
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
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell padding="checkbox">
                        <Link to={`/admin/meals/edit/${row.id}`}>Edit</Link>
                      </TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        {row.description}
                      </TableCell>
                      <TableCell>{row.calories}</TableCell>
                      <TableCell>{new Date(row.date).toLocaleDateString('en-in')}</TableCell>
                    </TableRow>
                  ))}
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
    </>
  );
};

AllMeals.propTypes = { user: PropTypes.shape({ admin: PropTypes.bool }) };

AllMeals.defaultProps = { user: null };

export default AllMeals;
