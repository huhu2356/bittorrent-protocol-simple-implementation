## simple bittorrent client

just for exercise

implement:
- parse torrent file
- use http or udp method accroding to torrent to get peers(ip, port) from tracker 
- establish tcp connection from other peers and download single file

need to fix:
- download multiple files
- multiple error conditions check
- use torrent announce list
- udp tracker connect and announce resp check
- udp tracker timeout get resp fail and send request agian automatically
- handshake info_hash and peer_id check
- upload file(s)
- DHT
- rarest strategy
- reconnect if peer drop connection
- add a graphic user interface
- look for more peers periodically
- pause and resume downloading
- NATs traversal

### reference

-- [how-to-make-your-own-bittorrent-client](https://github.com/allenkim67/blog/blob/master/_posts/2016-05-04-how-to-make-your-own-bittorrent-client.md) excelent !!! i try do this project from this blog

-- [How to Write a Bittorrent Client](http://www.kristenwidman.com/blog/33/how-to-write-a-bittorrent-client-part-1/) nice article ! guide you how to do step by step

-- [wiki bittorrent](https://wiki.theory.org/index.php/BitTorrentSpecification) nice website from that you can find infomation

### ψ(｀∇´)ψ

- use wireshark to catch packet and analyze it
- without google and stackoverflow , i can't code _(´ཀ`」 ∠)_ 