⛔️ DEPRECATION WARNING 
=======================

**This library is deprecated and will be archived.** 

Its functionality has been moved into `frontend-platform <https://github.com/edx/frontend-platform>`__, which should be used for frontend development going forward.  Please contact `@edx/fedx-team <https://github.com/orgs/edx/teams/fedx-team>`__ with any questions.

frontend-analytics
==================

|Build Status| |Coveralls| |npm_version| |npm_downloads| |license|
|semantic-release|

frontend-analytics contains a shared interface for tracking events. At this time, it supports Segment and the Tracking Log API (hosted in LMS).

Usage
-----

To install frontend-analytics into your project::

    npm i --save @edx/frontend-analytics

Add the following configuration code to your app::

    import { configureAnalytics, initializeSegment } from '@edx/analytics';
    import LoggingService from '@edx/frontend-logging';

    // Example of a configured frontend-auth api client
    import apiClient from '../config/apiClient';
    // Sample object containing app configuration
    import { configuration } from '../config/environment';

    initializeSegment(configuration.SEGMENT_KEY);
    configureAnalytics({
      loggingService: LoggingService,
      authApiClient: apiClient,
      analyticsApiBaseUrl: configuration.LMS_BASE_URL,
    });

.. |Build Status| image:: https://api.travis-ci.com/edx/frontend-analytics.svg?branch=master
   :target: https://travis-ci.com/edx/frontend-analytics
.. |Coveralls| image:: https://img.shields.io/coveralls/edx/frontend-analytics.svg?branch=master
   :target: https://coveralls.io/github/edx/frontend-analytics
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-analytics.svg
   :target: @edx/frontend-analytics
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-analytics.svg
   :target: @edx/frontend-analytics
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-analytics.svg
   :target: @edx/frontend-analytics
.. |semantic-release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
   :target: https://github.com/semantic-release/semantic-release
