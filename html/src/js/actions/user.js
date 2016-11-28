import { store } from '../store';

export function updateUser(data) {
	store.dispatch({
		type: 'UPDATE_USER',
		data
	});
}