const defaultState = {
	user: undefined
};

export default (state = defaultState, action) => {
	switch(action.type) {
		case 'UPDATE_USER':
			return Object.assign({}, state, {
				user: action.data
			});
		default:
			return state;
	}
};