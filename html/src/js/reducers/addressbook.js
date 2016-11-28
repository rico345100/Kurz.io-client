const defaultState = {
	list: []
};

export default (state = defaultState, action) => {
	switch(action.type) {
		case 'UPDATE_ADDRESSBOOK':
			return Object.assign({}, state, {
				list: action.data
			});
		default:
			return state;
	}
};