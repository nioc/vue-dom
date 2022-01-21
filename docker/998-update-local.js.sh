#!/bin/sh

set -e

update_localjs() {

  LOCALJS=/usr/share/nginx/html/local.js
  if [ ! -w $LOCALJS ]; then
    echo "local.js file is not writable"
    exit 1
  fi

  echo -n "update local.js with environment variables... "

  # set custom app title
  if [ "$TITLE" != "" ]; then
    sed -i "s|title: 'VueDom'|title: '$TITLE'|g" $LOCALJS
  fi

  # set custom provider
  if [ "$PROVIDER" != "" ]; then
    LEAD='start provider config$'
    TAIL='end provider config$'
    sed -i -e "/$LEAD/,/$TAIL/{ /$LEAD/{a provider: {$PROVIDER},
    }; /$TAIL/d; d }" $LOCALJS
  fi

  # link custom components to modules
  if [ "$COMPONENTS" != "" ]; then
    LEAD='start components config$'
    TAIL='end components config$'
    sed -i -e "/$LEAD/,/$TAIL/{ /$LEAD/{a components: {$COMPONENTS},
    }; /$TAIL/d; d }" $LOCALJS
  fi

  # set events listener fallback read delay
  if [ "$EVENTS_READ_DELAY" != "" ]; then
    sed -i "s|readDelay: 5000|readDelay: $EVENTS_READ_DELAY|g" $LOCALJS
  fi

  # clean file (remove identation, comment lines and blank lines)
  sed -i 's|^[[:blank:]]*||g' $LOCALJS
  sed -i 's|^[[:blank:]]*//.*||g' $LOCALJS
  sed -i '/^[[:space:]]*$/d' $LOCALJS

  echo "done"
}

update_localjs

exit 0
