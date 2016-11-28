import { store } from '../store';

export function updateChannelList(data) {
	store.dispatch({
		type: 'UPDATE_CHANNEL_LIST',
		data
	});
}

export function updateActiveChannel(data) {
	store.dispatch({
		type: 'UPDATE_ACTIVE_CHANNEL',
		data
	});
}

export function updateMessages(data) {
	store.dispatch({
		type: 'UPDATE_MESSAGES',
		data
	});
}

export function insertMessage(data) {
	store.dispatch({
		type: 'INSERT_MESSAGE',
		data
	});
}