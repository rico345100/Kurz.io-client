import React from 'react';
import moment from 'moment';
import { getChannelImageSrc, getImageSrc } from '../../../../utility';

export default class Channel extends React.Component {
	constructor(props) {
		super(props);
	}
	_joinRoom() {
		if(!this.props.active) {
			this.props.onClick(this.props.id);
		}
	}
	_replaceImage(which) {
		this.refs[which].src = getImageSrc('noimage');
	}
	render() {
		const props = this.props;
		let channelName, channelImage;

		// let's figured out that has new message
		let hasNewMessage = false;
		
		if(props.channelReadsCheck) {
			// first message
			if(typeof props.channelReads.reads === 'undefined') {
				hasNewMessage = true;
			}
			// updated message and channelReads different? has new message.
			else if(props.channelReads.reads !== this.props.lastMessage.messageID) {
				hasNewMessage = true;
			}
		}

		const hasNewMessageDom = (!this.props.active && hasNewMessage) ? (<div className="newMessage">New</div>) : '';


		if(props.multichat) {
			channelName = props.name;
			channelImage = getChannelImageSrc(props.image);
		}
		else {
			// display opposite user name
			if(props.email === props.target.email) {
				channelName = props.creator.nickname;
				channelImage = getImageSrc(props.creator.image);
			}
			else {
				channelName = props.target.nickname;
				channelImage = getImageSrc(props.target.image);
			}
		}

		if(channelName.length > 15) {
			channelName = channelName.substr(0, 15) + '...';
		}

		let lastMessage = props.lastMessage;
		let messageText = lastMessage.email === props.email ? 'You: ' + lastMessage.message : lastMessage.message;
		let updatedAt = moment(props.updatedAt).format('llll');

		if(messageText && messageText.length > 20) {
			messageText = messageText.substr(0, 20) + '...';
		}

		return (
			<div className={("chat-channel-item") + (this.props.active ? " active" : "") } onClick={this._joinRoom.bind(this)}>
				<img ref="image" src={channelImage} onError={this._replaceImage.bind(this, "image")} />
				<h1>{channelName}</h1>
				<h2>{messageText}</h2>
				<p>Last at: {updatedAt}</p>
				{hasNewMessageDom}
			</div>
		);
	}
}