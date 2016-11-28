import React from 'react';

export default class UploadItem extends React.Component {
	constructor(props) {
		super(props);
		this.oldUploaded = 0;
	}
	componentDidMount() {
		this.oldUploaded = 0;
	}
	_cancel() {
		this.props.onCancel(this.props.file);
	}
	shouldComponentUpdate(nextProps, nextState) {
		if(this.oldUploaded !== nextProps.file.uploaded) {
			this.oldUploaded = nextProps.file.uploaded;
			return true;
		}

		return false;
	}
	render() {
		let file = this.props.file;
		let percent = parseFloat((file.uploaded / file.size) * 100).toFixed(1);

		return (
			<div className="upload-item">
				{percent < 100 && <div className="cancel" onClick={this._cancel.bind(this)}>×</div>}
				<h1>{file.name}</h1>
				
				<div className="upload-gauge-box">
					<div style={{ width: `${percent}%` }}>{percent}%</div>
				</div>
			</div>
		);
	}
}