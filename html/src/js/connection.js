import SocketIO from 'socket.io-client';
import { remoteAddr } from './constants';

let socket;

const module = {
	getSocket() {
		return socket;
	},
	emit(ev, data) {
		socket.emit(ev, data);
	},
	initialize() {
		if(socket && socket.connected) {
			return Promise.resolve(socket);
		}
		
		return new Promise( (resolve, reject) => {
			socket = SocketIO(remoteAddr);
			
			socket.on('error', (err) => {
				reject(err);
			});
			
			// set event handlers
			socket.on('connect', () => {
				console.log('connection established!');

				socket.emit('authentication', { key: 'ferrero-nutella'});
				socket.on('authenticated', () => {
					console.log('Authenticated.');

					resolve(socket);
				});
				socket.on('unauthorized', (err) => {
					reject(err);
				});
			});
			
			// unset event handlers
			socket.on('disconnect', () => {
				console.log('disconnect connection');
			});
			
			socket.on('reconnect', () => {
				console.log('reconnected');
			});
		});
	}
};

export default module;