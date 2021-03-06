import {
  configureAnalytics,
  identifyAnonymousUser,
  identifyAuthenticatedUser,
  sendPageEvent,
  sendTrackEvent,
  sendTrackingLogEvent,
} from './analytics';

const eventType = 'test.event';
const eventData = {
  testShallow: 'test-shallow',
  testObject: {
    testDeep: 'test-deep',
  },
};
const testUserId = 99;
const testAnalyticsApiBaseUrl = '/analytics';
let mockAuthApiClient;
let mockLoggingService;


function createMockLoggingService() {
  mockLoggingService = {
    logError: jest.fn(),
    logAPIErrorResponse: jest.fn(),
  };
}

function createMockAuthApiClientAuthenticated() {
  mockAuthApiClient = {
    getAuthenticationState:
      jest.fn(() => ({
        authentication: { userId: testUserId },
      })),
  };
}

function createMockAuthApiClientPostResolved() {
  mockAuthApiClient = {
    post: jest.fn().mockResolvedValue(undefined),
  };
}

function createMockAuthApiClientPostRejected() {
  mockAuthApiClient = {
    post: jest.fn().mockRejectedValue('test-error'),
  };
}

function configureAnalyticsWithMocks() {
  configureAnalytics({
    loggingService: mockLoggingService,
    authApiClient: mockAuthApiClient,
    analyticsApiBaseUrl: testAnalyticsApiBaseUrl,
  });
}

describe('analytics sendTrackingLogEvent', () => {
  it('fails when loggingService is not configured', () => {
    mockLoggingService = undefined;
    createMockAuthApiClientPostResolved();
    configureAnalyticsWithMocks();

    expect(() => sendTrackingLogEvent(eventType, eventData))
      .toThrowError('You must configure the loggingService.');
  });

  it('fails when authApiClient is not configured', () => {
    createMockLoggingService();
    mockAuthApiClient = undefined;
    configureAnalyticsWithMocks();

    expect(() => sendTrackingLogEvent(eventType, eventData))
      .toThrowError('You must configure the authApiClient.');
  });

  it('posts expected data when successful', () => {
    createMockLoggingService();
    createMockAuthApiClientPostResolved();
    configureAnalyticsWithMocks();

    expect.assertions(4);
    return sendTrackingLogEvent(eventType, eventData)
      .then(() => {
        expect(mockAuthApiClient.post.mock.calls.length).toEqual(1);
        expect(mockAuthApiClient.post.mock.calls[0][0]).toEqual('/analytics/event');
        const expectedData = 'event_type=test.event&event=%7B%22test_shallow%22%3A%22test-shallow%22%2C%22test_object%22%3A%7B%22test_deep%22%3A%22test-deep%22%7D%7D&page=http%3A%2F%2Flocalhost%2F';
        expect(mockAuthApiClient.post.mock.calls[0][1]).toEqual(expectedData);
        const config = mockAuthApiClient.post.mock.calls[0][2];
        expect(config.headers['Content-Type']).toEqual('application/x-www-form-urlencoded');
      });
  });

  it('calls loggingService.logAPIErrorResponse on error', () => {
    createMockLoggingService();
    createMockAuthApiClientPostRejected();
    configureAnalyticsWithMocks();

    expect.assertions(2);
    return sendTrackingLogEvent(eventType, eventData)
      .then(() => {
        expect(mockLoggingService.logAPIErrorResponse.mock.calls.length).toBe(1);
        expect(mockLoggingService.logAPIErrorResponse).toBeCalledWith('test-error');
      });
  });
});

describe('analytics identifyAuthenticatedUser', () => {
  beforeEach(() => {
    window.analytics = {
      identify: jest.fn(),
    };
  });

  it('calls Segment identify on success', () => {
    configureAnalyticsWithMocks();

    const testTraits = { anything: 'Yay!' };
    identifyAuthenticatedUser(testUserId, testTraits);

    expect(window.analytics.identify.mock.calls.length).toBe(1);
    expect(window.analytics.identify).toBeCalledWith(testUserId, testTraits);
  });

  it('throws error if userId is not supplied', () => {
    configureAnalyticsWithMocks();

    expect(() => identifyAuthenticatedUser(null))
      .toThrowError(new Error('UserId is required for identifyAuthenticatedUser.'));
  });
});

describe('analytics identifyAnonymousUser', () => {
  beforeEach(() => {
    window.analytics = {
      identify: jest.fn(),
    };
  });

  it('calls Segment identify on success', () => {
    const testTraits = { anything: 'Yay!' };
    identifyAnonymousUser(testTraits);

    expect(window.analytics.identify.mock.calls.length).toBe(1);
    expect(window.analytics.identify).toBeCalledWith(testTraits);
  });
});

function testSendPageAfterIdentify(identifyFunction) {
  createMockLoggingService();
  createMockAuthApiClientAuthenticated();
  configureAnalyticsWithMocks();
  identifyFunction();

  const testCategory = 'test-category';
  const testName = 'test-name';
  const testProperties = { anything: 'Yay!' };
  sendPageEvent(testCategory, testName, testProperties);

  expect(window.analytics.page.mock.calls.length).toBe(1);
  expect(window.analytics.page).toBeCalledWith(testCategory, testName, testProperties);
}

describe('analytics send Page event', () => {
  beforeEach(() => {
    window.analytics = {
      identify: jest.fn(),
      page: jest.fn(),
    };
  });

  it('fails when loggingService is not configured', () => {
    mockLoggingService = undefined;
    mockAuthApiClient = undefined;
    configureAnalyticsWithMocks();

    expect(() => sendPageEvent()).toThrowError('You must configure the loggingService.');
  });

  it('calls Segment page on success after identifyAuthenticatedUser', () => {
    const userId = 1;
    testSendPageAfterIdentify(() => identifyAuthenticatedUser(userId));
  });

  it('calls Segment page on success after identifyAnonymousUser', () => {
    testSendPageAfterIdentify(identifyAnonymousUser);
  });

  it('fails if page called with no identify', () => {
    createMockLoggingService();
    mockAuthApiClient = undefined;
    configureAnalyticsWithMocks();

    sendPageEvent();

    expect(mockLoggingService.logError.mock.calls.length).toBe(1);
    expect(mockLoggingService.logError).toBeCalledWith('Identify must be called before other tracking events.');
  });
});

function testSendTrackEventAfterIdentify(identifyFunction) {
  createMockLoggingService();
  createMockAuthApiClientAuthenticated();
  configureAnalyticsWithMocks();
  identifyFunction();

  const testName = 'test-name';
  const testProperties = { anything: 'Yay!' };
  sendTrackEvent(testName, testProperties);

  expect(window.analytics.track.mock.calls.length).toBe(1);
  expect(window.analytics.track).toBeCalledWith(testName, testProperties);
}

describe('analytics send Track event', () => {
  beforeEach(() => {
    window.analytics = {
      identify: jest.fn(),
      track: jest.fn(),
    };
  });

  it('fails when loggingService is not configured', () => {
    mockLoggingService = undefined;
    mockAuthApiClient = undefined;
    configureAnalyticsWithMocks();

    expect(() => sendTrackEvent()).toThrowError('You must configure the loggingService.');
  });

  it('calls Segment track on success after identifyAuthenticatedUser', () => {
    const userId = 1;
    testSendTrackEventAfterIdentify(() => identifyAuthenticatedUser(userId));
  });

  it('calls Segment track on success after identifyAnonymousUser', () => {
    testSendTrackEventAfterIdentify(identifyAnonymousUser);
  });

  it('fails if track called with no identify', () => {
    createMockLoggingService();
    mockAuthApiClient = undefined;
    configureAnalyticsWithMocks();

    sendTrackEvent();

    expect(mockLoggingService.logError.mock.calls.length).toBe(1);
    expect(mockLoggingService.logError).toBeCalledWith('Identify must be called before other tracking events.');
  });
});
