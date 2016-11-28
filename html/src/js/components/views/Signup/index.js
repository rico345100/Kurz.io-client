import React from 'react';
import { redirect } from '../../../store';
import connection from '../../../connection';
import dialog from '../../widget/dialog';

export default class ViewSignUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			form: {
				email: '',
				password: '',
				retype: '',
				nickname: ''
			}
		};
	}
	componentDidMount() {
		this.refs.email.focus();
	}
	_goBack() {
		dialog.confirm('Cancel sign up?', function() {
			redirect('/login');
		});
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
	_submit(ev) {
		ev.preventDefault();
		
		if(this.state.form.password !== this.state.form.retype) {
			return dialog.alert('Passwords are not matched.', () => {
				this.refs.password.focus();
			});
		}
		
		const socket = connection.getSocket();
		
		socket.emit('/user/signup', {
			email: this.state.form.email,
			password: this.state.form.password,
			nickname: this.state.form.nickname
		});
		
		socket.once('/user/signup', (data) => {
			if(data.error) {
				return dialog.alert('Failed to signup: ' + data.error.reason, () => {
					if(data.error.field) {
						this.refs[data.error.field].focus();
					}
				});
			}
			
			dialog.alert('Sign up complete!', () => {
				this.setState({
					form: {
						email: '',
						password: '',
						retype: '',
						nickname: ''
					}
				});
				redirect('/login');
			});
		});
	}
	render() {
		return (
			<div className="app-view" id="viewSignUp">
				<form onSubmit={this._submit.bind(this)}>
					<img src="./images/logo.png" />
					<input ref="email" value={this.state.form.email} onChange={this._updateTextbox.bind(this, 'email')} className="ui-textbox ui-round ui-borderless" type="text" placeholder="Email" />
					<input ref="password" value={this.state.form.password} onChange={this._updateTextbox.bind(this, 'password')} className="ui-textbox ui-round ui-borderless" type="password" placeholder="Password" />
					<input ref="retype" value={this.state.form.retype} onChange={this._updateTextbox.bind(this, 'retype')} className="ui-textbox ui-round ui-borderless" type="password" placeholder="Retype" />
					<input ref="nickname" value={this.state.form.nickname} onChange={this._updateTextbox.bind(this, 'nickname')} className="ui-textbox ui-round ui-borderless" type="text" placeholder="Nickname" />
					
					<div>
						<input type="submit" className="ui-button ui-round ui-borderless ui-theme-blue" value="Sign In" />
						<img onClick={this._goBack.bind(this)} src="./images/button_w_left.png" />
					</div>
				</form>
			</div>
		);
	}
}