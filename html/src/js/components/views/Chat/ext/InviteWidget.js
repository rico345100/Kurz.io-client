import React from 'react';
import { connect } from 'react-redux';
import AddressBookContainer from '../addressbook/AddressBookContainer';

class InviteWidget extends React.Component {
	_inviteUser(email) {
		this.props.onClickAddress(email);
	}
	render() {
		return (
			<div id="addressBook">
				<AddressBookContainer
					readOnly={true}
					address={this.props.addressbook}
					onClickAddress={this._inviteUser.bind(this)}
					onClose={this.props.onClose}
				/>
			</div>
		);
	}
}

const ConnectedInviteWidget = connect( (state) => {
	return {
		user: state.UserReducer.user,
		addressbook: state.AddressBookReducer.list
	};
})(InviteWidget);

export default ConnectedInviteWidget;