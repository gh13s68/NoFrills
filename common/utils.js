// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export function formatText(val, comp)
{
  var c;
  
  if (val == 0) {
    c = "red";
  //} else if (val < comp/2) {
  //  c = "darkorange";
  } else if (val < comp) {
    c = "gold";
  } else {
    c = "green";
  }
  return c;
}