import React from 'react';
import SocketIOFileClient from 'socket.io-file-client';
import connection from '../../../../connection';
import dialog from '../../../widget/dialog';
import UploadItem from './UploadItem';

let socketIOFileClient = null;

let channel = null;
let uploadFiles = [];
let upload = 0;
let uploaded = 0;

export function addUploadFiles(files) {
	// check file already in
	for(var i = 0; i < files.length; i++) {
		var file = files[i];
		var found = false;

		for(var j = 0; j < uploadFiles.length; j++) {
			if(file.name === uploadFiles[j].name && file.size === uploadFiles[j].size) {
				found = true;
				break;
			}
		}

		if(!found) {
			file.uploaded = 0;	// create uploaded property for check uploading progress(UI)
			file.uploadId = undefined;
			uploadFiles.push(file);
			uploadFile(file);
		}
	}
}
export function removeUploadFile(file) {
	if(!file) {
		uploadFiles = [];
	}
	else {
		for(var i = 0; i < uploadFiles.length; i++) {
			if(uploadFiles[i].name === file.name && uploadFiles[i].size === file.size) {
				uploadFiles.splice(i, 1);
				break;
			}
		}
	}
}
function uploadFile(file) {
	// wait until socketIOFileClient is initialized
	var handler = setInterval(() => {
		if(socketIOFileClient && channel) {
			clearInterval(handler);
			file.uploadId = socketIOFileClient.upload(file, {
				to: 'chatFile',
				data: {
					channelID: channel._id
				}
			});
		}
	}, 100);
}

export default class UploadList extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount() {
		upload = 0;
		uploaded = 0;

		channel = this.props.activeChannel;	// assign to global so make uploadFile function access

		const socket = connection.getSocket();
		socketIOFileClient = new SocketIOFileClient(socket);

		socketIOFileClient.on('start', (data) => {
			upload++;
		});
		socketIOFileClient.on('stream', (data) => {
			var fileName = data.name;
			var fileSize = data.size;

			for(var i = 0; i < uploadFiles.length; i++) {
				if(uploadFiles[i].name === fileName && uploadFiles[i].size === fileSize) {
					uploadFiles[i].uploaded = data.uploaded;
					this.setState({});
					break;
				}
			}
		});
		socketIOFileClient.on('complete', (data) => {
			//console.log('upload complete', data);
			removeUploadFile({ name: data.name, size: data.size });
			this.setState({});

			uploaded++;
			if(uploaded >= upload) {
				this.props.onComplete();
			}

			socket.once(`/channel/file/upload/${data.uploadId}`, (data) => {
				if(data.error) {
					return dialog.alert(data.error.reason || data.error.message || data.error);
				}

				//console.log('file uploaded sucessfully!', data);
			});
		});
		/*socketIOFileClient.on('abort', (data) => {
			console.log(data);
		});
		socketIOFileClient.on('error', (data) => {
			dialog.alert(data.message);
			console.log(data);
		});*/
	}
	componentWillUnmount() {
		socketIOFileClient.destroy();
	}
	// function for checking cancel / complete upload
	_removeFileFromArray(file) {
		removeUploadFile(file);
		socketIOFileClient.abort(file.uploadId);

		this.props.onCancel();

		if(uploadFiles.length === 0) {
			this.props.onComplete();
		}
	}
	render() {
		return (
			<div id="chat-room-form-uploads" style={{ bottom: this.props.style.bottom + 'px' }}>
				<h1>Uploading...</h1>

				{
					uploadFiles.map( (file) => {
						return (
							<UploadItem key={file.name} file={file} onCancel={this._removeFileFromArray.bind(this, file)} />
						);
					})
				}
			</div>
		);
	}
}