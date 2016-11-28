import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { redirect } from '../../../store';
import { updateChannelList, insertMessage, updateActiveChannel, updateMessages } from '../../../actions/channel';
import { updateAddressBook } from '../../../actions/addressbook';
import { getImageSrc } from '../../../utility';
import connection from '../../../connection';
import dialog from '../../widget/dialog';

import AddressBook from './addressbook/AddressBook';
import AppConfig from './ext/AppConfig';
import ChannelList from './channel/ChannelList';
import ChatTop from './chat/ChatTop';
import ChatRoom from './chat/ChatRoom';


// this function restore currect offset of ChatList DOM when app receives new messages
let originalListOffset = 0;
let listDom = null;

export function setListDom(dom) {
	listDom = dom;
}
export function setListDomOffset(offset) {
	originalListOffset = offset;
}

function restoreChatListOffset(offset) {
	if(listDom) {
		listDom.scrollTop = originalListOffset + offset;
	}
}

class ViewChat extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openAddressBook: false,
			openConfig: false,
			address: [],
			channelReads: [],
			channelReadsCheck: false,
			lastMessage: false,
			loadMoreMessage: false,
			hasNewMessage: false,	// use for scrolling to bottom when new message comes
			noMoreMessage: false,
			participants: [] 
		};
	}
	componentWillMount() {
		console.log('Setting Socket event initialization...');

		const socket = connection.getSocket();
		socket.on('/channel/message/receive', (data) => {
			if(data.error) {
				return dialog.alert(data.error.reason || data.error.message || data.error);
			}
			
			if(this.props.activeChannel && this.props.activeChannel._id === data.channelID) {
				insertMessage(data);

				this.setState({
					hasNewMessage: true
				});

				// if type is 3, reload current channel
				if(data.type === 3) {
					this._reloadCurrentChannelData();
				}

				// update channel reads
				socket.emit('/user/update/channelReads', {
					email: this.props.user.email,
					channelID: this.props.activeChannel._id,
					messageID: data._id
				});

				socket.once('/user/update/channelReads', (data) => {
					if(data.error) {
						return dialog.alert(data.error.message || data.error.reason || data.error);
					}

					this._getChannelList( () => {
						this._getChannelReads();
					});
				});
			}
			else {
				let noNotificationList = this.props.user.noNotification || [];
				let found = false;

				for(let i = 0; i < noNotificationList.length; i++) {
					if(noNotificationList[i] === data.channelID) {
						found = true;
						break;
					}
				}

				if(!found) {
					ipcRenderer.send('notification', {
						sender: data.nickname,
						message: data.message,
						image: getImageSrc(data.image)
					});
				}

				this._getChannelList( () => {
					this._getChannelReads();
				});
			}
		});

		this._getChannelList(() => {
			this._getChannelReads();
		});
		this._loadAddressBook();
	}
	componentWillUnmount() {
		console.log('Unsetting Socket events...');

		const socket = connection.getSocket();
		socket.off('/channel/message/receive');
	}
	/*shouldComponentUpdate(nextProps, nextState) {

	}*/
	_loadAddressBook() {
		const socket = connection.getSocket();
		
		socket.emit('/addressbook/get', {
			email: this.props.user.email
		});
		
		socket.once('/addressbook/get', (data) => {
			if(data.error) {
				return dialog.alert(data.error || data.error.reason || data.error.message);
			}
			
			this.setState(Object.assign({}, this.state, {
				address: data.list	
			}));

			updateAddressBook(data.list);
		});
	}
	_getChannelList(cb) {
		const socket = connection.getSocket();
		
		socket.emit('/channel/get/list', {
			email: this.props.user.email
		});
		
		socket.once('/channel/get/list', (data) => {
			if(data.error) {
				return dialog.alert(data.error.message || data.error.reason || data.error);
			}

			updateChannelList(data.channels);
			if(typeof cb === 'function') cb();
		});
	}
	_getChannelReads() {
		const socket = connection.getSocket();

		socket.emit('/user/get/channelReads', {
			email: this.props.user.email
		});

		socket.once('/user/get/channelReads', (data) => {
			if(data.error) {
				return dialog.alert(data.error.message || data.error.reason || data.error);
			}

			this.setState({
				channelReads: data.channelReads,
				channelReadsCheck: true
			});
		});
	}
	_openAddressBook() {
		this.setState({
			openAddressBook: true
		});
	}
	_closeAddressBook() {
		this.setState({
			openAddressBook: false
		});
	}
	_addAddress() {
		this._loadAddressBook();
	}
	_deleteAddress(target) {
		const socket = connection.getSocket();
		
		socket.emit('/addressbook/delete', {
			email: this.props.user.email,
			target
		});
		
		socket.on('/addressbook/delete', (data) => {
			if(data.error) {
				return dialog.alert(data.error.reason || data.error.message);
			}

			this._loadAddressBook();
		});
	}
	_joinRoom(target) {
		// reset lastMessage state to prevent sending wrong last message on _getMessage
		// and reset no more message too.
		this.setState({
			lastMessage: false,
			noMoreMessage: false,
			messageReads: false,	// check for first reads
			participants: []
		});

		const socket = connection.getSocket();
		
		socket.emit('/channel/connect', {
			email: this.props.user.email,
			target
		});
		
		socket.once('/channel/connect', (data) => {
			if(data.error) {
				return dialog.alert(data.error.message || data.error.reason || data.error);
			}

			this._closeAddressBook();

			// setting channel automatically open chat room
			updateActiveChannel(data);
			this._getChannelList(() => {
				this._getChannelReads();
				this._getParticipantsInfo();
			});
			this._getMessages( () => {
				this.setState({
					hasNewMessage: true		// trigger scrolling to bottom
				});
			});
		});
	}
	_joinRoomById(channelID) {
		console.log('Joining Room with ID: ' + channelID);

		// reset lastMessage state to prevent sending wrong last message on _getMessage
		// and reset no more message too.
		this.setState({
			lastMessage: false,
			noMoreMessage: false,
			messageReads: false,	// check for first reads
			participants: []
		});

		const socket = connection.getSocket();
		
		socket.emit('/channel/connect/id', {
			channel: channelID
		});
		
		socket.once('/channel/connect/id', (data) => {
			if(data.error) {
				return dialog.alert(data.error.message || data.error.reason || data.error);
			}

			// setting channel automatically open chat room
			updateActiveChannel(data);
			this._getChannelList(() => {
				this._getChannelReads();
				this._getParticipantsInfo();
			});
			this._getMessages( () => {
				this.setState({
					hasNewMessage: true		// trigger scrolling to bottom
				});
			});
		});
	}
	_leaveChannel() {
		updateActiveChannel(false);
		updateMessages([]);
		this._getChannelReads();
	}
	_loadMoreMessages() {
		if(!this.state.loadMoreMessage && !this.state.noMoreMessage) {
			this.setState({
				loadMoreMessage: true
			});

			setTimeout( () => {
				if(this.props.activeChannel) {
					this._getMessages( () => {
						this.setState({
							loadMoreMessage: false
						});
					});
				}
			}, 2000);
		}
	}
	_getMessages(cb) {
		const socket = connection.getSocket();

		socket.emit('/channel/message/get', {
			channelID: this.props.activeChannel._id,
			per: 30,
			fromID: this.state.lastMessage
		});

		socket.once('/channel/message/get', (data) => {
			if(data.error) {
				return dialog.alert(data.error.message || data.error.reason || data.error);
			}

			// if the length of messages is lower than 30,
			// that means no more message.
			// this use for prevent requiring more messages even no more.
			this.setState({
				noMoreMessage: (data.messages.length < 30)
			});

			function updateLastMessage(messageID) {
				this.setState({
					lastMessage: messageID
				});
			}

			// if first time load, update store directly
			if(!this.state.messageReads) {
				updateMessages(data.messages);

				this.setState({
					messageReads: true
				});
			}
			// else, and has message, append from the top
			else if(data.messages.length > 0) {
				let newMessages = [...data.messages, ...this.props.messages];
				updateMessages(newMessages);

				// get first message to figure out where did you get it last request
				updateLastMessage.call(this, data.messages[0]._id);
				restoreChatListOffset(data.messages.length * 70);
			}

			if(data.messages.length > 0) {
				// get first message to figure out where did you get it last request
				updateLastMessage.call(this, data.messages[0]._id);

				// get last message's id and update
				let lastMessage = data.messages[data.messages.length - 1];
				
				socket.emit('/user/update/channelReads', {
					email: this.props.user.email,
					channelID: this.props.activeChannel._id,
					messageID: lastMessage._id
				});

				socket.once('/user/update/channelReads', (data) => {
					if(data.error) {
						return dialog.alert(data.error.message || data.error.reason || data.error);
					}
				});
			}

			if(typeof cb === 'function') cb();
		});
	}
	_getParticipantsInfo() {
		const socket = connection.getSocket();

		socket.emit('/channel/get/participants', {
			participants: this.props.activeChannel.participants
		});

		socket.once('/channel/get/participants', (data) => {
			if(data.error) {
				return dialog.alert(data.error.message || data.error.reason || data.error);
			}

			this.setState({
				participants: data.list
			});
		});
	}
	_readNewMessage() {
		this.setState({
			hasNewMessage: false
		});
	}
	_reloadCurrentChannelData() {
		this._loadAddressBook();
		this._getParticipantsInfo();

		// update channel list to get
		this._getChannelList();

		// get current channel info newerly
		const socket = connection.getSocket();

		socket.emit('/channel/connect/id', {
			channel: this.props.activeChannel._id
		});
		
		socket.once('/channel/connect/id', (data) => {
			if(data.error) {
				return dialog.alert(data.error.message || data.error.reason || data.error);
			}

			// setting channel automatically open chat room
			updateActiveChannel(data);
		});
	}
	_afterLeaveChannel() {
		this._leaveChannel();
		this._getChannelList();
	}
	_toggleAppConfig() {
		this.setState({
			openConfig: !this.state.openConfig
		});
	}
	_logout() {
		const socket = connection.getSocket();

		socket.emit('/user/signout', {
			email: this.props.user.email
		});

		socket.once('/user/signout', (data) => {
			updateActiveChannel(false);
			updateAddressBook([]);
			updateChannelList([]);
			updateMessages([]);

			redirect('/login');
		});
	}
	render() {
		//console.log('<ViewChat />::props', this.props);
		return (
			<div className="app-view" id="viewChat">
				<ReactCSSTransitionGroup
					component="div"
					transitionName="anim-app-config"
					transitionEnterTimeout={300}
					transitionLeaveTimeout={300}>
					{this.state.openConfig &&
						<AppConfig user={this.props.user} />
					}
				</ReactCSSTransitionGroup>
				<ChatTop
					onClickAddressBook={this._openAddressBook.bind(this)}
					onClickAppConfig={this._toggleAppConfig.bind(this)}
					onLogout={this._logout.bind(this)}
				/>
				<ChannelList
					email={this.props.user.email}
					activeChannel={this.props.activeChannel}
					channels={this.props.channelList}
					channelReads={this.state.channelReads}
					channelReadsCheck={this.state.channelReadsCheck}
					onJoin={this._joinRoomById.bind(this)}
				/>
				<ChatRoom
					email={this.props.user.email}
					noNotification={this.props.user.noNotification}
					address={this.state.address}
					activeChannel={this.props.activeChannel}
					participants={this.state.participants}
					channelReads={this.state.channelReads}
					messages={this.props.messages}
					onAddAddress={this._addAddress.bind(this)}
					onChannelLeave={this._leaveChannel.bind(this)}
					onScrollTop={this._loadMoreMessages.bind(this)}
					loadingMoreMessage={this.state.loadMoreMessage}
					hasNewMessage={this.state.hasNewMessage}
					onHasNewMessage={this._readNewMessage.bind(this)}
					onUserInvited={this._reloadCurrentChannelData.bind(this)}
					onChannelUpdated={this._reloadCurrentChannelData.bind(this)}
					onChannelLeave={this._afterLeaveChannel.bind(this)}
				/>
				{ this.state.openAddressBook && 
					<AddressBook 
						email={this.props.user.email}
						onClickAddress={this._joinRoom.bind(this)}
						onAddAddress={this._addAddress.bind(this)}
						onDeleteAddress={this._deleteAddress.bind(this)}
						onClose={this._closeAddressBook.bind(this)}
					/>
				}
			</div>
		);
	}
}

const ConnectedViewChat = connect( (state) => {
	return {
		user: state.UserReducer.user,
		channelList: state.ChannelReducer.channels,
		activeChannel: state.ChannelReducer.activeChannel,
		messages: state.ChannelReducer.messages
	};
})(ViewChat);

export default ConnectedViewChat;