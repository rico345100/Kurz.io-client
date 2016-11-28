import React from 'react';
import ReactDOM from 'react-dom';
import LoadingMessage from '../ext/LoadingMessage';
import ChatItem from './ChatItem';
import { setListDom, setListDomOffset } from '../index';

export default class ChatList extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount() {
		this.refs.list.addEventListener('scroll', this._handleScroll.bind(this));
		setListDom(this.refs.list);
	}
	componentWillUnmount() {
		this.refs.list.removeEventListener('scroll', this._handleScroll.bind(this));
	}
	_handleScroll(ev) {
		setListDomOffset(ev.target.scrollTop);

		if(ev.target.scrollTop <= 100) {
			this.props.onScrollTop();
		}
	}
	componentDidUpdate() {
		if(this.props.hasNewMessage) {
			// scroll to bottom
			const list = ReactDOM.findDOMNode(this.refs.list);
			list.scrollTop = list.scrollHeight;
			
			this.props.onHasNewMessage();
		}
	}
	render() {
		const lastID = this.props.channelReads.reads;

		return (
			<div ref="list" id="chat-room-list" ref="list">
				{ this.props.loadingMoreMessage && <LoadingMessage /> }
				{ 
					this.props.messages.map( (message) => {
						let isSender = message.email === this.props.email;
						let isLastReads = message._id === lastID;

						return (
							<ChatItem
								key={message._id}
								activeChannel={this.props.activeChannel}
								nickname={message.nickname}
								image={message.image}
								message={message.message}
								sentAt={message.sentAt}
								type={message.type}
								sender={isSender}
								lastReads={isLastReads}
								file={message.file}
							/>
						);
					})
				}
			</div>
		);
	}
}