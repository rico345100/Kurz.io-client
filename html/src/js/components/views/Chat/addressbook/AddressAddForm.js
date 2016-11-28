import React from 'react';
import dialog from '../../../widget/dialog';
import connection from '../../../../connection';

export default class AddressAddForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			form: {
				email: ''
			}
		};
	}
	componentDidMount() {
		this.refs.email.focus();
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
	_close(ev) {
		ev.preventDefault();
		this.props.onCloseAddForm();
	}
	_add(ev) {
		ev.preventDefault();
		
		const socket = connection.getSocket();
		
		socket.emit('/addressbook/create', {
			email: this.props.email,
			target: this.state.form.email
		});
		
		socket.once('/addressbook/create', (data) => {
			if(data.error) {
				return dialog.alert(data.error.reason || data.error.message || data.error || data);
			}
			
			this.props.onAddAddress();
			this.props.onCloseAddForm();
		});	
	}
	render() {
		return (
			<form id="addressBook-addForm" onSubmit={this._add.bind(this)}>
				<h1>Add Friend</h1>
				<input ref="email" type="text" placeholder="Email..." value={this.state.form.email} onChange={this._updateTextbox.bind(this, 'email')} />
				
				<div className="button-container">
					<input type="button" value="Cancel" className="ui-button ui-borderless ui-round ui-theme-red" onClick={this._close.bind(this)} />
					<input type="submit" value="Add" className="ui-button ui-borderless ui-round ui-theme-blue" />
				</div>
			</form>
		);
	}
}