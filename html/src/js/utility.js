import { remoteAddr } from './constants';

export function getImageSrc(src) {
	if(src === 'default')
		return './images/user_default.png';
	else if(src === 'group') 
		return './images/group_default.png';
	else if(src === 'noimage')
		return './images/nofound.png';
	else
		return `${remoteAddr}/profile/${src}`;
}

export function getChannelImageSrc(src) {
	if(src === 'group')
		return './images/group_default.png';
	else if(src === 'noimage')
		return './images/nofound.png';
	else
		return `${remoteAddr}/channel/image/${src}`;
}