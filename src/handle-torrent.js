const udpTracker = require('./udp-tracker');
const httpTracker = require('./http-tracker');
const download = require('./download');

module.exports = async (torrent, path) => {
  const announce = torrent.announce.toString();
  let peers;
  if (announce.indexOf('udp://') !== -1) {
    peers = await udpTracker.getPeers(torrent);
  } else if (announce.indexOf('http://') !== -1) {
    peers = await httpTracker.getPeers(torrent);
  } else {
    console.log('torrent announce error');
    return;
  }

  download(torrent, path, peers);
};

