export function distance_format(dist: number, longForm = true) {
  let prefix = '';
  let number = '';
  if (dist > 1e9) {
    prefix = 'billion';
    number = (dist / 1e9).toFixed(1);
  } else if (dist > 1e6) {
    prefix = 'million';
    number = (dist / 1e6).toFixed(1);
  } else if (dist > 1e3) {
    prefix = 'k';
    number = (dist / 1e3).toFixed(1);
  } else {
    number = dist.toFixed(1);
  }
  let unit = 'm';
  if (longForm)
    unit = 'meters';

  return number + ' ' + prefix + ' ' + unit;
}