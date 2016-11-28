import { store } from '../store';

export function updateAddressBook(data) {
	store.dispatch({
		type: 'UPDATE_ADDRESSBOOK',
		data
	});
}