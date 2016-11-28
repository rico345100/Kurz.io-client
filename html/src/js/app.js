import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { Router, Route, IndexRoute } from 'react-router';
import { routerReducer, push } from 'react-router-redux';
import { store, history } from './store';

import App from './components/views/App';
import ViewStartup from './components/views/Startup';
import ViewLogin from './components/views/Login';
import ViewSignUp from './components/views/Signup';
import ViewChat from './components/views/Chat';

ReactDOM.render(
	<Provider store={store}>
		<Router history={history}>
			<Route path="/" component={App}>
				<IndexRoute component={ViewStartup} />
				<Route path="/login" component={ViewLogin} />
				<Route path="/signup" component={ViewSignUp} />
				<Route path="/chat" component={ViewChat} />
			</Route>
		</Router>
	</Provider>,
	document.getElementById('kurz-io')
);