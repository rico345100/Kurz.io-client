import React from 'react';
import SocketIOFileClient from 'socket.io-file-client';
import moment from 'moment';
import dialog from '../../../widget/dialog';
import connection from '../../../../connection';
import InviteWidget from '../ext/InviteWidget';
import { getChannelImageSrc, getImageSrc } from '../../../../utility';

let socketIOFileClient = null;

export default class ChatRoomConfig extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			uploading: false,
			openInviteWidget: false
		};
	}
	componentDidMount() {
		const socket = connection.getSocket();
		socketIOFileClient = new SocketIOFileClient(socket);

		socketIOFileClient.on('complete', (data) => {
			// unset file
			this.refs.photo.value = null;
			this.setState({ uploading: false });

			socket.once('/channel/rename/image', (data) => {
				if(data.error) {
					return dialog.alert(data.error.reason || data.error.message || data.error);
				}

				// update channel info
				socket.emit('/channel/update/image', {
					channelID: this.props.activeChannel._id,
					email: this.props.email,
					image: data.newName
				});
				socket.once('/channel/update/image', (data) => {
					if(data.error) {
						return dialog.alert(data.error.reason || data.error.message || data.error);
					}
					
					this.props.onChannelUpdated();
				});
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
	_openInviteWidget() {
		this.setState({
			openInviteWidget: true
		});
	}
	_closeInviteWidget() {
		this.setState({
			openInviteWidget: false
		});
	}
	_inviteUser(email) {
		const socket = connection.getSocket();

		socket.emit('/channel/invite', {
			channelID: this.props.activeChannel._id,
			inviter: this.props.email,
			invitee: email 
		});

		socket.once('/channel/invite', (data) => {
			if(data.error) {
				return dialog.alert(data.error.message || data.error.reason || data.error);
			}

			this._closeInviteWidget();

			// refresh addressbook and close
			this.props.onUserInvited();
		});
	}
	_updateChannelName() {
		dialog.prompt('New channel name(20 char max):', (newName) => {
			const socket = connection.getSocket();

			socket.emit('/channel/update/name', {
				channelID: this.props.activeChannel._id,
				email: this.props.email,
				name: newName
			});

			socket.once('/channel/update/name', (data) => {
				if(data.error) {
					return dialog.alert(data.error.message || data.error.reason || data.error);
				}

				this.props.onChannelUpdated();
			});
		}, null, {
			value: this.props.activeChannel.name,
			maxLength: 20
		});
	}
	_uploadChannelImage(ev) {
		if(!this.state.uploading) {
			var file = ev.target.files[0];
			
			if(file) {
				this.setState({ uploading: true });

				socketIOFileClient.upload(file, {
					types: ['image/png', 'image/jpeg', 'image/pjpeg'],
					to: 'channelImage',
					data: {
						channelID: this.props.activeChannel._id,
						currentImage: this.props.activeChannel.image
					}
				});
			}
		}
	}
	_leaveChannel() {
		dialog.confirm('Leave the channel?', () => {
			const socket = connection.getSocket();

			socket.emit('/channel/leave', {
				channelID: this.props.activeChannel._id,
				email: this.props.email
			});

			socket.once('/channel/leave', (data) => {
				if(data.error) {
					return dialog.alert(data.error.message || data.error.reason || data.error);
				}

				this.props.onChannelLeave();
			});
		});
	}
	_setNotification(set) {
		const socket = connection.getSocket();

		socket.emit('/user/update/notification', {
			email: this.props.email,
			channelID: this.props.activeChannel._id,
			set
		});

		socket.once('/user/update/notification', (data) => {
			if(data.error) {
				return dialog.alert(data.error.message || data.error.reason || data.error);
			}

			this.props.onNotificationUpdate();
		});
	}
	_replaceImage(which) {
		this.refs[which].src = getImageSrc('noimage');
	}
	render () {
		//console.log('<ChatRoomConfig />::props', this.props);
		//console.log('<ChatRoomConfig />::render()');

		const activeChannel = this.props.activeChannel;
		
		let opponent  = activeChannel.target === this.props.email ? activeChannel.target : activeChannel.creator; 
		let channelName = activeChannel.multichat ? activeChannel.name : opponent.nickname;
		let lastMessage = moment(activeChannel.lastMessage.sentAt).format('llll');
		let isNotiEnabled = (function() {
			var notiList = this.props.noNotification || [];
			var found = false;

			for(var i = 0; i < notiList.length; i++) {
				if(notiList[i] === this.props.activeChannel._id) {
					found = true;
					break;
				}
			}

			return !found;
		}).bind(this)();

		return (
			<div id="chat-config">
				<div id="chat-config-box" ref="box">
					<div id="channel-info">
						<div id="channel-info-name">
							<h1>{channelName}</h1>
							{ activeChannel.multichat ? (<a href="#" onClick={this._updateChannelName.bind(this)}>Edit</a>) : '' }
						</div>
						
						<p>Last message at {lastMessage}</p>
					</div>

					<h1>Tasks</h1>
					<a href="#" onClick={this._openInviteWidget.bind(this)}>Invite</a>
					<a href="#" onClick={this._leaveChannel.bind(this)}>Leave the channel</a>
					{
						activeChannel.multichat ? (
							<label>
								Update Channel Image
								<input ref="photo" type="file" style={{display:'none'}} onChange={this._uploadChannelImage.bind(this)} />
							</label>
						) : ''
					}

					<h1>Options</h1>
					<div className="ui-checkbox">
						<input name="setNoti" type="checkbox" checked={isNotiEnabled} onChange={this._setNotification.bind(this, !isNotiEnabled)} />
						<label htmlFor="setNoti">Notification</label>
					</div>

					{
						activeChannel.multichat && (
							<div id="chat-config-participants">
								{
									this.props.participants.map((participant) => {
										return (
											<div key={participant._id}>
												<img ref={participant._id} src={getImageSrc(participant.image)} onError={this._replaceImage.bind(this, participant._id)} />
												<p>{participant.nickname}</p>
											</div>
										);
									})
								}
							</div>
						)
					}

					<div className="button-container ui-right">
						<button className="ui-button ui-borderless ui-theme-red" onClick={this.props.onCloseConfig}>Close</button>
					</div>
				</div>

				{ this.state.openInviteWidget && 
					<InviteWidget
						onClose={this._closeInviteWidget.bind(this)}
						onClickAddress={this._inviteUser.bind(this)}
					/> 
				}
			</div>
		);
	}
}