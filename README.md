OpenPaaS WebRTC module
======================

Configuration
-------------

This module uses webrtc node of config file.

Here is a list of available options :

 * enabled : enable webrtc module (Boolean [default : undefined])
 * loglevel : specifies log level (String [default: "info"])
 * appIceServers : Array of STUN/TURN servers to use (Array [default: []])

If enabled is undefined, webrtc module is disabled.

If appIceServers is undefined, NAT traversal system is disabled.

Focus on Ice servers
--------------------

STUN/TURN servers are used to allow NAT traversal.
While STUN is used to resolve public ip addresses of peers, TURN act as a relay between two nated peers.

Here is an example of STUN/TURN servers definition :

  "appIceServers": [
          {"url": "stun:stun.example.com:3478"},
          {"url": "turn:turn.example.com:3478",
           "username": "username1",
           "credential": "key1"}
  ]

Even if you set only one server, it's preferable to provide, at least, one server of each kind.

Username and credential are mandatory for TURN but musn't be set for STUN servers.

For more informations about STUN/TURN, please refer to following link :

[http://easyrtc.com/docs/guides/easyrtc_server_ice.php](easyRTC ICE documentaion)
[http://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment](Wikipedia : Internet Connectivity Establishment)
