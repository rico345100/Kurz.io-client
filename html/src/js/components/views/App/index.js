import React from 'react';
import { RouteTransition } from 'react-router-transition';

export default class App extends React.Component {
	render() {
		return (
			<div>
				<RouteTransition
					className="app-view-wrapper"
					pathname={this.props.location.pathname}
					atEnter={{ translateX: 100 }}
					atLeave={{ translateX: -100 }}
					atActive={{ translateX: 0 }}
					mapStyles={styles => ({ transform: `translateX(${styles.translateX}%)` })}>
					{this.props.children}
				</RouteTransition>
			</div>
		);
	}
}