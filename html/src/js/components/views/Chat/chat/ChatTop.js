import React from 'react';
import dialog from '../../../widget/dialog';

export default class ChatTop extends React.Component {
	_openAppConfig() {
		this.props.onClickAppConfig();
	}
	_openAddressBook() {
		this.props.onClickAddressBook();
	}
	_checkLogout() {
		dialog.confirm('Logout?', () => {
			this.props.onLogout();
		});
	}
	render() {
		return (
			<div id="chat-top">
				<img src="./images/logo.png" />
				<div className="ui-button ui-borderless ui-theme-blue" onClick={this._openAddressBook.bind(this)}>
					<img src="./images/icon_users.png" />
					<p>Friends</p>
				</div>
				
				<div id="chat-top-func">
					<div onClick={this._openAppConfig.bind(this)}>
						<img src="./images/icon_gear.png" />
					</div>
					<div onClick={this._checkLogout.bind(this)}>
						<img src="./images/icon_logout.png" />
					</div>
				</div>
			</div>
		);
	}
}