# Final Fantasy XIV Language Companion

A tool for learning Japanese with Final Fantasy XIV developed with C# and node.js. The tool scans the network packets that are being sent to FFXIV and will output dialogue text from quests to a browser window. It has only been tested with Google Chrome. This is still pretty hacky and incomplete, so expect bugs and missing information.

## Functionality

* Look up works with a mouseover dictionary based on Rikai-chan
* Read with automatically generated furigana (though it is not 100% accurate)
* See the official English translation for each Japanese line
* Play on one device and learn on another - you can connect the tool to any device on your local network
* Supports PC and can work with PS4 if you route your PS4 internet connection through your PC (look up Network Bridging)
* Supports all A Realm Reborn and Heavensward quests (I don't have a PC copy of Stormblood)

## Set-up

Currently there is no standalone installer. I will consider putting one up after I'm sure everything is stable.


You will need [node.js](https://nodejs.org/en/) and Google Chrome on your computer. I recommend the recommended current version (6.11 at the time of writing).

Open the command line and go to the language-companion directory. Then run npm install to download the dependencies.
```
cd language-companion
npm install
```

Once the packages have finished installing, use node to start the application.
```
node index.js
```

The tool should open in a new window in Google Chrome. 