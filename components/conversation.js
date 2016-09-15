import React, {Component} from 'react';

import {connect} from 'react-redux';

import {
  View,
  Text,
} from 'react-native';

import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import ChatUsers from './ChatUsers';

import s from '../styles';
import {conversationActions} from '../actions';

import {subscribe} from '../services';

const channel = 'ReactChat';

export class UnconnectedConversation extends Component {
  render() {
    const {history, users} = this.props;

    const containerStyle = [
      s.flx1,
      s.flxCol,
      s.selfStretch,
    ];

    return (
      <View style={containerStyle}>
        <ChatUsers users={users} />
        <ChatHistory history={history} fetchHistory={this.fetchHistory.bind(this)} />
        <ChatInput />
      </View>
    );
  }

  componentDidMount() {
    subscribe(
      channel,
      this.onPresenceChange.bind(this),
      this.onMessageReceived.bind(this))
    .then(subscription => {
      this.subscription = subscription;
      this.fetchHistory();
    });

    window.addEventListener('beforeunload', () => this.leaveChat());
  }

  componentWillUnmount() {
    this.leaveChat();
  }

  leaveChat() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      delete this.subscription;
    }
  }

  onMessageReceived(message) {
    debugger;
  }

  onPresenceChange(presenceData) {
    debugger;

    switch (presenceData.action) {
      case 'join':
        this.props.addUser(presenceData.uuid);
        break;
      case 'leave':
      case 'timeout':
        this.props.removeUser(presenceData.uuid);
        break;
      case 'state-change':
        if (presenceData.state) {
          if (presenceData.state.isTyping === true) {
            this.props.startTyping(presenceData.uuid);
          }
          else {
            this.props.stopTyping(presenceData.uuid);
          }
        }
        break;
      default:
        break;
    }
  }

  fetchHistory() {
    throw new Error('Not implemented');
  }
}

UnconnectedConversation.propTypes = {};

const mapStateToProps = state => state.conversation.toJS();

const mapDispatchToProps = dispatch => ({
  addUser: userId => dispatch(conversationActions.addUser(userId)),
  removeUser: userId => dispatch(conversationActions.removeUser(userId)),
  startTyping: userId => dispatch(conversationActions.startTyping(userId)),
  stopTyping: userId => dispatch(conversationActions.stopTyping(userId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedConversation);
