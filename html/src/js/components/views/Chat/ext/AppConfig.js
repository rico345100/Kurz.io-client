import React from 'react';
import SocketIOFileClient from 'socket.io-file-client';
import dialog from '../../../widget/dialog';
import { updateUser } from '../../../../actions/user';
import connection from '../../../../connection';
import { getImageSrc } from '../../../../utility';

let socketIOFileClient = null;

export default class AppConfig extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			uploading: false
		};
	}
	componentDidMount() {
		const socket = connection.getSocket();
		socketIOFileClient = new SocketIOFileClient(socket);

		socketIOFileClient.on('complete', (data) => {
			// unset file
			this.refs.photo.value = null;

			this.setState({ uploading: false });

			// check update user's profile. after upload, server automatically update file name and emit the event
			socket.once('/user/update/image', (data) => {
				if(data.error) {
					return dialog.alert(data.error.reason || data.error.message || data.error || data);
				}

				this._loadUserData();
			});
		});
		socketIOFileClient.on('abort', (data) => {
			this.setState({ uploading: false });
		});
		socketIOFileClient.on('error', (data) => {
			dialog.alert(data.message);
			this.setState({ uploading: false });
		});
	}
	componentWillUnmount() {
		socketIOFileClient.destroy();
	}
	_loadUserData() {
		const socket = connection.getSocket();

		// retain new user info
		socket.emit('/user/get', {
			email: this.props.user.email
		});
		
		socket.once('/user/get', (data) => {
			if(data.error) {
				return dialog.alert(data.error.reason || data.error.message || data.error);
			}
			
			updateUser(data);
		});
	}
	_updateProfile(ev) {
		ev.preventDefault();

		function error(message, control) {
			dialog.alert(message, () => {
				if(control && control.focus) control.focus();
			});
		}

		const refs = this.refs;
		let nickname = refs.nickname;
		let newPassword = refs.newPassword;
		let newPasswordConfirm = refs.newPasswordConfirm;

		if(!nickname.value) {
			return error('Type nickname.', nickname);
		}
		else if(newPassword.value && !newPasswordConfirm.value) {
			return error('Retype new password.', newPasswordConfirm);
		}
		else if(newPasswordConfirm.value && !newPassword.value) {
			return error('Type password.', newPassword);
		}
		else if(newPassword.value !== newPasswordConfirm.value) {
			return error('Password not matched.', newPassword);
		}

		// if nickname is same as current and no password typed, no update
		if(nickname.value === this.props.user.nickname && !newPassword.value) return;

		dialog.prompt('Please type your current password.', (password) => {
			if(!password) {
				return error('You must type your password.');
			}

			const sendingData = {
				email: this.props.user.email,
				password: password,
				newPassword: newPassword.value
			};

			if(this.props.user.nickname !== nickname.value) {
				sendingData.nickname = nickname.value;
			}


			const socket = connection.getSocket();

			socket.emit('/user/update', sendingData);

			socket.once('/user/update', (data) => {
				if(data.error) {
					return dialog.alert(data.error.reason || data.error.message || data.error);
				}

				newPassword.value = '';
				newPasswordConfirm.value = '';

				dialog.alert('Updated!');

				this._loadUserData();
			});
		}, null, {
			type: 'password'
		});
	}
	_uploadProfile(ev) {
		if(!this.state.uploading) {
			var file = ev.target.files[0];
			
			if(file) {
				this.setState({ uploading: true });

				socketIOFileClient.upload(file, {
					types: ['image/png', 'image/jpeg', 'image/pjpeg'],
					to: 'profile'
				});
			}
		}
	}
	_replaceImage(which) {
		this.refs[which].src = getImageSrc('noimage');
	}
	render() {
		const user = this.props.user;
		//console.log('<AppConfig />::render()');

		return (
			<form id="app-config" onSubmit={this._updateProfile.bind(this)}>
				<h1>Profile and settings</h1>

				<div className="ui-photo-group">
					<img ref="profile" src={getImageSrc(user.image)} onError={this._replaceImage.bind(this, "profile")} />
					<label className="ui-button ui-round ui-borderless ui-theme-green">
						Upload new photo
						<input ref="photo" type="file" style={{display:'none'}} onChange={this._uploadProfile.bind(this)} />
					</label>
				</div>

				<div className="ui-control-group">
					<label className="ui-label">Email</label>
					<div className="ui-textbox ui-round ui-disabled">{user.email}</div>
				</div>
				<div className="ui-control-group">
					<label className="ui-label">Nickname</label>
					<input ref="nickname" type="text" className="ui-textbox ui-round ui-borderless" defaultValue={user.nickname} />
				</div>
				<div className="ui-control-group">
					<label className="ui-label">New Password</label>
					<input ref="newPassword" type="password" className="ui-textbox ui-round ui-borderless" />
				</div>
				<div className="ui-control-group">
					<label className="ui-label">Retype</label>
					<input ref="newPasswordConfirm" type="password" className="ui-textbox ui-round ui-borderless" />
				</div>
				
				<div className="button-container ui-right">
					<input type="submit" className="ui-button ui-round ui-borderless ui-theme-blue" value="Update" />
				</div>
			</form>
		);
	}
}