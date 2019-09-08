export const environment = {
  production: false,
  servers: {
    oauth: 'http://192.168.0.76:8090/oauth',
    userApi: 'http://192.168.0.76:8090/api/user',
    rabbitmq: 'ws://192.168.0.76:15674/ws',
    camera1: 'http://192.168.0.76:8081',
    camera2: 'http://192.168.0.76:8082'
  },
  oauth: {
    appName: 'beo-app-client',
    appSecret: 'e6aec4e0-e421-415a-8f84-d06237963831'
  },
  rabbitmq: {
    topic: '/topic/webrtc'
  }
};
