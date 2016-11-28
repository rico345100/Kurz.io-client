import React from 'react';
import Channel from './Channel';

export default class ChannelList extends React.Component {
	_onJoin(channelID) {
		this.props.onJoin(channelID);
	}
	render() {
		const channelList = this.props.channels || [];

		return (
			<div id="chat-channel">
				<div id="chat-channel-list">
					{ channelList.map( (channel) => {
						const isActiveChannel = this.props.activeChannel._id === channel._id;

						// get messages of channel
						const channelReads = this.props.channelReads;
						let currentChannelReads = {};

						for(var i = 0; i < channelReads.length; i++) {
							if(channelReads[i].channelID === channel._id) {
								currentChannelReads = channelReads[i];
								break;
							}
						}

						return (
							<Channel
								key={channel._id}
								active={isActiveChannel}
								channelReads={currentChannelReads}
								channelReadsCheck={this.props.channelReadsCheck}
								id={channel._id}
								multichat={channel.multichat}
								email={this.props.email}
								createdAt={channel.createdAt}
								updatedAt={channel.updatedAt}
								creator={channel.creator}
								target={channel.target}
								lastMessage={channel.lastMessage}
								name={channel.name}
								participants={channel.participants}
								name={channel.name}
								image={channel.image}
								onClick={this._onJoin.bind(this)}
							/>
						); 
					})}
				</div>
			</div>
		);
	}
}