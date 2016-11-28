import React from 'react';
import { redirect } from '../../../store';
import connection from '../../../connection';

export default class ViewStartup extends React.Component {
	componentWillMount() {
		connection.initialize().then( (socket) => {
			setTimeout( () => {
				redirect('/login');
			}, 1000);
			
		}).catch( (err) => {
			console.error(err);
		});
	}
	render() {
		return (
			<div className="app-view" id="viewStartup">
				<img src="./images/logo.png" />
			</div>
		);
	}
}