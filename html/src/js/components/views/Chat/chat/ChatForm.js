import React from 'react';
import dialog from '../../../widget/dialog';

export default class ChatForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			form: {
				uploading: false,
				message: ''
			}
		}
	}
	componentDidUpdate() {
		this.refs.message.focus();
	}
	_updateTextbox(type, ev) {
		var oldState = this.state;
		var newFormState = Object.assign({}, this.state.form, {
			[type]: ev.target.value
		});

		this.setState(Object.assign({}, this.state, {
			form: newFormState
		}));
	}
	_handleKey(ev) {
		if(ev.keyCode === 13 && this.state.form.message !== '') {
			ev.preventDefault();

			this.props.onSendMessage(this.state.form.message);
			this.setState({
				form: {
					message: ''
				}
			});
		}
	}
	render() {
		return (
			<div id="chat-room-form">
				<input ref="message" value={this.state.form.message} onChange={this._updateTextbox.bind(this, 'message')} onKeyDown={this._handleKey.bind(this)} type="text" />
			</div>
		);
	}
}