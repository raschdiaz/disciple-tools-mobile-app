import React from 'react';
import {
  ScrollView,
  Keyboard,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  AsyncStorage,
} from 'react-native';
import {
  Label,
  Icon,
  Input,
  Container,
  Picker,
  Tabs,
  Tab,
  ScrollableTab,
  // DatePicker,
} from 'native-base';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Toast from 'react-native-easy-toast';
import { Col, Row, Grid } from 'react-native-easy-grid';
import KeyboardAccessory from 'react-native-sticky-keyboard-accessory';
import ModalFilterPicker from 'react-native-modal-filter-picker';
import { Chip, Selectize } from 'react-native-material-selectize';
import KeyboardShift from '../../components/KeyboardShift';

import {
  saveGroup,
  getById,
  getCommentsByGroup,
  saveComment,
  getActivitiesByGroup,
} from '../../store/actions/groups.actions';
import Colors from '../../constants/Colors';

import baptismIcon from '../../assets/icons/baptism.png';
import bibleStudyIcon from '../../assets/icons/word.png';
import communionIcon from '../../assets/icons/communion.png';
import fellowShipIcon from '../../assets/icons/fellowship.png';
import givingIcon from '../../assets/icons/giving.png';
import prayerIcon from '../../assets/icons/prayer.png';
import praiseIcon from '../../assets/icons/praise.png';
import sharingTheGospelIcon from '../../assets/icons/evangelism.png';
import leadersIcon from '../../assets/icons/leadership.png';
import circleIcon from '../../assets/icons/circle.png';
import dottedCircleIcon from '../../assets/icons/dotted-circle.png';

// let toastSuccess;
let toastError;
const containerPadding = 35;
const windowWidth = Dimensions.get('window').width;
const spacing = windowWidth * 0.025;
const sideSize = windowWidth - 2 * spacing;
const circleSideSize = windowWidth / 3;
/* eslint-disable */
let commentsFlatList, coachSelectizeRef, geonamesSelectizeRef, peopleGroupsSelectizeRef, parentGroupSelectizeRef, peerGroupsSelectizeRef, childGroupsSelectizeRef;
/* eslint-enable */
const styles = StyleSheet.create({
  toggleButton: {
    borderRadius: 5,
    height: '100%',
    margin: 5,
  },
  inputContactAddress: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D9D5DC',
    margin: 5,
  },
  activeImage: {
    opacity: 1,
    height: '100%',
    width: '100%',
  },
  inactiveImage: {
    opacity: 0.4,
    height: '100%',
    width: '100%',
  },
  toggleText: {
    textAlign: 'center',
  },
  activeToggleText: {
    color: '#000000',
    fontSize: 9,
  },
  inactiveToggleText: {
    color: '#D9D5DC',
    fontSize: 9,
  },
  tabBarUnderlineStyle: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.tintColor,
  },
  tabStyle: { backgroundColor: '#FFFFFF' },
  textStyle: { color: 'gray' },
  activeTabStyle: { backgroundColor: '#FFFFFF' },
  activeTextStyle: { color: Colors.tintColor, fontWeight: 'bold' },
  label: {
    color: Colors.tintColor,
    fontSize: 15,
  },
  addRemoveIcons: {
    fontSize: 30,
    color: 'black',
  },
  icons: {
    color: Colors.tintColor,
  },
  // Comments Section
  root: {
    backgroundColor: '#ffffff',
    flex: 1,
    marginBottom: 60,
  },
  container: {
    paddingLeft: 19,
    paddingRight: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    height: 16,
    marginTop: 10,
    width: 16,
  },
  content: {
    backgroundColor: '#F3F3F3',
    borderRadius: 5,
    flex: 1,
    marginLeft: 16,
    padding: 10,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    color: Colors.tintColor,
    fontSize: 13,
    fontWeight: 'bold',
  },
  time: {
    color: Colors.tintColor,
    fontSize: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  commentMessage: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  activityMessage: {
    paddingLeft: 10,
    paddingRight: 10,
    color: '#B4B4B4',
    fontStyle: 'italic',
  },
  // Form
  formContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: containerPadding,
    paddingRight: containerPadding,
  },
  formRow: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  formIconLabel: { width: 'auto' },
  formIcon: {
    color: Colors.tintColor,
    fontSize: 25,
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: 10,
  },
  formLabel: {
    color: Colors.tintColor,
    fontSize: 12,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  formDivider: {
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
    marginLeft: 5,
    marginRight: 5,
  },
});

function formatDateToBackEnd(dateValue) {
  if (dateValue) {
    if (typeof dateValue.getMonth === 'function') {
      let date = dateValue;
      let month = date.getMonth();
      month = month + 1 < 10 ? `0${month + 1}` : month + 1;
      let day = date.getDate();
      day = day < 10 ? `0${day}` : day;
      date = `${date.getFullYear()}-${month}-${day}`;
      return date;
    }
    if (typeof dateValue === 'string') {
      return dateValue;
    }
  }
  return null;
}

class GroupDetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;

    let navigationTitle = 'Add New Group';
    let headerRight = (
      <Icon
        type="MaterialCommunityIcons"
        name="account-check"
        onPress={navigation.getParam('onSaveGroup')}
        style={{
          paddingRight: 16,
          color: '#FFFFFF',
        }}
      />
    );

    if (params) {
      if (params.groupName) {
        navigationTitle = params.groupName;
      }
      if (params.onlyView) {
        headerRight = (
          <Icon
            type="MaterialIcons"
            name="create"
            onPress={navigation.getParam('onEnableEdit')}
            style={{
              paddingRight: 16,
              color: '#FFFFFF',
            }}
          />
        );
      }
    }

    return {
      title: navigationTitle,
      headerLeft: (
        <Icon
          type="MaterialIcons"
          name="arrow-back"
          onPress={() => navigation.push('GroupList')}
          style={[{ paddingLeft: 16, color: '#FFFFFF' }]}
        />
      ),
      headerRight,
      headerStyle: {
        backgroundColor: Colors.tintColor,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    };
  };

  state = {
    group: {
      ID: null,
      contact_address: [],
    },
    onlyView: false,
    loadedLocal: false,
    dataRetrieved: false,
    comment: '',
    users: [],
    usersContacts: [],
    geonames: [],
    peopleGroups: [],
    groups: [],
    comments: [],
    activities: [],
    showAssignedToModal: false,
    overallStatusBackgroundColor: '#ffffff',
  };

  componentDidMount() {
    this.getLists();
    this.props.navigation.setParams({ onSaveGroup: this.onSaveGroup });
    this.props.navigation.setParams({ onEnableEdit: this.onEnableEdit });
    const groupId = this.props.navigation.getParam('groupId');
    const onlyView = this.props.navigation.getParam('onlyView');
    const groupName = this.props.navigation.getParam('groupName');
    if (groupId) {
      this.setState(prevState => ({
        group: {
          ...prevState.group,
          ID: groupId,
        },
      }));
      this.props.navigation.setParams({ groupName });
      this.getGroupById(groupId);
      this.getGroupComments(groupId);
    }
    if (onlyView) {
      this.setState({
        onlyView,
      });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      group,
      comments,
      activities,
      newComment,
    } = nextProps;
    let newState = {
      ...prevState,
      group: group || prevState.group,
      comments: comments || prevState.comments,
      activities: activities || prevState.activities,
    };


    // NEW COMMENT
    if (newComment) {
      const newComments = newState.comments;
      newComments.push(newComment);
      newState = {
        ...newState,
        comments: newComments,
        comment: '',
      };
    }

    // GET BY ID
    if (newState.group && newState.group.ID && !prevState.dataRetrieved) {
      newState = {
        ...newState,
        dataRetrieved: true,
      };
    }

    return newState;
  }

  componentDidUpdate(prevProps) {
    const {
      userReducerError, group, navigation, newComment, groupsReducerError,
    } = this.props;

    // ERROR
    const usersError = (prevProps.userReducerError !== userReducerError && userReducerError);
    let groupsError = (prevProps.groupsReducerError !== groupsReducerError);
    groupsError = (groupsError && groupsReducerError);
    if (usersError || groupsError) {
      const error = userReducerError || groupsReducerError;
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

    // GROUP SAVE
    if (group && prevProps.group !== group) {
      if (group.ID) {
        navigation.setParams({ groupName: group.title });
      }
      if (group.group_status) {
        this.setGroupStatus(group.group_status);
      }
      this.getGroupComments(group.ID);
      this.getGroupActivities(group.ID);
      // toastSuccess.show('Group Saved!', 2000);
    }

    // NEW COMMENT
    if (newComment && prevProps.newComment !== newComment) {
      Keyboard.dismiss();
    }
  }

  getLists = async () => {
    let newState = {};
    const users = await AsyncStorage.getItem('usersList');
    if (users !== null) {
      newState = {
        ...newState,
        users: JSON.parse(users).map(user => ({
          key: user.ID,
          label: user.name,
        })),
      };
    }

    const usersContacts = await AsyncStorage.getItem('usersAndContactsList');
    if (usersContacts !== null) {
      newState = {
        ...newState,
        usersContacts: JSON.parse(usersContacts),
      };
    }

    const peopleGroups = await AsyncStorage.getItem('peopleGroupsList');
    if (peopleGroups !== null) {
      newState = {
        ...newState,
        peopleGroups: JSON.parse(peopleGroups),
      };
    }

    const geonames = await AsyncStorage.getItem('locationsList');
    if (geonames !== null) {
      newState = {
        ...newState,
        geonames: JSON.parse(geonames),
      };
    }

    const groups = await AsyncStorage.getItem('searchGroupsList');
    if (groups !== null) {
      newState = {
        ...newState,
        groups: JSON.parse(groups),
      };
    }

    newState = {
      ...newState,
      loadedLocal: true,
    };
    this.setState(newState);
  };

  getGroupById(groupId) {
    this.props.getById(this.props.user.domain, this.props.user.token, groupId);
  }

  getGroupComments(groupId) {
    this.props.getComments(
      this.props.user.domain,
      this.props.user.token,
      groupId,
    );
  }

  getGroupActivities(groupId) {
    this.props.getActivities(
      this.props.user.domain,
      this.props.user.token,
      groupId,
    );
  }

  renderActivityOrCommentRow = commentOrActivity => (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={{ uri: commentOrActivity.gravatar }}
      />
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          {Object.prototype.hasOwnProperty.call(
            commentOrActivity,
            'content',
          ) && (
          <Grid>
            <Row>
              <Col>
                <Text style={styles.name}>{commentOrActivity.author}</Text>
              </Col>
              <Col style={{ width: 80 }}>
                <Text style={styles.time}>
                  {this.onFormatDateToView(commentOrActivity.date)}
                </Text>
              </Col>
            </Row>
          </Grid>
          )}
          {Object.prototype.hasOwnProperty.call(
            commentOrActivity,
            'object_note',
          ) && (
          <Grid>
            <Row>
              <Col>
                <Text style={styles.name}>{commentOrActivity.name}</Text>
              </Col>
              <Col style={{ width: 80 }}>
                <Text style={styles.time}>
                  {this.onFormatDateToView(commentOrActivity.date)}
                </Text>
              </Col>
            </Row>
          </Grid>
          )}
        </View>
        <Text
          style={
            commentOrActivity.content
              ? styles.commentMessage
              : styles.activityMessage
          }
        >
          {Object.prototype.hasOwnProperty.call(commentOrActivity, 'content')
            ? commentOrActivity.content
            : commentOrActivity.object_note}
        </Text>
      </View>
    </View>
  );

  onEnableEdit = () => {
    this.setState({
      onlyView: false,
    });
    this.props.navigation.setParams({ onlyView: false });
  };

  setGroupName = (value) => {
    this.setState(prevState => ({
      group: {
        ...prevState.group,
        title: value,
      },
    }));
  };

  setGroupType = (value) => {
    this.setState(prevState => ({
      group: {
        ...prevState.group,
        group_type: value,
      },
    }));
  };

  setGroupStatus = (value) => {
    let newColor = '';

    if (value === 'inactive') {
      newColor = '#d9534f';
    } else if (value === 'active') {
      newColor = '#5cb85c';
    }

    this.setState(prevState => ({
      group: {
        ...prevState.group,
        group_status: value,
      },
      overallStatusBackgroundColor: newColor,
    }));
  };

  setGroupStartDate = (value) => {
    this.setState(prevState => ({
      group: {
        ...prevState.group,
        start_date: value,
      },
    }));
  };

  setEndDate = (value) => {
    this.setState(prevState => ({
      group: {
        ...prevState.group,
        end_date: value,
      },
    }));
  };

  updateShowAssignedToModal = (value) => {
    this.setState({
      showAssignedToModal: value,
    });
  };

  onSelectAssignedTo = (key) => {
    this.setState(prevState => ({
      group: {
        ...prevState.group,
        assigned_to: `user-${key}`,
      },
      showAssignedToModal: false,
    }));
  };

  onCancelAssignedTo = () => {
    this.setState({
      showAssignedToModal: false,
    });
  };

  onAddAddressField = () => {
    const contactAddress = this.state.group.contact_address;
    contactAddress.push({
      value: '',
    });
    this.setState(prevState => ({
      group: {
        ...prevState.group,
        contact_address: contactAddress,
      },
    }));
  };

  onAddressFieldChange = (value, index, dbIndex, component) => {
    const contactAddressList = component.state.group.contact_address;
    const contactAddress = contactAddressList[index];
    contactAddress.value = value;
    if (dbIndex) {
      contactAddress.key = dbIndex;
    }
    component.setState(prevState => ({
      ...prevState,
      group: {
        ...prevState.group,
        contact_address: contactAddressList,
      },
    }));
  };

  onRemoveAddressField = (index, component) => {
    const contactAddressList = [...component.state.group.contact_address];
    let contactAddress = contactAddressList[index];
    if (contactAddress.key) {
      contactAddress = {
        key: contactAddress.key,
        delete: true,
      };
      contactAddressList[index] = contactAddress;
    } else {
      contactAddressList.splice(index, 1);
    }
    component.setState(prevState => ({
      ...prevState,
      group: {
        ...prevState.group,
        contact_address: contactAddressList,
      },
    }));
  };

  onCheckExistingHealthMetric = (metricName) => {
    const healthMetrics = this.state.group.health_metrics
      ? this.state.group.health_metrics.values
      : [];
    const foundhealthMetric = healthMetrics.some(
      metric => metric.value === metricName,
    );
    return foundhealthMetric;
  };

  onHealthMetricChange = (metricName) => {
    const healthMetrics2 = this.state.group.health_metrics
      ? this.state.group.health_metrics.values
      : [];
    const foundhealthMetric = healthMetrics2.find(
      metric => metric.value === metricName,
    );
    if (foundhealthMetric) {
      const healthMetricIndex = healthMetrics2.indexOf(foundhealthMetric);
      healthMetrics2.splice(healthMetricIndex, 1);
    } else {
      healthMetrics2.push({
        value: metricName,
      });
    }
    this.setState(prevState => ({
      group: {
        ...prevState.group,
        health_metrics: {
          values: healthMetrics2,
        },
      },
    }));
  };

  setCoaches = () => {
    const dbCoaches = [...this.state.group.coaches.values];

    const lclCoaches = [];
    const selectedValues = this.coachSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const coach = selectedValues.entities.item[itemValue];
      lclCoaches.push(coach);
    });

    const coachToSave = lclCoaches.filter((lclCoach) => {
      const foundLocalInDb = dbCoaches.find(dbCoach => dbCoach.value === lclCoach.value);
      return foundLocalInDb === undefined;
    }).map(coach => ({ value: coach.value }));

    dbCoaches.forEach((dbCoach) => {
      const dbInLocal = lclCoaches.find(lclCoach => dbCoach.value === lclCoach.value);
      if (!dbInLocal) {
        coachToSave.push({ value: dbCoach.value, delete: true });
      }
    });

    return coachToSave;
  };

  setGeonames = () => {
    const dbGeonames = [...this.state.group.geonames.values];

    const localGeonames = [];
    const selectedValues = this.geonamesSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const geoname = selectedValues.entities.item[itemValue];
      localGeonames.push(geoname);
    });

    const geonamesToSave = localGeonames.filter((localGeoname) => {
      const foundLocalInDb = dbGeonames.find(dbGeoname => dbGeoname.value === localGeoname.value);
      return foundLocalInDb === undefined;
    }).map(geoname => ({ value: geoname.value }));

    dbGeonames.forEach((dbGeoname) => {
      const dbInLocal = localGeonames.find(localGeoname => dbGeoname.value === localGeoname.value);
      if (!dbInLocal) {
        geonamesToSave.push({ value: dbGeoname.value, delete: true });
      }
    });

    return geonamesToSave;
  };

  setPeopleGroups = () => {
    const dbPGs = [...this.state.group.people_groups.values];

    const lclPGs = [];
    const selectedValues = this.peopleGroupsSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const peopleGroup = selectedValues.entities.item[itemValue];
      lclPGs.push(peopleGroup);
    });

    const peopleGroupsToSave = lclPGs.filter((lclPG) => {
      const foundLocalInDb = dbPGs.find(dbPG => dbPG.value === lclPG.value);
      return foundLocalInDb === undefined;
    }).map(peopleGroup => ({ value: peopleGroup.value }));

    dbPGs.forEach((dbPG) => {
      const dbInLocal = lclPGs.find(lclPG => dbPG.value === lclPG.value);
      if (!dbInLocal) {
        peopleGroupsToSave.push({ value: dbPG.value, delete: true });
      }
    });

    return peopleGroupsToSave;
  };

  setComment = (value) => {
    this.setState({
      comment: value,
    });
  };

  setParentGroups = () => {
    const dbPGs = [...this.state.group.parent_groups.values];

    const lclPGs = [];
    const selectedValues = this.parentGroupSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const parentGroup = selectedValues.entities.item[itemValue];
      lclPGs.push(parentGroup);
    });

    const parentGroupsToSave = lclPGs.filter((lclPG) => {
      const foundLocalInDb = dbPGs.find(dbPG => dbPG.value === lclPG.value);
      return foundLocalInDb === undefined;
    }).map(parentGroup => ({ value: parentGroup.value }));

    dbPGs.forEach((dbPG) => {
      const dbInLocal = lclPGs.find(lclPG => dbPG.value === lclPG.value);
      if (!dbInLocal) {
        parentGroupsToSave.push({ value: dbPG.value, delete: true });
      }
    });

    return parentGroupsToSave;
  }

  setPeerGroups = () => {
    const dbPGs = [...this.state.group.peer_groups.values];

    const lclPGs = [];
    const selectedValues = this.peerGroupsSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const peerGroup = selectedValues.entities.item[itemValue];
      lclPGs.push(peerGroup);
    });

    const peerGroupsToSave = lclPGs.filter((lclPG) => {
      const foundLocalInDb = dbPGs.find(dbPG => dbPG.value === lclPG.value);
      return foundLocalInDb === undefined;
    }).map(peerGroup => ({ value: peerGroup.value }));

    dbPGs.forEach((dbPG) => {
      const dbInLocal = lclPGs.find(lclPG => dbPG.value === lclPG.value);
      if (!dbInLocal) {
        peerGroupsToSave.push({ value: dbPG.value, delete: true });
      }
    });

    return peerGroupsToSave;
  }

  setChildGroups = () => {
    const dbCGs = [...this.state.group.child_groups.values];

    const lclCGs = [];
    const selectedValues = this.childGroupsSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const childGroup = selectedValues.entities.item[itemValue];
      lclCGs.push(childGroup);
    });

    const childGroupsToSave = lclCGs.filter((lclPG) => {
      const foundLocalInDb = dbCGs.find(dbPG => dbPG.value === lclPG.value);
      return foundLocalInDb === undefined;
    }).map(childGroup => ({ value: childGroup.value }));

    dbCGs.forEach((dbPG) => {
      const dbInLocal = lclCGs.find(lclPG => dbPG.value === lclPG.value);
      if (!dbInLocal) {
        childGroupsToSave.push({ value: dbPG.value, delete: true });
      }
    });

    return childGroupsToSave;
  }

  onSaveGroup = () => {
    Keyboard.dismiss();
    const groupToSave = JSON.parse(JSON.stringify(this.state.group));
    if (Object.prototype.hasOwnProperty.call(groupToSave, 'start_date')) {
      groupToSave.start_date = formatDateToBackEnd(groupToSave.start_date);
    }
    if (Object.prototype.hasOwnProperty.call(groupToSave, 'end_date')) {
      groupToSave.end_date = formatDateToBackEnd(groupToSave.end_date);
    }
    if (Object.prototype.hasOwnProperty.call(groupToSave, 'coaches') && this.coachSelectizeRef) {
      groupToSave.coaches.values = this.setCoaches();
    }
    if (Object.prototype.hasOwnProperty.call(groupToSave, 'geonames') && this.geonamesSelectizeRef) {
      groupToSave.geonames.values = this.setGeonames();
    }
    if (Object.prototype.hasOwnProperty.call(groupToSave, 'people_groups') && this.pplGroupsSelectizeRef) {
      groupToSave.people_groups.values = this.setPeopleGroups();
    }
    if (Object.prototype.hasOwnProperty.call(groupToSave, 'parent_groups') && this.parentGroupSelectizeRef) {
      groupToSave.parent_groups.values = this.setParentGroups();
    }
    if (Object.prototype.hasOwnProperty.call(groupToSave, 'peer_groups') && this.peerGroupsSelectizeRef) {
      groupToSave.peer_groups.values = this.setPeerGroups();
    }
    if (Object.prototype.hasOwnProperty.call(groupToSave, 'child_groups') && this.childGroupsSelectizeRef) {
      groupToSave.child_groups.values = this.setChildGroups();
    }

    this.props.saveGroup(
      this.props.user.domain,
      this.props.user.token,
      groupToSave,
    );
  };

  onFormatDateToView = (date) => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const newDate = new Date(date);
    let hours = newDate.getHours();
    let minutes = newDate.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours %= 12;
    hours = hours || 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    return `${monthNames[newDate.getMonth()]} ${newDate.getDate()}, ${strTime}`;
  };

  onSaveComment = () => {
    const { comment } = this.state;

    if (comment.length > 0) {
      this.props.saveComment(
        this.props.user.domain,
        this.props.user.token,
        this.state.group.ID,
        {
          comment,
        },
      );
    }
  };

  tabChanged = (event) => {
    this.props.navigation.setParams({ hideTabBar: event.i === 2 });
  };

  showAssignedUser = () => {
    const foundUser = this.state.users.find(
      user => `user-${user.key}` === this.state.group.assigned_to,
    );
    return <Text>{foundUser ? foundUser.label : ''}</Text>;
  };

  render() {
    /* const successToast = (
      <Toast
        ref={(toast) => {
          toastSuccess = toast;
        }}
        style={{ backgroundColor: 'green' }}
        position="center"
      />
    ); */
    const errorToast = (
      <Toast
        ref={(toast) => {
          toastError = toast;
        }}
        style={{ backgroundColor: Colors.errorBackground }}
        position="center"
      />
    );

    /**
     * <DatePicker
                              defaultDate={this.state.group.start_date}
                              disabled={this.state.onlyView}
                              onDateChange={this.setGroupStartDate}
                            />

       <DatePicker
                              defaultDate={this.state.group.end_date}
                              disabled={this.state.onlyView}
                              onDateChange={this.setEndDate}
                            />


                            <View>
                                    <Text>
                                      {parentGroup.name}
                                    </Text>
                                    <Text>
                                      {parentGroup.value}
                                    </Text>
                                  </View>


     */

    // Validation to render DatePickers with initial value
    return (
      <Container>
        {this.state.group.ID && this.state.loadedLocal && this.state.dataRetrieved && (
          <Tabs
            renderTabBar={() => <ScrollableTab />}
            tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
            onChangeTab={this.tabChanged}
          >
            <Tab
              heading="Details"
              tabStyle={styles.tabStyle}
              textStyle={styles.textStyle}
              activeTabStyle={styles.activeTabStyle}
              activeTextStyle={styles.activeTextStyle}
            >
              <KeyboardShift>
                {() => (
                  <ScrollView keyboardShouldPersistTaps="handled">
                    <View
                      style={{
                        paddingLeft: containerPadding - 15,
                        paddingRight: containerPadding - 15,
                        marginTop: 20,
                      }}
                      pointerEvents={this.state.onlyView ? 'none' : 'auto'}
                    >
                      <Label style={[styles.formLabel, { fontWeight: 'bold' }]}>
                        Status
                      </Label>
                      <Row style={styles.formRow}>
                        <Col>
                          <Picker
                            selectedValue={this.state.group.group_status}
                            onValueChange={this.setGroupStatus}
                            style={{
                              color: '#FFFFFF',
                              backgroundColor: this.state
                                .overallStatusBackgroundColor,
                            }}
                          >
                            <Picker.Item label="Active" value="active" />
                            <Picker.Item label="Inactive" value="inactive" />
                          </Picker>
                        </Col>
                      </Row>
                    </View>
                    <View
                      style={styles.formContainer}
                      pointerEvents={this.state.onlyView ? 'none' : 'auto'}
                    >
                      <Grid>
                        <TouchableOpacity
                          onPress={() => {
                            this.updateShowAssignedToModal(true);
                          }}
                        >
                          <Row style={styles.formRow}>
                            <Col style={styles.formIconLabel}>
                              <Icon
                                type="FontAwesome"
                                name="user-circle"
                                style={styles.formIcon}
                              />
                            </Col>
                            <Col>
                              {this.showAssignedUser()}
                              <ModalFilterPicker
                                visible={this.state.showAssignedToModal}
                                onSelect={this.onSelectAssignedTo}
                                onCancel={this.onCancelAssignedTo}
                                options={this.state.users}
                              />
                            </Col>
                            <Col style={styles.formIconLabel}>
                              <Label style={styles.formLabel}>
                                Assigned to
                              </Label>
                            </Col>
                          </Row>
                          <View style={styles.formDivider} />
                        </TouchableOpacity>
                        <Row style={styles.formRow}>
                          <Col style={styles.formIconLabel}>
                            <Icon
                              type="FontAwesome"
                              name="black-tie"
                              style={styles.formIcon}
                            />
                          </Col>
                          <Col />
                          <Col style={styles.formIconLabel}>
                            <Label style={styles.formLabel}>
                              Group Coach
                            </Label>
                          </Col>
                        </Row>
                        <Row>
                          <Col style={{ paddingLeft: 10, paddingRight: 10 }}>
                            <Selectize
                              ref={(selectize) => { this.coachSelectizeRef = selectize; }}
                              itemId="value"
                              items={this.state.usersContacts}
                              selectedItems={this.state.group.coaches.values}
                              textInputProps={{
                                placeholder: 'Select coaches',
                              }}
                              renderRow={(id, onPress, item) => (
                                <TouchableOpacity
                                  activeOpacity={0.6}
                                  key={id}
                                  onPress={onPress}
                                  style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                  }}
                                >
                                  <View style={{
                                    flexDirection: 'row',
                                  }}
                                  >
                                    <Text style={{
                                      color: 'rgba(0, 0, 0, 0.87)',
                                      fontSize: 14,
                                      lineHeight: 21,
                                    }}
                                    >
                                      {item.name}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              )}
                              renderChip={(id, onClose, item, style, iconStyle) => (
                                <Chip
                                  key={id}
                                  iconStyle={iconStyle}
                                  onClose={onClose}
                                  text={item.name}
                                  style={style}
                                />
                              )}
                              filterOnKey="name"
                              keyboardShouldPersistTaps
                              inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                            />
                          </Col>
                        </Row>
                        <View style={styles.formDivider} />
                        <Row style={styles.formRow}>
                          <Col style={styles.formIconLabel}>
                            <Icon
                              type="FontAwesome"
                              name="map-marker"
                              style={styles.formIcon}
                            />
                          </Col>
                          <Col />
                          <Col style={styles.formIconLabel}>
                            <Label style={styles.formLabel}>
                              Locations
                            </Label>
                          </Col>
                        </Row>
                        <Row>
                          <Col style={{ paddingLeft: 10, paddingRight: 10 }}>
                            <Selectize
                              ref={(selectize) => { this.geonamesSelectizeRef = selectize; }}
                              itemId="value"
                              items={this.state.geonames}
                              selectedItems={this.state.group.geonames.values}
                              textInputProps={{
                                placeholder: 'Select geonames',
                              }}
                              renderRow={(id, onPress, item) => (
                                <TouchableOpacity
                                  activeOpacity={0.6}
                                  key={id}
                                  onPress={onPress}
                                  style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                  }}
                                >
                                  <View style={{
                                    flexDirection: 'row',
                                  }}
                                  >
                                    <Text style={{
                                      color: 'rgba(0, 0, 0, 0.87)',
                                      fontSize: 14,
                                      lineHeight: 21,
                                    }}
                                    >
                                      {item.name}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              )}
                              renderChip={(id, onClose, item, style, iconStyle) => (
                                <Chip
                                  key={id}
                                  iconStyle={iconStyle}
                                  onClose={onClose}
                                  text={item.name}
                                  style={style}
                                />
                              )}
                              filterOnKey="name"
                              keyboardShouldPersistTaps
                              inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                            />
                          </Col>
                        </Row>
                        <View style={styles.formDivider} />
                        <Row style={styles.formRow}>
                          <Col style={styles.formIconLabel}>
                            <Icon
                              type="FontAwesome"
                              name="globe"
                              style={styles.formIcon}
                            />
                          </Col>
                          <Col />
                          <Col style={styles.formIconLabel}>
                            <Label style={styles.formLabel}>
                              People Groups
                            </Label>
                          </Col>
                        </Row>
                        <Row>
                          <Col style={{ paddingLeft: 10, paddingRight: 10 }}>
                            <Selectize
                              ref={(selectize) => { this.peopleGroupsSelectizeRef = selectize; }}
                              itemId="value"
                              items={this.state.peopleGroups}
                              selectedItems={this.state.group.people_groups.values}
                              textInputProps={{
                                placeholder: 'Select people groups',
                              }}
                              renderRow={(id, onPress, item) => (
                                <TouchableOpacity
                                  activeOpacity={0.6}
                                  key={id}
                                  onPress={onPress}
                                  style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                  }}
                                >
                                  <View style={{
                                    flexDirection: 'row',
                                  }}
                                  >
                                    <Text style={{
                                      color: 'rgba(0, 0, 0, 0.87)',
                                      fontSize: 14,
                                      lineHeight: 21,
                                    }}
                                    >
                                      {item.name}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              )}
                              renderChip={(id, onClose, item, style, iconStyle) => (
                                <Chip
                                  key={id}
                                  iconStyle={iconStyle}
                                  onClose={onClose}
                                  text={item.name}
                                  style={style}
                                />
                              )}
                              filterOnKey="name"
                              keyboardShouldPersistTaps
                              inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                            />
                          </Col>
                        </Row>
                        <View style={styles.formDivider} />
                        <Row style={styles.formRow}>
                          <Col style={styles.formIconLabel}>
                            <Icon
                              type="Entypo"
                              name="home"
                              style={styles.formIcon}
                            />
                          </Col>
                          <Col>
                            <Row>
                              <View style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    textAlign: 'right',
                                    paddingRight: 10,
                                  }}
                                >
                                  <Icon
                                    android="md-add"
                                    ios="ios-add"
                                    onPress={this.onAddAddressField}
                                    style={styles.addRemoveIcons}
                                  />
                                </Text>
                              </View>
                            </Row>
                          </Col>
                          <Col style={styles.formIconLabel}>
                            <Label style={styles.formLabel}>Address</Label>
                          </Col>
                        </Row>
                        {this.state.group.contact_address.map(
                          (address, index) => {
                            if (!address.delete) {
                              return (
                                <Row
                                  key={index.toString()}
                                  style={styles.formRow}
                                >
                                  <Col>
                                    <Input
                                      multiline
                                      value={address.value}
                                      onChangeText={(value) => {
                                        this.onAddressFieldChange(
                                          value,
                                          index,
                                          address.key,
                                          this,
                                        );
                                      }}
                                      style={styles.inputContactAddress}
                                    />
                                  </Col>
                                  <Col style={styles.formIconLabel}>
                                    <Icon
                                      android="md-remove"
                                      ios="ios-remove"
                                      onPress={() => {
                                        this.onRemoveAddressField(index, this);
                                      }}
                                      style={[
                                        styles.addRemoveIcons,
                                        {
                                          paddingLeft: 10,
                                          paddingRight: 10,
                                        },
                                      ]}
                                    />
                                  </Col>
                                </Row>
                              );
                            }
                            return '';
                          },
                        )}
                        <View style={styles.formDivider} />
                        <Row style={styles.formRow}>
                          <Col style={styles.formIconLabel}>
                            <Icon
                              type="MaterialCommunityIcons"
                              name="calendar-import"
                              style={styles.formIcon}
                            />
                          </Col>
                          <Col />
                          <Col style={styles.formIconLabel}>
                            <Label style={styles.formLabel}>Start Date</Label>
                          </Col>
                        </Row>
                        <View style={styles.formDivider} />
                        <Row style={styles.formRow}>
                          <Col style={styles.formIconLabel}>
                            <Icon
                              type="MaterialCommunityIcons"
                              name="calendar-export"
                              style={styles.formIcon}
                            />
                          </Col>
                          <Col />
                          <Col style={styles.formIconLabel}>
                            <Label style={styles.formLabel}>End Date</Label>
                          </Col>
                        </Row>
                        <View style={styles.formDivider} />
                      </Grid>
                    </View>
                  </ScrollView>
                )}
              </KeyboardShift>
            </Tab>
            <Tab
              heading="Progress"
              tabStyle={styles.tabStyle}
              textStyle={styles.textStyle}
              activeTabStyle={styles.activeTabStyle}
              activeTextStyle={styles.activeTextStyle}
            >
              <ScrollView>
                <View
                  style={styles.formContainer}
                  pointerEvents={this.state.onlyView ? 'none' : 'auto'}
                >
                  <Grid>
                    <Row style={styles.formRow}>
                      <Col style={styles.formIconLabel}>
                        <Icon
                          android="md-people"
                          ios="ios-people"
                          style={styles.formIcon}
                        />
                      </Col>
                      <Col>
                        <Picker
                          mode="dropdown"
                          selectedValue={this.state.group.group_type}
                          onValueChange={this.setGroupType}
                        >
                          <Picker.Item label="Pre-Group" value="pre-group" />
                          <Picker.Item label="Group" value="group" />
                          <Picker.Item label="Church" value="church" />
                          <Picker.Item label="Team" value="team" />
                        </Picker>
                      </Col>
                      <Col style={styles.formIconLabel}>
                        <Label style={styles.formLabel}>Group Type</Label>
                      </Col>
                    </Row>
                    <View style={styles.formDivider} />
                  </Grid>
                </View>
                <Grid>
                  <Row style={{ height: spacing }} />
                  <Row style={{ height: sideSize }}>
                    <Col style={{ width: spacing }} />
                    <Col style={{ width: sideSize }}>
                      <Image
                        source={circleIcon}
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                          position: 'absolute',
                          height: '95%',
                          width: '95%',
                          marginTop: '2%',
                          marginRight: '2%',
                          marginBottom: '2%',
                          marginLeft: '2%',
                        }}
                      />
                      <Image
                        source={dottedCircleIcon}
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                          position: 'absolute',
                          height: '100%',
                          width: '100%',
                        }}
                      />
                      <Row style={{ height: sideSize * 0.1 }} />
                      <Row style={{ height: sideSize * 0.8 }}>
                        <Row style={{ height: sideSize * 0.8 }}>
                          <Col style={{ width: sideSize * 0.1 }} />
                          <Col style={{ width: sideSize * 0.8 }}>
                            <Row size={5}>
                              <Col size={2} />
                              <Col size={3}>
                                <Row size={1} />
                                <Row size={4}>
                                  <Col>
                                    <Row size={60}>
                                      <Col>
                                        <TouchableOpacity
                                          onPress={() => {
                                            this.onHealthMetricChange(
                                              'church_giving',
                                            );
                                          }}
                                          activeOpacity={1}
                                        >
                                          <Image
                                            source={givingIcon}
                                            style={
                                              this.onCheckExistingHealthMetric(
                                                'church_giving',
                                              )
                                                ? styles.activeImage
                                                : styles.inactiveImage
                                            }
                                          />
                                        </TouchableOpacity>
                                      </Col>
                                    </Row>
                                    <Row
                                      size={40}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          this.onCheckExistingHealthMetric(
                                            'church_giving',
                                          )
                                            ? styles.activeToggleText
                                            : styles.inactiveToggleText,
                                        ]}
                                      >
                                        Giving
                                      </Text>
                                    </Row>
                                  </Col>
                                </Row>
                              </Col>
                              <Col size={2} />
                              <Col size={3}>
                                <Row size={6}>
                                  <Col size={100}>
                                    <Row size={60}>
                                      <Col>
                                        <TouchableOpacity
                                          onPress={() => {
                                            this.onHealthMetricChange(
                                              'church_fellowship',
                                            );
                                          }}
                                          activeOpacity={1}
                                        >
                                          <Image
                                            source={fellowShipIcon}
                                            style={
                                              this.onCheckExistingHealthMetric(
                                                'church_fellowship',
                                              )
                                                ? styles.activeImage
                                                : styles.inactiveImage
                                            }
                                          />
                                        </TouchableOpacity>
                                      </Col>
                                    </Row>
                                    <Row
                                      size={40}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          this.onCheckExistingHealthMetric(
                                            'church_fellowship',
                                          )
                                            ? styles.activeToggleText
                                            : styles.inactiveToggleText,
                                        ]}
                                      >
                                        Fellowship
                                      </Text>
                                    </Row>
                                  </Col>
                                </Row>
                                <Row size={1} />
                              </Col>
                              <Col size={2} />
                              <Col size={3}>
                                <Row size={1} />
                                <Row size={4}>
                                  <Col>
                                    <Row size={60}>
                                      <Col>
                                        <TouchableOpacity
                                          onPress={() => {
                                            this.onHealthMetricChange(
                                              'church_communion',
                                            );
                                          }}
                                          activeOpacity={1}
                                        >
                                          <Image
                                            source={communionIcon}
                                            style={
                                              this.onCheckExistingHealthMetric(
                                                'church_communion',
                                              )
                                                ? styles.activeImage
                                                : styles.inactiveImage
                                            }
                                          />
                                        </TouchableOpacity>
                                      </Col>
                                    </Row>
                                    <Row
                                      size={40}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          this.onCheckExistingHealthMetric(
                                            'church_communion',
                                          )
                                            ? styles.activeToggleText
                                            : styles.inactiveToggleText,
                                        ]}
                                      >
                                        Communion
                                      </Text>
                                    </Row>
                                  </Col>
                                </Row>
                              </Col>
                              <Col size={2} />
                            </Row>

                            <Row size={7} style={{ backgroundColor: 'white' }}>
                              <Col size={3}>
                                <Row
                                  size={2}
                                  style={{ backgroundColor: 'white' }}
                                />
                                <Row size={6}>
                                  <Col>
                                    <Row size={60}>
                                      <Col>
                                        <TouchableOpacity
                                          onPress={() => {
                                            this.onHealthMetricChange(
                                              'church_baptism',
                                            );
                                          }}
                                          activeOpacity={1}
                                        >
                                          <Image
                                            source={baptismIcon}
                                            style={
                                              this.onCheckExistingHealthMetric(
                                                'church_baptism',
                                              )
                                                ? styles.activeImage
                                                : styles.inactiveImage
                                            }
                                          />
                                        </TouchableOpacity>
                                      </Col>
                                    </Row>
                                    <Row
                                      size={40}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          this.onCheckExistingHealthMetric(
                                            'church_baptism',
                                          )
                                            ? styles.activeToggleText
                                            : styles.inactiveToggleText,
                                        ]}
                                      >
                                        Baptism
                                      </Text>
                                    </Row>
                                  </Col>
                                </Row>
                                <Row size={2} />
                              </Col>
                              <Col size={4} />
                              <Col size={3}>
                                <Row size={2} />
                                <Row size={6}>
                                  <Col>
                                    <Row size={60}>
                                      <Col>
                                        <TouchableOpacity
                                          onPress={() => {
                                            this.onHealthMetricChange(
                                              'church_prayer',
                                            );
                                          }}
                                          activeOpacity={1}
                                        >
                                          <Image
                                            source={prayerIcon}
                                            style={
                                              this.onCheckExistingHealthMetric(
                                                'church_prayer',
                                              )
                                                ? styles.activeImage
                                                : styles.inactiveImage
                                            }
                                          />
                                        </TouchableOpacity>
                                      </Col>
                                    </Row>
                                    <Row
                                      size={40}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          this.onCheckExistingHealthMetric(
                                            'church_prayer',
                                          )
                                            ? styles.activeToggleText
                                            : styles.inactiveToggleText,
                                        ]}
                                      >
                                        Prayer
                                      </Text>
                                    </Row>
                                  </Col>
                                </Row>
                                <Row size={2} />
                              </Col>
                              <Col size={4} />
                              <Col size={3}>
                                <Row size={2} />
                                <Row size={6}>
                                  <Col>
                                    <Row size={60}>
                                      <Col>
                                        <TouchableOpacity
                                          onPress={() => {
                                            this.onHealthMetricChange(
                                              'church_leaders',
                                            );
                                          }}
                                          activeOpacity={1}
                                        >
                                          <Image
                                            source={leadersIcon}
                                            style={
                                              this.onCheckExistingHealthMetric(
                                                'church_leaders',
                                              )
                                                ? styles.activeImage
                                                : styles.inactiveImage
                                            }
                                          />
                                        </TouchableOpacity>
                                      </Col>
                                    </Row>
                                    <Row
                                      size={40}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          this.onCheckExistingHealthMetric(
                                            'church_leaders',
                                          )
                                            ? styles.activeToggleText
                                            : styles.inactiveToggleText,
                                        ]}
                                      >
                                        Leaders
                                      </Text>
                                    </Row>
                                  </Col>
                                </Row>
                                <Row size={2} />
                              </Col>
                            </Row>

                            <Row size={5}>
                              <Col size={2} />
                              <Col size={3}>
                                <Row size={4}>
                                  <Col>
                                    <Row size={60}>
                                      <Col>
                                        <TouchableOpacity
                                          onPress={() => {
                                            this.onHealthMetricChange(
                                              'church_bible',
                                            );
                                          }}
                                          activeOpacity={1}
                                        >
                                          <Image
                                            source={bibleStudyIcon}
                                            style={
                                              this.onCheckExistingHealthMetric(
                                                'church_bible',
                                              )
                                                ? styles.activeImage
                                                : styles.inactiveImage
                                            }
                                          />
                                        </TouchableOpacity>
                                      </Col>
                                    </Row>
                                    <Row
                                      size={40}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          this.onCheckExistingHealthMetric(
                                            'church_bible',
                                          )
                                            ? styles.activeToggleText
                                            : styles.inactiveToggleText,
                                        ]}
                                      >
                                        Bible Study
                                      </Text>
                                    </Row>
                                  </Col>
                                </Row>
                                <Row size={1} />
                              </Col>
                              <Col size={2} />
                              <Col size={3}>
                                <Row size={1} />
                                <Row size={4}>
                                  <Col>
                                    <Row size={60}>
                                      <Col>
                                        <TouchableOpacity
                                          onPress={() => {
                                            this.onHealthMetricChange(
                                              'church_praise',
                                            );
                                          }}
                                          activeOpacity={1}
                                        >
                                          <Image
                                            source={praiseIcon}
                                            style={
                                              this.onCheckExistingHealthMetric(
                                                'church_praise',
                                              )
                                                ? styles.activeImage
                                                : styles.inactiveImage
                                            }
                                          />
                                        </TouchableOpacity>
                                      </Col>
                                    </Row>
                                    <Row
                                      size={40}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          this.onCheckExistingHealthMetric(
                                            'church_praise',
                                          )
                                            ? styles.activeToggleText
                                            : styles.inactiveToggleText,
                                        ]}
                                      >
                                        Praise
                                      </Text>
                                    </Row>
                                  </Col>
                                </Row>
                              </Col>
                              <Col size={2} />
                              <Col size={3}>
                                <Row size={4}>
                                  <Col>
                                    <Row size={60}>
                                      <Col>
                                        <TouchableOpacity
                                          onPress={() => {
                                            this.onHealthMetricChange(
                                              'church_sharing',
                                            );
                                          }}
                                          activeOpacity={1}
                                        >
                                          <Image
                                            source={sharingTheGospelIcon}
                                            style={
                                              this.onCheckExistingHealthMetric(
                                                'church_sharing',
                                              )
                                                ? styles.activeImage
                                                : styles.inactiveImage
                                            }
                                          />
                                        </TouchableOpacity>
                                      </Col>
                                    </Row>
                                    <Row
                                      size={40}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.toggleText,
                                          this.onCheckExistingHealthMetric(
                                            'church_sharing',
                                          )
                                            ? styles.activeToggleText
                                            : styles.inactiveToggleText,
                                        ]}
                                      >
                                        Sharing the Gospel
                                      </Text>
                                    </Row>
                                  </Col>
                                </Row>
                                <Row size={1} />
                              </Col>
                              <Col size={2} />
                            </Row>
                          </Col>
                          <Col style={{ width: sideSize * 0.1 }} />
                        </Row>
                      </Row>
                      <Row style={{ height: sideSize * 0.1 }} />
                    </Col>
                    <Col style={{ width: spacing }} />
                  </Row>
                  <Row style={{ height: spacing }} />
                </Grid>
              </ScrollView>
            </Tab>
            <Tab
              heading="Comments / Activity"
              tabStyle={[styles.tabStyle]}
              textStyle={styles.textStyle}
              activeTabStyle={styles.activeTabStyle}
              activeTextStyle={styles.activeTextStyle}
            >
              <View style={{ flex: 1 }}>
                <FlatList
                  style={styles.root}
                  ref={(flatList) => {
                    commentsFlatList = flatList;
                  }}
                  data={this.state.comments.concat(this.state.activities).sort(
                    (a, b) => new Date(a.date).getTime() < new Date(b.date).getTime(),
                  )}
                  extraData={this.state.comments.concat(this.state.activities).sort(
                    (a, b) => new Date(a.date).getTime() < new Date(b.date).getTime(),
                  )}
                  ItemSeparatorComponent={() => (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: '#CCCCCC',
                      }}
                    />
                  )}
                  keyExtractor={item => item.ID}
                  renderItem={(item) => {
                    const commentOrActivity = item.item;
                    return this.renderActivityOrCommentRow(
                      commentOrActivity,
                    );
                  }}
                />
                <KeyboardAccessory>
                  <View
                    style={{
                      backgroundColor: 'white',
                      flexDirection: 'row',
                    }}
                  >
                    <TextInput
                      placeholder="Write your comment or note here"
                      value={this.state.comment}
                      onChangeText={this.setComment}
                      style={{
                        borderColor: '#B4B4B4',
                        borderRadius: 5,
                        borderWidth: 1,
                        flex: 1,
                        margin: 10,
                        paddingLeft: 5,
                        paddingRight: 5,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => this.onSaveComment()}
                      style={{
                        backgroundColor: Colors.tintColor,
                        borderRadius: 80,
                        height: 40,
                        margin: 10,
                        paddingTop: 7,
                        paddingLeft: 10,
                        width: 40,
                      }}
                    >
                      <Icon
                        android="md-send"
                        ios="ios-send"
                        style={{ color: 'white', fontSize: 25 }}
                      />
                    </TouchableOpacity>
                  </View>
                </KeyboardAccessory>
              </View>
            </Tab>
            <Tab
              heading="Groups"
              tabStyle={styles.tabStyle}
              textStyle={styles.textStyle}
              activeTabStyle={styles.activeTabStyle}
              activeTextStyle={styles.activeTextStyle}
            >
              <KeyboardShift>
                {() => (
                  <ScrollView keyboardShouldPersistTaps="handled">
                    <View
                      style={styles.formContainer}
                    >
                      {!this.state.onlyView && (
                        <Grid>
                          <Row style={styles.formRow}>
                            <Col style={styles.formIconLabel}>
                              <Icon
                                active
                                type="FontAwesome"
                                name="users"
                                style={styles.formIcon}
                              />
                            </Col>
                            <Col />
                            <Col style={styles.formIconLabel}>
                              <Label style={styles.formLabel}>
                                Parent Group
                              </Label>
                            </Col>
                          </Row>
                          <Row>
                            <Col style={{ paddingLeft: 10, paddingRight: 10 }}>
                              <Selectize
                                ref={(selectize) => { this.parentGroupSelectizeRef = selectize; }}
                                itemId="value"
                                items={this.state.groups}
                                selectedItems={this.state.group.parent_groups.values}
                                textInputProps={{
                                  placeholder: 'Search groups',
                                }}
                                renderRow={(id, onPress, item) => (
                                  <TouchableOpacity
                                    activeOpacity={0.6}
                                    key={id}
                                    onPress={onPress}
                                    style={{
                                      paddingVertical: 8,
                                      paddingHorizontal: 10,
                                    }}
                                  >
                                    <View style={{
                                      flexDirection: 'row',
                                    }}
                                    >
                                      <Text style={{
                                        color: 'rgba(0, 0, 0, 0.87)',
                                        fontSize: 14,
                                        lineHeight: 21,
                                      }}
                                      >
                                        {item.name}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                )}
                                renderChip={(id, onClose, item, style, iconStyle) => (
                                  <Chip
                                    key={id}
                                    iconStyle={iconStyle}
                                    onClose={onClose}
                                    text={item.name}
                                    style={style}
                                  />
                                )}
                                filterOnKey="name"
                                keyboardShouldPersistTaps
                                inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                              />
                            </Col>
                          </Row>
                          <View style={styles.formDivider} />
                          <Row style={styles.formRow}>
                            <Col style={styles.formIconLabel}>
                              <Icon
                                active
                                type="FontAwesome"
                                name="users"
                                style={styles.formIcon}
                              />
                            </Col>
                            <Col />
                            <Col style={styles.formIconLabel}>
                              <Label style={styles.formLabel}>
                                Peer Group
                              </Label>
                            </Col>
                          </Row>
                          <Row>
                            <Col style={{ paddingLeft: 10, paddingRight: 10 }}>
                              <Selectize
                                ref={(selectize) => { this.peerGroupsSelectizeRef = selectize; }}
                                itemId="value"
                                items={this.state.groups}
                                selectedItems={this.state.group.peer_groups.values}
                                textInputProps={{
                                  placeholder: 'Search peer groups',
                                }}
                                renderRow={(id, onPress, item) => (
                                  <TouchableOpacity
                                    activeOpacity={0.6}
                                    key={id}
                                    onPress={onPress}
                                    style={{
                                      paddingVertical: 8,
                                      paddingHorizontal: 10,
                                    }}
                                  >
                                    <View style={{
                                      flexDirection: 'row',
                                    }}
                                    >
                                      <Text style={{
                                        color: 'rgba(0, 0, 0, 0.87)',
                                        fontSize: 14,
                                        lineHeight: 21,
                                      }}
                                      >
                                        {item.name}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                )}
                                renderChip={(id, onClose, item, style, iconStyle) => (
                                  <Chip
                                    key={id}
                                    iconStyle={iconStyle}
                                    onClose={onClose}
                                    text={item.name}
                                    style={style}
                                  />
                                )}
                                filterOnKey="name"
                                keyboardShouldPersistTaps
                                inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                              />
                            </Col>
                          </Row>
                          <View style={styles.formDivider} />
                          <Row style={styles.formRow}>
                            <Col style={styles.formIconLabel}>
                              <Icon
                                active
                                type="FontAwesome"
                                name="users"
                                style={styles.formIcon}
                              />
                            </Col>
                            <Col />
                            <Col style={styles.formIconLabel}>
                              <Label style={styles.formLabel}>
                                Child Group
                              </Label>
                            </Col>
                          </Row>
                          <Row>
                            <Col style={{ paddingLeft: 10, paddingRight: 10 }}>
                              <Selectize
                                ref={(selectize) => { this.childGroupsSelectizeRef = selectize; }}
                                itemId="value"
                                items={this.state.groups}
                                selectedItems={this.state.group.child_groups.values}
                                textInputProps={{
                                  placeholder: 'Search child groups',
                                }}
                                renderRow={(id, onPress, item) => (
                                  <TouchableOpacity
                                    activeOpacity={0.6}
                                    key={id}
                                    onPress={onPress}
                                    style={{
                                      paddingVertical: 8,
                                      paddingHorizontal: 10,
                                    }}
                                  >
                                    <View style={{
                                      flexDirection: 'row',
                                    }}
                                    >
                                      <Text style={{
                                        color: 'rgba(0, 0, 0, 0.87)',
                                        fontSize: 14,
                                        lineHeight: 21,
                                      }}
                                      >
                                        {item.name}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                )}
                                renderChip={(id, onClose, item, style, iconStyle) => (
                                  <Chip
                                    key={id}
                                    iconStyle={iconStyle}
                                    onClose={onClose}
                                    text={item.name}
                                    style={style}
                                  />
                                )}
                                filterOnKey="name"
                                keyboardShouldPersistTaps
                                inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                              />
                            </Col>
                          </Row>
                          <View style={styles.formDivider} />
                        </Grid>
                      )}
                      {this.state.onlyView && (
                        <Grid>
                          <Row style={styles.formRow}>
                            <Col style={styles.formIconLabel}>
                              <Label style={styles.formLabel}>
                                Parent Group
                              </Label>
                            </Col>
                            <Col />
                          </Row>
                          <Row style={{ height: circleSideSize, overflowX: 'auto' }}>
                            <ScrollView horizontal>
                              {this.state.group.parent_groups.values.map((parentGroup, index) => (
                                <Col key={index.toString()} style={{ width: circleSideSize }}>
                                  {(index % 2 === 0) ? (
                                    <Image
                                      source={circleIcon}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        position: 'absolute',
                                        height: '95%',
                                        width: '95%',
                                        marginTop: '4%',
                                        marginRight: '4%',
                                        marginBottom: '4%',
                                        marginLeft: '4%',
                                      }}
                                    />
                                  ) : (
                                    <Image
                                      source={dottedCircleIcon}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        position: 'absolute',
                                        height: '95%',
                                        width: '95%',
                                        marginTop: '4%',
                                        marginRight: '4%',
                                        marginBottom: '4%',
                                        marginLeft: '4%',
                                      }}
                                    />
                                  )}
                                  <Image
                                    source={baptismIcon}
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      position: 'absolute',
                                      height: '50%',
                                      width: '50%',
                                      marginTop: '20%',
                                    }}
                                  />
                                  <Row
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginTop: '10%',
                                      marginLeft: '20%',
                                      marginRight: '20%',
                                    }}
                                  >
                                    <Text style={{ fontSize: 13 }}>{parentGroup.name}</Text>
                                  </Row>
                                  <Row
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text>2</Text>
                                  </Row>
                                  <Row
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text>4</Text>
                                  </Row>
                                </Col>
                              ))}
                            </ScrollView>
                          </Row>
                          <View style={[styles.formDivider, { marginTop: 20, marginBottom: 10 }]} />
                          <Row style={styles.formRow}>
                            <Col style={styles.formIconLabel}>
                              <Label style={styles.formLabel}>
                                Peer Groups
                              </Label>
                            </Col>
                            <Col />
                          </Row>
                          <Row style={{ height: circleSideSize, overflowX: 'auto' }}>
                            <ScrollView horizontal>
                              {this.state.group.peer_groups.values.map((peerGroup, index) => (
                                <Col key={index.toString()} style={{ width: circleSideSize }}>
                                  {(index % 2 === 0) ? (
                                    <Image
                                      source={circleIcon}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        position: 'absolute',
                                        height: '95%',
                                        width: '95%',
                                        marginTop: '4%',
                                        marginRight: '4%',
                                        marginBottom: '4%',
                                        marginLeft: '4%',
                                      }}
                                    />
                                  ) : (
                                    <Image
                                      source={dottedCircleIcon}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        position: 'absolute',
                                        height: '95%',
                                        width: '95%',
                                        marginTop: '4%',
                                        marginRight: '4%',
                                        marginBottom: '4%',
                                        marginLeft: '4%',
                                      }}
                                    />
                                  )}
                                  <Image
                                    source={baptismIcon}
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      position: 'absolute',
                                      height: '50%',
                                      width: '50%',
                                      marginTop: '20%',
                                    }}
                                  />
                                  <Row
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginTop: '10%',
                                      marginLeft: '20%',
                                      marginRight: '20%',
                                    }}
                                  >
                                    <Text style={{ fontSize: 13 }}>{peerGroup.name}</Text>
                                  </Row>
                                  <Row
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text>2</Text>
                                  </Row>
                                  <Row
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text>4</Text>
                                  </Row>
                                </Col>
                              ))}
                            </ScrollView>
                          </Row>
                          <View style={[styles.formDivider, { marginTop: 20, marginBottom: 10 }]} />
                          <Row style={styles.formRow}>
                            <Col style={styles.formIconLabel}>
                              <Label style={styles.formLabel}>
                                Child Group
                              </Label>
                            </Col>
                            <Col />
                          </Row>
                          <Row style={{ height: circleSideSize, overflowX: 'auto' }}>
                            <ScrollView horizontal>
                              {this.state.group.child_groups.values.map((childGroup, index) => (
                                <Col key={index.toString()} style={{ width: circleSideSize }}>
                                  {(index % 2 === 0) ? (
                                    <Image
                                      source={circleIcon}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        position: 'absolute',
                                        height: '95%',
                                        width: '95%',
                                        marginTop: '4%',
                                        marginRight: '4%',
                                        marginBottom: '4%',
                                        marginLeft: '4%',
                                      }}
                                    />
                                  ) : (
                                    <Image
                                      source={dottedCircleIcon}
                                      style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        position: 'absolute',
                                        height: '95%',
                                        width: '95%',
                                        marginTop: '4%',
                                        marginRight: '4%',
                                        marginBottom: '4%',
                                        marginLeft: '4%',
                                      }}
                                    />
                                  )}
                                  <Image
                                    source={baptismIcon}
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      position: 'absolute',
                                      height: '50%',
                                      width: '50%',
                                      marginTop: '20%',
                                    }}
                                  />
                                  <Row
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginTop: '10%',
                                      marginLeft: '20%',
                                      marginRight: '20%',
                                    }}
                                  >
                                    <Text style={{ fontSize: 13 }}>{childGroup.name}</Text>
                                  </Row>
                                  <Row
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text>2</Text>
                                  </Row>
                                  <Row
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text>4</Text>
                                  </Row>
                                </Col>
                              ))}
                            </ScrollView>
                          </Row>
                          <View style={[styles.formDivider, { marginTop: 20, marginBottom: 10 }]} />
                        </Grid>
                      )}
                    </View>
                  </ScrollView>
                )}
              </KeyboardShift>
            </Tab>
          </Tabs>
        )}
        {!this.state.group.ID && this.state.loadedLocal && (
          <ScrollView>
            <View style={styles.formContainer}>
              <Grid>
                <Row>
                  <Label
                    style={[
                      styles.formLabel,
                      { marginTop: 10, marginBottom: 5 },
                    ]}
                  >
                    Group Name
                  </Label>
                </Row>
                <Row>
                  <Input
                    placeholder="Required field"
                    value={this.state.group.title}
                    onChangeText={this.setGroupName}
                    style={{
                      borderColor: '#B4B4B4',
                      borderWidth: 1,
                      borderRadius: 5,
                      borderStyle: 'solid',
                      fontSize: 13,
                      paddingLeft: 15,
                    }}
                  />
                </Row>
                <Row>
                  <Label
                    style={[
                      styles.formLabel,
                      { marginTop: 10, marginBottom: 5 },
                    ]}
                  >
                    Group Type
                  </Label>
                </Row>
                <Row>
                  <Picker
                    mode="dropdown"
                    selectedValue={this.state.group.group_type}
                    onValueChange={this.setGroupType}
                  >
                    <Picker.Item label="Pre-Group" value="pre-group" />
                    <Picker.Item label="Group" value="group" />
                    <Picker.Item label="Church" value="church" />
                    <Picker.Item label="Team" value="team" />
                  </Picker>
                </Row>
              </Grid>
            </View>
          </ScrollView>
        )}
        {/* successToast */}
        {errorToast}
      </Container>
    );
  }
}

GroupDetailScreen.propTypes = {
  user: PropTypes.shape({
    domain: PropTypes.string,
    token: PropTypes.string,
  }).isRequired,
  group: PropTypes.shape({
    key: PropTypes.number,
  }),
  userReducerError: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
  }),
  newComment: PropTypes.shape({
    ID: PropTypes.string,
    author: PropTypes.string,
    content: PropTypes.string,
    date: PropTypes.string,
    gravatar: PropTypes.string,
  }),
  groupsReducerError: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
  }),
  navigation: PropTypes.shape({
    getParam: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired,
  }).isRequired,
  getById: PropTypes.func.isRequired,
  saveGroup: PropTypes.func.isRequired,
  getComments: PropTypes.func.isRequired,
  saveComment: PropTypes.func.isRequired,
  getActivities: PropTypes.func.isRequired,
};
GroupDetailScreen.defaultProps = {
  group: null,
  userReducerError: null,
  newComment: null,
  groupsReducerError: null,
};
const mapStateToProps = state => ({
  user: state.userReducer,
  userReducerError: state.userReducer.error,
  group: state.groupsReducer.group,
  comments: state.groupsReducer.comments,
  activities: state.groupsReducer.activities,
  newComment: state.groupsReducer.newComment,
  groupsReducerError: state.groupsReducer.error,
});
const mapDispatchToProps = dispatch => ({
  saveGroup: (domain, token, groupData) => {
    dispatch(saveGroup(domain, token, groupData));
  },
  getById: (domain, token, groupId) => {
    dispatch(getById(domain, token, groupId));
  },
  getComments: (domain, token, groupId) => {
    dispatch(getCommentsByGroup(domain, token, groupId));
  },
  saveComment: (domain, token, groupId, commentData) => {
    dispatch(saveComment(domain, token, groupId, commentData));
  },
  getActivities: (domain, token, groupId) => {
    dispatch(getActivitiesByGroup(domain, token, groupId));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GroupDetailScreen);
