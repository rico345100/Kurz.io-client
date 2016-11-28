import React from 'react';
import { ipcRenderer } from 'electron';
import { redirect } from '../../../store';
import connection from '../../../connection';
import dialog from '../../widget/dialog';
import { updateUser } from '../../../actions/user';

export default class ViewLogin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			form: {
				email: '',
				password: ''
			}
		};
	}
	componentDidMount() {
		// load last logged in email
		ipcRenderer.send('load', {
			name: 'app'
		});
		ipcRenderer.once('load', (ev, arg) => {
			this.setState({
				form: {
					email: arg.lastAccessEmail
				}
			});
		});
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
	_signUp(ev) {
		ev.preventDefault();
		redirect('/signup');
	}
	_signIn(ev) {
		ev.preventDefault();
		
		const socket = connection.getSocket();

		socket.emit('/user/signin', {
			email: this.state.form.email,
			password: this.state.form.password
		});
		
		socket.once('/user/signin', (data) => {
			if(data.error) {
				return dialog.alert(data.error.reason || data.error.message || data.error, () => {
					if(data.error.field) {
						this.refs[data.error.field].focus();
					}
				});
			}

			ipcRenderer.send('save', {
				name: 'app',
				key: 'lastAccessEmail',
				value: this.state.form.email
			});

			this._getUserInfo(this.state.form.email);
		});
	}
	_getUserInfo(email) {
		const socket = connection.getSocket();
		
		socket.emit('/user/get', {
			email
		});
		
		socket.once('/user/get', (data) => {
			if(data.error) {
				return dialog.alert(data.error.reason || data.error.message || data.error);
			}
			
			updateUser(data);
			redirect('/chat');
		});
	}
	render() {
		return (
			<div className="app-view" id="viewLogin">
				<form onSubmit={this._signIn.bind(this)}>
					<img src="./images/logo.png" />
					<input ref="email" value={this.state.form.email} onChange={this._updateTextbox.bind(this, 'email')} className="ui-textbox ui-round ui-borderless" type="text" placeholder="Email" />
					<input ref="password" value={this.state.form.password} onChange={this._updateTextbox.bind(this, 'password')} className="ui-textbox ui-round ui-borderless" type="password" placeholder="Password" />
					
					<div>
						<input type="submit" className="right ui-button ui-round ui-borderless ui-theme-blue" value="Login" />
						<input type="button" onClick={this._signUp.bind(this)} className="left ui-button ui-round ui-borderless ui-theme-green" value="Sign Up!" />
					</div>
				</form>
			</div>
		);
	}
}