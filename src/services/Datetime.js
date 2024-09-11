import {
  format as _format,
  formatISO as _formatISO,
  isPast as _isPast,
  isFuture as _isFuture,
  parse as _parse,
  parseJSON as _parseJSON,
  set as _set,
  add,
  sub,
  formatDistance as _formatDistance,
  formatDistanceStrict as _formatDistanceStrict,
  formatDuration as _formatDuration,
  differenceInCalendarDays,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  parse as _durParse,
  serialize as _durSerialize,
} from 'tinyduration'

function tryParse (date) {
  if (typeof date.getMonth === 'function') {
    return date
  }
  if (typeof date === 'number') {
    return new Date(date)
  }
  return _parseJSON(date)
}

export function dtFormat (date, formatStr = 'PP') {
  if (formatStr === 'ISO') {
    return _formatISO(tryParse(date), {
      locale: fr,
    })
  }
  return _format(tryParse(date), formatStr, {
    locale: fr,
  })
}

export function dtParse (date, formatStr) {
  if (!formatStr) {
    return _parseJSON(date)
  }
  return _parse(date, formatStr)
}

export function dtSet(date, values) {
  return _set(tryParse(date), values)
}

export function dtAdd(date, duration) {
  return add(tryParse(date), duration)
}

export function dtSub(date, duration) {
  return sub(tryParse(date), duration)
}

export function dtMomentFromNow (date, dropFixes = false, isStrict = true) {
  return isStrict ?
    _formatDistanceStrict(tryParse(date), new Date(), {
      addSuffix: !dropFixes,
      locale: fr,
    }) :
    _formatDistance(tryParse(date), new Date(), {
      addSuffix: !dropFixes,
      locale: fr,
      includeSeconds: true,
    })
}

export function dtFormatDuration (duration, options = {}) {
  return _formatDuration(duration, {
    ...options,
    locale: fr,
  })
}

export function dtIsPast (date) {
  return _isPast(date)
}

export function dtIsFuture (date) {
  return _isFuture(date)
}

export function durParse (string) {
  return _durParse(string)
}

export function durFormat (duration) {
  return _durSerialize(duration)
}

export function durToMinutes (duration) {
  const _duration = typeof duration === 'string' ?
    _durParse(duration) : duration
  const units = {
    'years': 525600, 'months': 43800, 'weeks': 10080, 'days': 1440, 'hours': 60, 'minutes': 1, 'seconds': 0.016,
  }
  return Object.entries(units).reduce((acc, [key, value]) => {
    if (_duration[key] === undefined) {
      return acc
    }
    return acc + _duration[key] * value
  }, 0)
}

export function dtDifferenceInDays (date1, date2) {
  return differenceInCalendarDays (date1, date2)
}
