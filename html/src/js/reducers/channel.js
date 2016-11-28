const defaultState = {
	channels: [],
	messages: [],
	activeChannel: false
};

export default (state = defaultState, action) => {
	switch(action.type) {
		case 'UPDATE_CHANNEL_LIST':
			return Object.assign({}, state, {
				channels: action.data
			});
		case 'UPDATE_ACTIVE_CHANNEL':
			return Object.assign({}, state, {
				activeChannel: action.data
			});
		case 'UPDATE_MESSAGES':
			return Object.assign({}, state, {
				messages: action.data
			});
		case 'INSERT_MESSAGE':
			const oldMessages = state.messages;
			const message = action.data;
			const newMessages = oldMessages.slice(0);
			newMessages.push(message);

			return Object.assign({}, state, {
				messages: newMessages
			});
		default:
			return state;
	}
};