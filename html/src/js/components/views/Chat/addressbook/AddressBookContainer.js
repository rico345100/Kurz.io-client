import React from 'react';
import AddressBookItem from './AddressBookItem';

export default class AddressBookContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			form: {
				find: ''
			}
		};
	}
	_updateTextbox(type, ev) {
		var oldState = this.state;
		var newFormState = Object.assign({}, this.state.form, {
			[type]: ev.target.value
		});

		this.setState(Object.assign({}, this.state, {
			form: newFormState
		}));
	}
	render() {
		const address = this.props.address || [];
		
		// filtering by search text
		const searchText = this.state.form.find.toLowerCase();
		const filteredAddress = address.filter( (value) => {
			return (value.email.toLowerCase().indexOf(searchText) !== -1) || (value.nickname.toLowerCase().indexOf(searchText) !== -1);
		});
		
		return (
			<div id="addressBook-box">
				<div id="addressBook-top">
					<h1>Address Book</h1>
					<div onClick={this.props.onClose}>{'×'}</div>
					
					<form>
						<input onChange={this._updateTextbox.bind(this, 'find')} type="text" placeholder="Find..." value={this.state.form.form} /> 
					</form>
				</div>
				<div id="addressBook-content">
					<div id="addressBook-list">
						{
							filteredAddress.map( (item) => {
								return (
									<AddressBookItem
										readOnly={this.props.readOnly}
										key={item.email}
										email={item.email}
										nickname={item.nickname}
										image={item.image}
										onClickAddress={this.props.onClickAddress}
										onDeleteAddress={this.props.onDeleteAddress}
									/>
								);
							})
						}
					</div>
				</div>
				{
					!this.props.readOnly ? (
						<div id="addressBook-add" className="ui-button ui-borderless ui-theme-blue" onClick={this.props.onOpenAddForm}>
							<img src="./images/icon_add_user.png" />
							<p>Add Friend</p>
						</div>
					) : ''
				}
				
			</div>
		);
	}
}