import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createMemoryHistory } from 'react-router';
import { syncHistoryWithStore, routerMiddleware, routerReducer, push } from 'react-router-redux';
import AppReducer from './reducers/app';
import UserReducer from './reducers/user';
import ChannelReducer from './reducers/channel';
import AddressBookReducer from './reducers/addressbook';

const middleware = routerMiddleware(memoryHistory);
export const store = createStore(combineReducers({
	AppReducer,
	UserReducer,
	ChannelReducer,
	AddressBookReducer,
	routing: routerReducer
}), applyMiddleware(middleware));

const memoryHistory = createMemoryHistory(location);
export const history = syncHistoryWithStore(memoryHistory, store);
export function redirect(path) {
	history.push(path);
};