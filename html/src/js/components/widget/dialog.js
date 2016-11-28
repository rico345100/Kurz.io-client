import React from 'react';
import ReactDOM from 'react-dom';

let updateAlert;
let updateConfirm;
let updatePrompt;

class UIAlert extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			message: '',
			callback: function() {},
			display: false
		};
	}
	componentWillMount() {
		// make possible to update state outside of the component
		updateAlert = (message, callback) => {
			this.setState({
				message,
				callback,
				display: true
			});
		};
	}
	_executeCallback() {
		this.state.callback();
		this.state.callback = function() {};
		
		this.refs.widgetBody.className = '';
		
		setTimeout(() => {
			this.setState({
				message: '',
				callback: function() {},
				display: false
			});
		}, 300);
	}
	render() {
		const widgetStyle = this.state.display ? { display: 'block' } : { 'display': 'none' };
		
		if(this.state.display) {
			setTimeout(() => {
				this.refs.widgetBody.className = "show";
				this.refs.okButton.focus();
			}, 50);
		}
		
		return (
			<div className="app-widget-bg" style={widgetStyle}>
				<div id="app-widget-alert" ref="widgetBody">
					<p>{this.state.message}</p>
					<div className="button-container ui-right">
						<button ref="okButton" className="ui-button ui-round ui-borderless ui-theme-blue" onClick={this._executeCallback.bind(this)}>Close</button>
					</div>
				</div>
			</div>
		)
	}
}

class UIConfirm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			message: '',
			callback: function() {},
			noCallback: function() {},
			display: false
		};
	}
	componentWillMount() {
		// make possible to update state outside of the component
		updateConfirm = (message, callback, noCallback) => {
			this.setState({
				message,
				callback,
				noCallback,
				display: true
			});
		};
	}
	_executeCallback() {
		this.state.callback();
		this.state.callback = function() {};
		
		this.refs.widgetBody.className = '';
		
		setTimeout(() => {
			this.setState({
				message: '',
				callback: function() {},
				noCallback: function() {},
				display: false
			});
		}, 300);
	}
	_executeNoCallback() {
		this.state.noCallback();
		this.state.noCallback = function() {};
		
		this.refs.widgetBody.className = '';
		
		setTimeout(() => {
			this.setState({
				message: '',
				callback: function() {},
				noCallback: function() {},
				display: false
			});
		}, 300);
	}
	render() {
		const widgetStyle = this.state.display ? { display: 'block' } : { 'display': 'none' };
		
		if(this.state.display) {
			setTimeout(() => {
				this.refs.widgetBody.className = "show";
				this.refs.okButton.focus();
			}, 50);
		}
		
		return (
			<div className="app-widget-bg" style={widgetStyle}>
				<div id="app-widget-alert" ref="widgetBody">
					<p>{this.state.message}</p>
					<div className="button-container ui-right">
						<button className="ui-button ui-round ui-borderless ui-theme-red" onClick={this._executeNoCallback.bind(this)}>No</button>
						<button ref="okButton" className="ui-button ui-round ui-borderless ui-theme-blue" onClick={this._executeCallback.bind(this)}>Yes</button>
					</div>
				</div>
			</div>
		)
	}
}

class UIPrompt extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			message: '',
			callback: function() {},
			noCallback: function() {},
			display: false,
			value: '',
			maxLength: -1
		};
	}
	componentWillMount() {
		// make possible to update state outside of the component
		updatePrompt = (message, callback, noCallback, options) => {
			this.setState({
				message,
				callback,
				noCallback,
				display: true,
				value: options.value || '',
				type: options.type || 'text',
				maxLength: options.maxLength || -1
			});
		};
	}
	_executeCallback() {
		this.state.callback(this.state.value);
		this.state.callback = function() {};
		
		this.refs.widgetBody.className = '';
		
		setTimeout(() => {
			this.setState({
				message: '',
				callback: function() {},
				noCallback: function() {},
				display: false,
				value: '',
				maxLength: -1
			});
		}, 300);
	}
	_executeNoCallback() {
		this.state.noCallback();
		this.state.noCallback = function() {};
		
		this.refs.widgetBody.className = '';
		
		setTimeout(() => {
			this.setState({
				message: '',
				callback: function() {},
				noCallback: function() {},
				display: false,
				value: '',
				maxLength: -1
			});
		}, 300);
	}
	_onHandleInputChange(ev) {
		let newVar = ev.target.value;

		if(this.state.maxLength >= 0) {
			newVar = newVar.substr(0, this.state.maxLength);
		}		

		this.setState({
			value: newVar 
		});
	}
	_handleKey(ev) {
		if(ev.keyCode === 13 && this.state.value !== '') {
			ev.preventDefault();
			this._executeCallback();
		}
		else if(ev.keyCode === 27) {
			ev.preventDefault();
			this._executeNoCallback();
		}
	}
	render() {
		const widgetStyle = this.state.display ? { display: 'block' } : { 'display': 'none' };
		
		if(this.state.display) {
			setTimeout(() => {
				this.refs.widgetBody.className = "show";
				this.refs.value.focus();
			}, 50);
		}
		
		return (
			<div className="app-widget-bg" style={widgetStyle}>
				<div id="app-widget-prompt" ref="widgetBody">
					<p>{this.state.message}</p>
					<input ref="value" type={this.state.type} value={this.state.value} onChange={this._onHandleInputChange.bind(this)} onKeyDown={this._handleKey.bind(this)} />

					<div className="button-container ui-right">
						<button className="ui-button ui-round ui-borderless ui-theme-red" onClick={this._executeNoCallback.bind(this)}>Cancel</button>
						<button ref="okButton" className="ui-button ui-round ui-borderless ui-theme-blue" onClick={this._executeCallback.bind(this)}>Ok</button>
					</div>
				</div>
			</div>
		)
	}
}

const widgetDom = document.createElement('div');
widgetDom.id = 'kurz-io-widget';

document.body.appendChild(widgetDom);

ReactDOM.render(
	<div>
		<UIAlert />
		<UIConfirm />
		<UIPrompt />
	</div>,
	widgetDom
);


export default {
	alert(message, cb) {
		if(typeof cb !== 'function') cb = function() {};
		updateAlert(message, cb);
	},
	confirm(message, cb, noCb) {
		if(typeof cb !== 'function') cb = function() {};
		if(typeof noCb !== 'function') noCb = function() {};
		updateConfirm(message, cb, noCb);
	},
	prompt(message, cb, noCb, options) {
		if(typeof cb !== 'function') cb = function() {};
		if(typeof noCb !== 'function') noCb = function() {};
		options = options || {};
		updatePrompt(message, cb, noCb, options);
	}
}