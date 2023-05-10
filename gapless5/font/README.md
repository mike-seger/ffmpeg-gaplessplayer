# fonts + utils
https://fonts.google.com/icons?icon.category=av
https://github.com/google/material-design-icons/
https://onlinefontconverter.com/
https://transfonter.org/

## fonttools
```
sudo pip3 install fonttools
pyftsubset font/original/MaterialIconsRound-Regular.otf --output-file=font/player.otf --unicodes-file=font/used-symbols.txt
```

## fontmin
https://github.com/ecomfe/fontmin
```
npm install -g fontmin
text=$(cat player.css | grep 'content:.*\\' | sed -e 's/\\/\n\\/g'|grep '\\'|sed -e 's/".*//'|tr -d '\\' | while read f; do echo -e "\u$f"; done)
fontmin -t "$text" font/original/MaterialIconsRound-Regular.otf >font/symbols.otf
```