import React from 'react';
import { connect } from 'react-redux';
import {
  View,
  FlatList,
  TouchableHighlight,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import { Fab, Container } from 'native-base';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-easy-toast';

import PropTypes from 'prop-types';
import Colors from '../../constants/Colors';
import { getAll } from '../../store/actions/contacts.actions';

const styles = StyleSheet.create({
  flatListItem: {
    height: 90,
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  contactSubtitle: {
    paddingTop: 6,
    fontWeight: '200',
    color: 'rgba(0,0,0,0.6)',
  },
  errorText: {
    textAlign: 'center',
    height: 100,
    padding: 20,
    color: 'rgba(0,0,0,0.4)',
  },
});

let toastError;

class ContactsScreen extends React.Component {
  static navigationOptions = {
    title: 'Contacts',
    headerLeft: null,
  };

  state = {
    contacts: [],
  };

  componentDidMount() {
    this.onRefresh();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const newState = {
      ...prevState,
      loading: nextProps.loading,
      contacts: nextProps.contacts,
    };
    return newState;
  }

  componentDidUpdate(prevProps) {
    const { error } = this.props;
    if (prevProps.error !== error && error) {
      toastError.show(
        <View>
          <Text style={{ fontWeight: 'bold' }}>Code: </Text>
          <Text>{error.code}</Text>
          <Text style={{ fontWeight: 'bold' }}>Message: </Text>
          <Text>{error.message}</Text>
        </View>,
        3000,
      );
    }
  }

  renderRow = item => (
    <TouchableHighlight
      onPress={() => this.goToContactDetailScreen(item)}
      style={styles.flatListItem}
      activeOpacity={1}
      key={item.toString()}
    >
      <View>
        <Text style={{ fontWeight: 'bold' }}>{item.post_title}</Text>
        <Text style={styles.contactSubtitle}>
          {`${item.overall_status.label} • ${item.seeker_path.label}`}
        </Text>
      </View>
    </TouchableHighlight>
  );

  flatListItemSeparator = () => (
    <View
      style={{
        height: 1,
        width: '100%',
        backgroundColor: '#dddddd',
      }}
    />
  );

  onRefresh = () => {
    this.props.getAllContacts(this.props.user.domain, this.props.user.token);
  };

  goToContactDetailScreen = (contactData = null) => {
    if (contactData) {
      // Detail
      this.props.navigation.push('ContactDetail', {
        contactId: contactData.ID,
        onlyView: true,
        contactName: contactData.post_title,
      });
    } else {
      // Create
      this.props.navigation.push('ContactDetail');
    }
  };

  render() {
    return (
      <Container>
        <View style={{ flex: 1 }}>
          <FlatList
            data={this.state.contacts}
            renderItem={item => this.renderRow(item.item)}
            ItemSeparatorComponent={this.flatListItemSeparator}
            refreshControl={(
              <RefreshControl
                refreshing={this.state.loading}
                onRefresh={this.onRefresh}
              />
            )}
            keyExtractor={item => item.ID.toString()}
          />
          <Fab
            style={{ backgroundColor: Colors.tintColor }}
            position="bottomRight"
            onPress={() => this.goToContactDetailScreen()}
          >
            <Icon name="md-add" />
          </Fab>
          <Toast
            ref={(toast) => {
              toastError = toast;
            }}
            style={{ backgroundColor: Colors.errorBackground }}
            position="center"
          />
        </View>
      </Container>
    );
  }
}

ContactsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  user: PropTypes.shape({
    domain: PropTypes.string,
    token: PropTypes.string,
  }).isRequired,
  getAllContacts: PropTypes.func.isRequired,
  /* eslint-disable */
  contacts: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.number
    })
  ).isRequired,
  /* eslint-enable */
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};
ContactsScreen.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  user: state.userReducer,
  contacts: state.contactsReducer.contacts,
  loading: state.contactsReducer.loading,
  error: state.contactsReducer.error,
});
const mapDispatchToProps = dispatch => ({
  getAllContacts: (domain, token) => {
    dispatch(getAll(domain, token));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ContactsScreen);
