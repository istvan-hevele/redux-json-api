'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducer = exports.requireEntity = exports.deleteEntity = exports.updateEntity = exports.createEntity = exports.requireResource = exports.deleteResource = exports.updateResources = exports.updateResource = exports.readEndpoint = exports.createResource = exports.uploadFile = exports.setAccessToken = exports.setHeader = exports.setHeaders = exports.setEndpointPath = exports.setEndpointHost = exports.IS_UPDATING = exports.IS_DELETING = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _handleActions;

var _reduxActions = require('redux-actions');

require('fetch-everywhere');

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _stateMutation = require('./state-mutation');

var _utils = require('./utils');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Resource isInvalidating values
var IS_DELETING = exports.IS_DELETING = 'IS_DELETING';
var IS_UPDATING = exports.IS_UPDATING = 'IS_UPDATING';

// Action creators
var setEndpointHost = exports.setEndpointHost = (0, _reduxActions.createAction)(_constants.API_SET_ENDPOINT_HOST);
var setEndpointPath = exports.setEndpointPath = (0, _reduxActions.createAction)(_constants.API_SET_ENDPOINT_PATH);
var setHeaders = exports.setHeaders = (0, _reduxActions.createAction)(_constants.API_SET_HEADERS);
var setHeader = exports.setHeader = (0, _reduxActions.createAction)(_constants.API_SET_HEADER);

var apiWillCreate = (0, _reduxActions.createAction)(_constants.API_WILL_CREATE);
var apiCreated = (0, _reduxActions.createAction)(_constants.API_CREATED);
var apiCreateFailed = (0, _reduxActions.createAction)(_constants.API_CREATE_FAILED);

var apiWillRead = (0, _reduxActions.createAction)(_constants.API_WILL_READ);
var apiRead = (0, _reduxActions.createAction)(_constants.API_READ);
var apiReadFailed = (0, _reduxActions.createAction)(_constants.API_READ_FAILED);

var apiWillUpdate = (0, _reduxActions.createAction)(_constants.API_WILL_UPDATE);
var apiUpdated = (0, _reduxActions.createAction)(_constants.API_UPDATED);
var apiUpdateFailed = (0, _reduxActions.createAction)(_constants.API_UPDATE_FAILED);

var apiWillDelete = (0, _reduxActions.createAction)(_constants.API_WILL_DELETE);
var apiDeleted = (0, _reduxActions.createAction)(_constants.API_DELETED);
var apiDeleteFailed = (0, _reduxActions.createAction)(_constants.API_DELETE_FAILED);

// Actions
var setAccessToken = exports.setAccessToken = function setAccessToken(at) {
  return function (dispatch) {
    dispatch(setHeader({ Authorization: 'Bearer ' + at }));
  };
};

var uploadFile = exports.uploadFile = function uploadFile(file, _ref) {
  var companyId = _ref.companyId,
      _ref$fileableType = _ref.fileableType,
      fileableType = _ref$fileableType === undefined ? null : _ref$fileableType,
      _ref$fileableId = _ref.fileableId,
      fileableId = _ref$fileableId === undefined ? null : _ref$fileableId;

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$onSuccess = _ref2.onSuccess,
      onSuccess = _ref2$onSuccess === undefined ? _utils.noop : _ref2$onSuccess,
      _ref2$onError = _ref2.onError,
      onError = _ref2$onError === undefined ? _utils.noop : _ref2$onError;

  console.warn('uploadFile has been deprecated and will no longer be supported by redux-json-api https://github.com/dixieio/redux-json-api/issues/2');

  return function (dispatch, getState) {
    var accessToken = getState().api.endpoint.accessToken;
    var path = [companyId, fileableType, fileableId].filter(function (o) {
      return !!o;
    }).join('/');
    var url = __API_HOST__ + '/upload/' + path + '?access_token=' + accessToken;

    var data = new FormData();
    data.append('file', file);

    var options = {
      method: 'POST',
      body: data
    };

    return fetch(url, options).then(function (res) {
      if (res.status >= 200 && res.status < 300) {
        if (_utils.jsonContentTypes.some(function (contentType) {
          return res.headers.get('Content-Type').indexOf(contentType) > -1;
        })) {
          return res.json();
        }

        return res;
      }

      var e = new Error(res.statusText);
      e.response = res;
      throw e;
    }).then(function (json) {
      onSuccess(json);
    }).catch(function (error) {
      onError(error);
    });
  };
};

var createResource = exports.createResource = function createResource(resource) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref3$onSuccess = _ref3.onSuccess,
      onSuccess = _ref3$onSuccess === undefined ? _utils.noop : _ref3$onSuccess,
      _ref3$onError = _ref3.onError,
      onError = _ref3$onError === undefined ? _utils.noop : _ref3$onError;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return function (dispatch, getState) {
    dispatch(apiWillCreate(resource));

    var _getState$api$endpoin = getState().api.endpoint,
        apiHost = _getState$api$endpoin.host,
        apiPath = _getState$api$endpoin.path,
        headers = _getState$api$endpoin.headers;

    var endpoint = '' + apiHost + apiPath + '/' + resource.type;

    return new _promise2.default(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, {
        headers: headers,
        method: 'POST',
        credentials: 'include',
        body: (0, _stringify2.default)({
          data: resource
        })
      }).then(function (json) {
        dispatch(apiCreated(json));
        onSuccess(json);
        resolve(json);
      }).catch(function (error) {
        var err = error;
        err.resource = resource;

        dispatch(apiCreateFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

var readEndpoint = exports.readEndpoint = function readEndpoint(endpoint) {
  var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref4$onSuccess = _ref4.onSuccess,
      onSuccess = _ref4$onSuccess === undefined ? _utils.noop : _ref4$onSuccess,
      _ref4$onError = _ref4.onError,
      onError = _ref4$onError === undefined ? _utils.noop : _ref4$onError,
      _ref4$cancelHandler = _ref4.cancelHandler,
      cancelHandler = _ref4$cancelHandler === undefined ? {} : _ref4$cancelHandler,
      _ref4$options = _ref4.options,
      options = _ref4$options === undefined ? {
    indexLinks: undefined
  } : _ref4$options;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return function (dispatch, getState) {
    dispatch(apiWillRead(endpoint));

    var _getState$api$endpoin2 = getState().api.endpoint,
        apiHost = _getState$api$endpoin2.host,
        apiPath = _getState$api$endpoin2.path,
        headers = _getState$api$endpoin2.headers;

    var apiEndpoint = '' + apiHost + apiPath + '/' + endpoint;

    return new _promise2.default(function (resolve, reject) {
      var isCancelled = false;
      /* eslint-disable */
      cancelHandler.cancel = function () {
        isCancelled = true;
        dispatch(apiReadFailed());
        cancelHandler.cancel = function () {
          return null;
        };
      };
      /*eslint-enable */

      (0, _utils.apiRequest)('' + apiEndpoint, {
        headers: headers,
        credentials: 'include'
      }).then(function (json) {
        if (!isCancelled) {
          /* eslint-disable */
          cancelHandler.cancel = function () {
            return null;
          };
          /*eslint-enable */
          dispatch(apiRead((0, _extends3.default)({ endpoint: endpoint, options: options }, json)));
          onSuccess(json);
          resolve(json);
        }
      }).catch(function (error) {
        if (!isCancelled) {
          /* eslint-disable */
          cancelHandler.cancel = function () {
            return null;
          };
          /*eslint-enable */
          var err = error;
          err.endpoint = endpoint;

          dispatch(apiReadFailed(err));
          onError(err);
          reject(err);
        }
      });
    });
  };
};

var updateResource = exports.updateResource = function updateResource(resource) {
  var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref5$onSuccess = _ref5.onSuccess,
      onSuccess = _ref5$onSuccess === undefined ? _utils.noop : _ref5$onSuccess,
      _ref5$onError = _ref5.onError,
      onError = _ref5$onError === undefined ? _utils.noop : _ref5$onError;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }
  return function (dispatch, getState) {
    dispatch(apiWillUpdate(resource));

    var _getState$api$endpoin3 = getState().api.endpoint,
        apiHost = _getState$api$endpoin3.host,
        apiPath = _getState$api$endpoin3.path,
        headers = _getState$api$endpoin3.headers;

    var endpoint = '' + apiHost + apiPath + '/' + resource.type + '/' + resource.id;

    return new _promise2.default(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, {
        headers: headers,
        method: 'PATCH',
        credentials: 'include',
        body: (0, _stringify2.default)({
          data: resource
        })
      }).then(function (json) {
        dispatch(apiUpdated(json));
        onSuccess(json);
        resolve(json);
      }).catch(function (error) {
        var err = error;
        err.resource = resource;

        dispatch(apiUpdateFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

var updateResources = exports.updateResources = function updateResources(resources) {
  var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref6$onSuccess = _ref6.onSuccess,
      onSuccess = _ref6$onSuccess === undefined ? _utils.noop : _ref6$onSuccess,
      _ref6$onError = _ref6.onError,
      onError = _ref6$onError === undefined ? _utils.noop : _ref6$onError;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }
  return function (dispatch, getState) {
    dispatch(apiWillUpdate(resources));

    var _getState$api$endpoin4 = getState().api.endpoint,
        apiHost = _getState$api$endpoin4.host,
        apiPath = _getState$api$endpoin4.path,
        headers = _getState$api$endpoin4.headers;

    var endpoint = '' + apiHost + apiPath + '/' + resources[0].type;

    return new _promise2.default(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, {
        headers: headers,
        method: 'PATCH',
        credentials: 'include',
        body: (0, _stringify2.default)({
          data: resources
        })
      }).then(function (json) {
        dispatch(apiUpdated(json));
        onSuccess(json);
        resolve(json);
      }).catch(function (error) {
        var err = error;
        err.resources = resources;

        dispatch(apiUpdateFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

var deleteResource = exports.deleteResource = function deleteResource(resource) {
  var _ref7 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref7$onSuccess = _ref7.onSuccess,
      onSuccess = _ref7$onSuccess === undefined ? _utils.noop : _ref7$onSuccess,
      _ref7$onError = _ref7.onError,
      onError = _ref7$onError === undefined ? _utils.noop : _ref7$onError,
      _ref7$params = _ref7.params,
      params = _ref7$params === undefined ? {} : _ref7$params;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return function (dispatch, getState) {
    dispatch(apiWillDelete(resource));

    var _getState$api$endpoin5 = getState().api.endpoint,
        apiHost = _getState$api$endpoin5.host,
        apiPath = _getState$api$endpoin5.path,
        headers = _getState$api$endpoin5.headers;

    var endpoint = '' + apiHost + apiPath + '/' + resource.type + '/' + resource.id;

    // add additional params as query params
    if ((0, _keys2.default)(params).length > 0) {
      endpoint += '?';
      endpoint += (0, _keys2.default)(params).reduce(function (accumulator, key) {
        return [].concat((0, _toConsumableArray3.default)(accumulator), [key + '=' + params[key]]);
      }, []).join('&');
    }

    return new _promise2.default(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, {
        headers: headers,
        method: 'DELETE',
        credentials: 'include'
      }).then(function (response) {
        dispatch(apiDeleted(resource));
        onSuccess(response);
        resolve(response);
      }).catch(function (error) {
        var err = error;
        err.resource = resource;

        dispatch(apiDeleteFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

var requireResource = exports.requireResource = function requireResource(resourceType) {
  var endpoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : resourceType;

  var _ref8 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref8$onSuccess = _ref8.onSuccess,
      onSuccess = _ref8$onSuccess === undefined ? _utils.noop : _ref8$onSuccess,
      _ref8$onError = _ref8.onError,
      onError = _ref8$onError === undefined ? _utils.noop : _ref8$onError;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return function (dispatch, getState) {
    return new _promise2.default(function (resolve, reject) {
      var _getState = getState(),
          api = _getState.api;

      if (api.hasOwnProperty(resourceType)) {
        resolve();
        return onSuccess();
      }

      dispatch(readEndpoint(endpoint, { onSuccess: onSuccess, onError: onError })).then(resolve).catch(reject);
    });
  };
};

var createEntity = exports.createEntity = function createEntity() {
  console.warn('createEntity is deprecated and will be removed in v2.0 in favor of new method createResource');
  return createResource.apply(undefined, arguments);
};

var updateEntity = exports.updateEntity = function updateEntity() {
  console.warn('updateEntity is deprecated and will be removed in v2.0 in favor of new method updateResource');
  return updateResource.apply(undefined, arguments);
};

var deleteEntity = exports.deleteEntity = function deleteEntity() {
  console.warn('deleteEntity is deprecated and will be removed in v2.0 in favor of new method deleteResource');
  return deleteResource.apply(undefined, arguments);
};

var requireEntity = exports.requireEntity = function requireEntity() {
  console.warn('requireEntity is deprecated and will be removed in v2.0 in favor of new method requireResource');
  return requireResource.apply(undefined, arguments);
};

// Reducers
var reducer = exports.reducer = (0, _reduxActions.handleActions)((_handleActions = {}, (0, _defineProperty3.default)(_handleActions, _constants.API_SET_HEADERS, function (state, _ref9) {
  var headers = _ref9.payload;

  return (0, _objectPathImmutable2.default)(state).set(['endpoint', 'headers'], headers).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_SET_HEADER, function (state, _ref10) {
  var header = _ref10.payload;

  var newState = (0, _objectPathImmutable2.default)(state);
  (0, _keys2.default)(header).forEach(function (key) {
    newState.set(['endpoint', 'headers', key], header[key]);
  });

  return newState.value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_SET_ENDPOINT_HOST, function (state, _ref11) {
  var host = _ref11.payload;

  return (0, _objectPathImmutable2.default)(state).set(['endpoint', 'host'], host).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_SET_ENDPOINT_PATH, function (state, _ref12) {
  var path = _ref12.payload;

  return (0, _objectPathImmutable2.default)(state).set(['endpoint', 'path'], path).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_WILL_CREATE, function (state) {
  return (0, _objectPathImmutable2.default)(state).set(['isCreating'], state.isCreating + 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_CREATED, function (state, _ref13) {
  var resources = _ref13.payload;

  var entities = Array.isArray(resources.data) ? resources.data : [resources.data];

  var newState = (0, _stateMutation.updateOrInsertResourcesIntoState)(state, entities.concat(resources.included || []));

  return (0, _objectPathImmutable2.default)(newState).set('isCreating', state.isCreating - 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_CREATE_FAILED, function (state) {
  return (0, _objectPathImmutable2.default)(state).set(['isCreating'], state.isCreating - 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_WILL_READ, function (state) {
  return (0, _objectPathImmutable2.default)(state).set(['isReading'], state.isReading + 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_READ, function (state, _ref14) {
  var payload = _ref14.payload;

  var resources = (Array.isArray(payload.data) ? payload.data : [payload.data]).concat(payload.included || []);

  var newState = (0, _stateMutation.updateOrInsertResourcesIntoState)(state, resources);
  var finalState = (0, _stateMutation.addLinksToState)(newState, payload.links, payload.options);

  return (0, _objectPathImmutable2.default)(finalState).set('isReading', state.isReading - 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_READ_FAILED, function (state) {
  return (0, _objectPathImmutable2.default)(state).set(['isReading'], state.isReading - 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_WILL_UPDATE, function (state, _ref15) {
  var resource = _ref15.payload;
  var type = resource.type,
      id = resource.id;


  var newState = (0, _stateMutation.ensureResourceTypeInState)(state, type);

  return (0, _stateMutation.setIsInvalidatingForExistingResource)(newState, { type: type, id: id }, IS_UPDATING).set('isUpdating', state.isUpdating + 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_UPDATED, function (state, _ref16) {
  var resources = _ref16.payload;

  var entities = Array.isArray(resources.data) ? resources.data : [resources.data];

  var newState = (0, _stateMutation.updateOrInsertResourcesIntoState)(state, entities.concat(resources.included || []));

  return (0, _objectPathImmutable2.default)(newState).set('isUpdating', state.isUpdating - 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_UPDATE_FAILED, function (state, _ref17) {
  var resource = _ref17.payload.resource;
  var type = resource.type,
      id = resource.id;


  return (0, _stateMutation.setIsInvalidatingForExistingResource)(state, { type: type, id: id }).set('isUpdating', state.isUpdating - 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_WILL_DELETE, function (state, _ref18) {
  var resource = _ref18.payload;
  var type = resource.type,
      id = resource.id;


  return (0, _stateMutation.setIsInvalidatingForExistingResource)(state, { type: type, id: id }, IS_DELETING).set('isDeleting', state.isDeleting + 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_DELETED, function (state, _ref19) {
  var resource = _ref19.payload;

  return (0, _stateMutation.removeResourceFromState)(state, resource).set('isDeleting', state.isDeleting - 1).value();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_DELETE_FAILED, function (state, _ref20) {
  var resource = _ref20.payload.resource;
  var type = resource.type,
      id = resource.id;


  return (0, _stateMutation.setIsInvalidatingForExistingResource)(state, { type: type, id: id }).set('isDeleting', state.isDeleting - 1).value();
}), _handleActions), {
  isCreating: 0,
  isReading: 0,
  isUpdating: 0,
  isDeleting: 0,
  endpoint: {
    host: null,
    path: null,
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json'
    }
  }
});