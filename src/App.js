/*global chrome*/
import React, { Component } from 'react';
import "./App.css";
import ReactJson from 'react-json-view';
import {getCurrentTab} from "./common/Utils";

class EventElement extends React.Component {
  render() {
    return (
      <ReactJson src={this.props.event} collapsed="1" theme="monokai" enableClipboard={false} indentWidth={2} collapseStringsAfterLength={20}/>
    );
  }
}

class EventList extends React.Component {
  render() {
    console.log(this.props.requests);
    return (
      Object.keys(this.props.requests).map((key) => 
        [
          <b>{this.props.requests[key].event_type}</b>,
          <EventElement event={this.props.requests[key]}/>
        ]
      )
    );
  }
}

class App extends Component {
  constructor(props) {
      super(props);
      this.state = {
          requests: {}
      };
  }

  componentDidMount() {
    getCurrentTab((tab) => {
      chrome.runtime.sendMessage({type: 'UIInit', tabId: tab.id}, (response) => {
        if (response) {
            if (typeof(response) != "string" ) {
              this.setState({
                  requests: Object.assign(this.state.requests, response)
              });
            }
          } 
      });
    });
  }

  render() {
    return (
      <div className="App">
        <h3>Rio Events</h3>
        {Object.keys(this.state.requests).length > 0 && (
          <EventList requests={this.state.requests}/>
        )}
      </div>
    );
  }
}

export default App;
