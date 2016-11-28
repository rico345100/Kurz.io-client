import React from 'react';
import { connect } from 'react-redux';
import AddressAddForm from './AddressAddForm';
import AddressBookContainer from './AddressBookContainer'

class AddressBook extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openAddForm: false
		};
	}
	_openAddForm() {
		this.setState({
			openAddForm: true
		});
	}
	_closeAddForm() {
		this.setState({
			openAddForm: false
		});
	}
	_deleteAddress(target) {
		this.props.onDeleteAddress(target);
	}
	render() {
		const renderDom = this.state.openAddForm ?
		(
			<AddressAddForm
				email={this.props.email}
				onAddAddress={this.props.onAddAddress}
				onCloseAddForm={this._closeAddForm.bind(this)}
			/>
		) :
		(
			<AddressBookContainer
				email={this.props.email}
				address={this.props.addressbook}
				onClickAddress={this.props.onClickAddress}
				onDeleteAddress={this._deleteAddress.bind(this)}
				onOpenAddForm={this._openAddForm.bind(this)}
				onClose={this.props.onClose}
			/>
		);
		
		return (
			<div id="addressBook">
				{renderDom}
			</div>
		);
	}
}

const ConnectedAddressBook = connect( (state) => {
	return {
		user: state.UserReducer.user,
		addressbook: state.AddressBookReducer.list
	};
})(AddressBook);

export default ConnectedAddressBook;