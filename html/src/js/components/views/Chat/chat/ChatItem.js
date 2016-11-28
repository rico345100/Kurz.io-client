import React from 'react';
import moment from 'moment';
import { getImageSrc } from '../../../../utility';
import { remoteAddr } from '../../../../constants';
import electron from 'electron';
import { ipcRenderer } from 'electron';

export default class ChatItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initLastReads: false
		};
	}
	componentWillMount() {
		this.setState({
			initLastReads: this.props.lastReads
		});
	}
	_replaceImage(which) {
		this.refs[which].src = getImageSrc('noimage');
	}
	_downloadFile() {
		ipcRenderer.send('download-file', {
			channelID: this.props.activeChannel._id,
			fileId: this.props.file._id
		});
	}
	renderNormalMessage() {
		const lastReadsDOM = this.state.initLastReads ? (<div className="chat-room-lastReads">You've read here.</div>) : '';
		const sentAt = moment(this.props.sentAt).format('llll');

		return (
			<div className="chat-room-item-wrap">
				<div className={"chat-room-item" + (this.props.sender ? " message-sender" : "")}>
					<div className="chat-room-icon">
						<img ref="profile" src={getImageSrc(this.props.image)} onError={this._replaceImage.bind(this, "profile")} />
					</div>
					<div className="chat-room-message">
						<p className="sender">{this.props.nickname}</p>
						<p className="text">{this.props.message}</p>
						<p className="date">{sentAt}</p>
					</div>
				</div>
				{lastReadsDOM}
			</div>
		);
	}
	renderNotiMessage() {
		const lastReadsDOM = this.state.initLastReads ? (<div className="chat-room-lastReads">You've read here.</div>) : '';
		const sentAt = moment(this.props.sentAt).format('llll');

		return (
			<div className="chat-room-item-wrap">
				<div className="chat-room-noti">
					<h1>{this.props.message}</h1>
					<p>{sentAt}</p>
				</div>
				{lastReadsDOM}
			</div>
		);
	}
	renderFileMessage() {
		const lastReadsDOM = this.state.initLastReads ? (<div className="chat-room-lastReads">You've read here.</div>) : '';
		const sentAt = moment(this.props.sentAt).format('llll');
		const file = this.props.file;
		const isImage = { 'image/jpeg': true, 'image/pjpeg': true, 'image/png': true, 'image/gif': true }[file.mime];

		return (
			<div className="chat-room-item-wrap">
				<div className={"chat-room-item" + (this.props.sender ? " message-sender" : "")}>
					<div className="chat-room-icon">
						<img ref="profile" src={getImageSrc(this.props.image)} onError={this._replaceImage.bind(this, "profile")} />
					</div>
					<div className="chat-room-message">
						<p className="sender">{this.props.nickname}</p>
						<div className="file">
							<h1>File uploaded:</h1>

							{ !isImage && <img className="attach" src="./images/icon_attach.png" /> }
							{ isImage && <img className="preview" src={`${remoteAddr}/channel/${this.props.activeChannel._id}/image/${file._id}`} />}

							<h2>{file.name}</h2>
							<h3>{file.mime} ({file.size} Byte(s))</h3>
							<div className="right ui-button ui-round ui-borderless ui-theme-blue" onClick={this._downloadFile.bind(this)}>Download</div> 
						</div>
						<p className="date">{sentAt}</p>
					</div>
				</div>
				{lastReadsDOM}
			</div>
		);
	}
	render() {
		let renderingMethod;

		switch(this.props.type) {
			// normal message
			case 1:
			default:
				renderingMethod = this.renderNormalMessage;
				break;
			// notification message
			case 2:
			case 3:
				renderingMethod = this.renderNotiMessage;
				break;
			// file message
			case 4:
				renderingMethod = this.renderFileMessage;
				break;
		}

		return renderingMethod.call(this);
	}
}