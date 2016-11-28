import React from 'react';

export default class AddressBookItem extends React.Component {
	_deleteItem(ev) {
		ev.preventDefault();

		if(!this.props.readOnly) {
			ev.stopPropagation();
			this.props.onDeleteAddress(this.props.email);
		}
	}
	_handleClick() {
		this.props.onClickAddress(this.props.email);
	}
	_replaceImage(which) {
		this.refs[which].src = getImageSrc('noimage');
	}
	render() {
		const imageSrc = (this.props.image) === 'default' ? "./images/user_default.png" : this.props.image;
		
		return (
			<div className="addressBook-item" onClick={this._handleClick.bind(this)}>
				<img ref="profile" src={imageSrc} onError={this._replaceImage.bind(this, "profile")} />
				<div className="text">
					<p>{this.props.nickname}</p>
					<p className="email">{this.props.email}</p>
				</div>
				{
					!this.props.readOnly ? (
						<div className="delete" onClick={this._deleteItem.bind(this)}>{'×'}</div>
					) : ''
				}
			</div>
		);
	}
}