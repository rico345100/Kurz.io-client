import React from 'react';
import Transition from 'react-motion-ui-pack';
import { ipcRenderer } from 'electron';
import { updateUser } from '../../../../actions/user';
import SocketIOFileClient from 'socket.io-file-client';
import dialog from '../../../widget/dialog';
import connection from '../../../../connection';
import ChatRoomConfig from './ChatRoomConfig';
import ChatList from './ChatList';
import ChatForm from './ChatForm';
import UploadList from '../ext/UploadList';
import { addUploadFiles, removeUploadFile } from '../ext/UploadList';

export default class ChatRoom extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openConfig: false,
			uploading: false,
			fileDragging: false
		};
	}
	componentDidMount() {
		// mount drag events for prevent flickering on hovering child elements
		let chatRoom = this.refs.container;
		let counter = 0;

		chatRoom.addEventListener('dragenter', (ev) => {
			counter++;

			this.setState({
				fileDragging: true
			});
		});
		chatRoom.addEventListener('dragleave', (ev) => {
			counter--;

			if(counter === 0) {
				this.setState({
					fileDragging: false
				});
			}
		});
		chatRoom.addEventListener('dragover', (ev) => {
			ev.preventDefault();
		});
		chatRoom.addEventListener('drop', (ev) => {
			ev.preventDefault();

			counter = 0;

			this.setState({
				fileDragging: false
			});

			let files = ev.dataTransfer.files;

			addUploadFiles(files);
		
			this.setState({
				fileDragging: false,
				uploading: true
			});

			return;
		});
	}
	_sendMessage(message) {
		// commands
		switch(message) {
			case 'set debug=true':
				ipcRenderer.send('set debug=true', {});
				return;
			case 'set debug=false':
				ipcRenderer.send('set debug=false', {});
				return;
		}

		const socket = connection.getSocket();

		socket.emit('/channel/message/send', {
			channelID: this.props.activeChannel._id,
			email: this.props.email,
			message
		});

		socket.once('/channel/message/send', (data) => {
			if(data.error) {
				dialog.alert(data.error.reason || data.error.message || data.error);
			}
		});
	}
	_leaveChannel() {
		const leave = () => {
			this._closeConfig();
			this.props.onChannelLeave();
		};

		if(this.state.uploading) {
			return dialog.confirm('Leave channel might cancel all your uploads.', () => {
				this.setState({
					uploading: false
				});

				removeUploadFile();		// remove all files
				leave();
			});
		}

		leave();
	}
	_openConfig() {
		this.setState({
			openConfig: true
		});
	}
	_closeConfig() {
		this.setState({
			openConfig: false
		});
	}
	_userInvited() {
		this._closeConfig();
		this.props.onUserInvited();
	}
	_addFriend(email) {		
		const socket = connection.getSocket();
		
		socket.emit('/addressbook/create', {
			email: this.props.email,
			target: email
		});
		
		socket.once('/addressbook/create', (data) => {
			if(data.error) {
				return dialog.alert(data.error.reason);
			}
			
			this.props.onAddAddress();
		});
	}
	_afterUpload() {
		this.setState({
			uploading: false
		});
	}
	_loadUserData() {
		const socket = connection.getSocket();

		// retain new user info
		socket.emit('/user/get', {
			email: this.props.email
		});
		
		socket.once('/user/get', (data) => {
			if(data.error) {
				return dialog.alert(data.error.reason || data.error.message || data.error);
			}
			
			updateUser(data);
		});
	}
	renderBody() {
		// find current channel reads
		let channelReads = {};

		for(var i = 0; i < this.props.channelReads.length; i++) {
			if(this.props.channelReads[i].channelID === this.props.activeChannel._id) {
				channelReads = this.props.channelReads[i];
				break;
			}
		}

		// check target is friend or not to display 'add friend?'
		let renderAddFriend = '';
		const activeChannel = this.props.activeChannel;
		
		// not for multichat
		if(!activeChannel.multichat) {
			let target = this.props.email !== activeChannel.creator.email ? activeChannel.creator : activeChannel.target;

			// looping addressbook
			const address = this.props.address;
			let found = false;

			for(var i = 0; i < address.length; i++) {
				if(address[i].email === target.email) {
					found = true;
					break;
				}
			} 

			// not found? then ask to add!
			if(!found) {
				renderAddFriend = (
					<div id="addFriend">
						<p>Add friend '{target.nickname}'?</p>
						<button onClick={this._addFriend.bind(this, target.email)} className="ui-button ui-round ui-borderless ui-theme-blue">Yes</button>
					</div>
				);
			}
		}

		//console.log('<ChatRoom />::props', this.props);

		return (
			<div id="chat-room" ref="container">
				{ this.state.openConfig && 
					<ChatRoomConfig
						email={this.props.email}
						noNotification={this.props.noNotification}
						participants={this.props.participants}
						activeChannel={this.props.activeChannel}
						onUserInvited={this._userInvited.bind(this)}
						onChannelUpdated={this.props.onChannelUpdated}
						onChannelLeave={this._leaveChannel.bind(this)}
						onNotificationUpdate={this._loadUserData.bind(this)}
						onCloseConfig={this._closeConfig.bind(this)}
					/>
				}
				<div id="chat-room-info">
					<img id="channelLeave" onClick={this._leaveChannel.bind(this)} src="./images/button_w_left.png" />
					<div id="channelOption" onClick={this._openConfig.bind(this)} className="ui-button ui-round ui-borderless ui-theme-blue">Config</div>

					{renderAddFriend}
				</div>
				<ChatList
					activeChannel={this.props.activeChannel}
					email={this.props.email}
					messages={this.props.messages}
					channelReads={channelReads || {}}
					loadingMoreMessage={this.props.loadingMoreMessage}
					onScrollTop={this.props.onScrollTop}
					hasNewMessage={this.props.hasNewMessage}
					onHasNewMessage={this.props.onHasNewMessage}
				/>
				<ChatForm onSendMessage={this._sendMessage.bind(this)} />

				{/* File Dragging Effect */}
				{<Transition
					component={false}
					enter={{
						opacity: 1.0
					}}
					leave={{
						opacity: 0.0
					}}>
					{this.state.fileDragging && (
						<div key="dropzone" id="chat-room-dropFile">
							<h1>Drop file here to upload</h1>
						</div>
					)}
				</Transition>}

				{/* 32px is height of form */}
				<Transition
					component="div"
					enter={{
						bottom: 32
					}}
					leave={{
						bottom: -200
					}}>
					{this.state.uploading && (
						<UploadList
							key="upload"
							activeChannel={this.props.activeChannel}
							files={this.state.uploadFiles}
							onComplete={this._afterUpload.bind(this)}
							onCancel={() => { this.setState({}) }} />
					)}
				</Transition>
			</div>
		);
	}
	renderEmpty() {
		return (
			<div id="chat-room" ref="container">
				<h1>Select the channel to talk.</h1>
			</div>
		);
	}
	render() {
		const Render = this.props.activeChannel ? this.renderBody() : this.renderEmpty();
		return Render;
	}
}