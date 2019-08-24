import 'bootstrap/dist/css/bootstrap.css';

import 'bootstrap/dist/css/bootstrap-theme.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <App providerUrl={localStorage.getItem('saved-provider') || "http://localhost:4535"} />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
