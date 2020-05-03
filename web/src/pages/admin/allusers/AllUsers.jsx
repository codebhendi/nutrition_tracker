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
  green: { backgroundColor: '#29f1c3' },
  red: { backgroundColor: '#d24d57' },
}));

// Component to obtain and show all users
const AllUsers = ({ user }) => {
  // Classes for styling component
  const classes = useStyles();
  // Pagination variables which decide what page to show and how many rows to display.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // Variable to store users and page loading status.
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to obtain users. In this we make an api request using
  // stored token.
  const getUsers = useCallback(async () => {
    if (!user) return;

    const options = {
      method: 'get',
      url: `${node}/admin/users`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.authToken}`,
      },
    };

    setLoading(true);

    try {
      const { data: { message } } = await Axios(options);

      setUsers(message);
    } catch (e) {
      console.log(e);
    } finally { setLoading(false); }
  }, [user]);

  // Use effect to be used so that we can call getUsers as soon as this
  // component is rendered.
  useEffect(() => { getUsers(); }, [getUsers]);

  // Function to handle change in pages.
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle change in number of rows per page.
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Check if the user is not an admin.
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
                  <TableCell>Username</TableCell>
                  <TableCell>Calories Per Day</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell padding="checkbox">
                        <Link to={`/admin/users/edit/${row.id}`}>Edit</Link>
                      </TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        {row.username}
                      </TableCell>
                      <TableCell>{row.calorie_per_day}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
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

AllUsers.propTypes = { user: PropTypes.shape({ admin: PropTypes.bool }) };

AllUsers.defaultProps = { user: null };

export default AllUsers;
