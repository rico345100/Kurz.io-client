import React from 'react';
import { spring, Motion } from 'react-motion';

export default class LoadingMessage extends React.Component {
	render() {
		return (
			<Motion defaultStyle={{ height: 0 }} style={{ height: spring(40) }} >
				{
					interpolatedStyle => {
						return (
							<div className="loading" style={interpolatedStyle}>
								<div className="dot"></div>
								<div className="dot"></div>
								<div className="dot"></div>
							</div>
						);
					}
				}
			</Motion>
		);
	}
}