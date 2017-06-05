'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = axiosRetry;

var _isRetryAllowed = require('is-retry-allowed');

var _isRetryAllowed2 = _interopRequireDefault(_isRetryAllowed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Adds response interceptors to an axios instance to retry requests failed due to network issues
 *
 * @example
 *
 * import axios from 'axios';
 *
 * axiosRetry(axios, { retries: 3 });
 *
 * axios.get('http://example.com/test') // The first request fails and the second returns 'ok'
 *   .then(result => {
 *     result.data; // 'ok'
 *   });
 *
 * // Also works with custom axios instances
 * const client = axios.create({ baseURL: 'http://example.com' });
 * axiosRetry(client, { retries: 3 });
 *
 * client.get('/test') // The first request fails and the second returns 'ok'
 *   .then(result => {
 *     result.data; // 'ok'
 *   });
 *
 * @param {Axios} axios An axios instance (the axios object or one created from axios.create)
 * @param {Object} [options]
 * @param {number} [options.retries=3] Number of retries
 */
function axiosRetry(axios) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$retries = _ref.retries,
      retries = _ref$retries === undefined ? 3 : _ref$retries,
      _ref$retryCondition = _ref.retryCondition,
      retryCondition = _ref$retryCondition === undefined ? function (error) {
    return !error.response;
  } : _ref$retryCondition;

  axios.interceptors.response.use(null, function (error) {
    var config = error.config;

    // If we have no information to retry the request
    if (!config) {
      return Promise.reject(error);
    }

    config.retryCount = config.retryCount || 0;

    var shouldRetry = retryCondition(error
    // && error.code !== 'ECONNABORTED'
    ) && config.retryCount < retries && (0, _isRetryAllowed2.default)(error);

    if (shouldRetry) {
      config.retryCount++;

      // Axios fails merging this configuration to the default configuration because it has an issue
      // with circular structures
      if (axios.defaults.agent === config.agent) {
        delete config.agent;
      }
      if (axios.defaults.httpAgent === config.httpAgent) {
        delete config.httpAgent;
      }
      if (axios.defaults.httpsAgent === config.httpsAgent) {
        delete config.httpsAgent;
      }

      return axios(config);
    }

    return Promise.reject(error);
  });
}
//# sourceMappingURL=index.js.map