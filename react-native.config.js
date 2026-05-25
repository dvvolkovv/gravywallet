module.exports = {
  project: {
    android: {}
  },
  assets: ['./assets/fonts/'],
  dependencies: {
    // Skip iOS native build — Monero C++ core uses std::vector<const std::string>
    // which Xcode 26.2 libc++ rejects. XMR is non-critical for MVP; the JS import
    // in MoneroUtilsParser.js only runs when a Monero wallet is opened.
    'react-native-mymonero-core': {
      platforms: { ios: null }
    }
  }
}
