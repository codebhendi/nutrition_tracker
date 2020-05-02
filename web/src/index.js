import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import App from './App';

// Using browserRouter to keep the URLs simple and not with #
// This component will keep track of our URLs.
// Whenever URL changes the changes will reflect in the app
// component
const router = (
  // eslint-disable-next-line react/jsx-filename-extension
  <Router>
    <Route component={App} />
  </Router>
);

ReactDOM.render(
  router,
  document.getElementById('root'),
);
