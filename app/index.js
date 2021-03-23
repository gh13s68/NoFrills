import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { battery } from "power";
import { HeartRateSensor } from "heart-rate";
import { today, goals } from "user-activity";
import { display } from "display";
import { me } from "appbit";
import * as fs from "fs";

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element
const myTime = document.getElementById("myTime");
const myDate = document.getElementById("myDate");
const myBatt = document.getElementById("myBatt");
const battImg = document.getElementById("battimg");
const myHR = document.getElementById("myHR");
const mySteps = document.getElementById("mySteps");
const myCals = document.getElementById("myCals");
const myDist = document.getElementById("myDist");
const myStairs = document.getElementById("myStairs");
const myAM = document.getElementById("myAM");
const myHrSteps = document.getElementById("myHrSteps");

let stepsThisHour = 0;
let stepsOffset = today.adjusted.steps;
let now = new Date();

let ad;
//if file exists, get hour and offset
try
  {
    let ascii_read = fs.readFileSync("ascii.txt", "ascii");
    ad = ascii_read.split(";");}
catch(ex)
  {
    ad = [0,0];
  }
if(ad[0] == now.getHours())
  {
    stepsOffset = parseInt(ad[1]);
  } 
 


let delay = 60 * 60 * 1000; // 1 hour in msec
let start = delay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds();

var resetOffset = function(){
  console.log("entering interval");
    clearInterval(interval);
    start = delay;
    stepsOffset = today.adjusted.steps;
    interval = setInterval(resetOffset, start);
}

var interval = setInterval(resetOffset, start);

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let t = evt.date;
  let hours = t.getHours();
  let acthours = t.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(t.getMinutes());
  let ind = (preferences.clockDisplay === "12h" ? (acthours < 12 ? " AM": " PM") : "");
  let tm = hours + ":" + mins + ind;
  
  myTime.text = `${tm}`;
}

display.onchange = () => {
  let dtoday = new Date();
  let day = util.zeroPad(dtoday.getDate());
  let month = dtoday.getMonth() + 1;
  myDate.text = `${month}/${day}`;

  let batLev = battery.chargeLevel + "%";
  myBatt.text = `${batLev}`;

  let batVal = battery.chargeLevel;
  
  if (batVal > 90) {
    myBatt.style.fill = "green";
    battImg.href = "batt1.png";
  } else if (batVal > 20) {
    myBatt.style.fill = "gold"
    battImg.href = "batt2.png";
  } else {
    myBatt.style.fill = "red";
    battImg.href="batt3.png";
  }
  
  myHR.text = "--";
  let hrm = new HeartRateSensor;
  hrm.onreading = function(){
    if (!display.on) return;
    myHR.text = hrm.heartRate;
    hrm.stop();
  }
  if(display.on){
    hrm.start();
  }
  
  let lsp = today.adjusted.steps;
  let lspg = goals.steps;

  mySteps.text = `${lsp}`;
  mySteps.style.fill = util.formatText(lsp, lspg);

  stepsThisHour = today.adjusted.steps - stepsOffset;
  stepsThisHour = stepsThisHour > 250 ? 250 : stepsThisHour < 0 ? 0 : stepsThisHour;
  myHrSteps.text = `${stepsThisHour}`;
  myHrSteps.style.fill = util.formatText(stepsThisHour,250);
  
  let lc = today.adjusted.calories;
  let lcg = goals.calories;

  myCals.text = `${lc}`;
  myCals.style.fill = util.formatText(lc, lcg);

  let ld = today.adjusted.distance;
  let ldg = goals.distance;
  let dd = (ld * 0.000621);
  let drd = Math.round(dd * Math.pow(10, 2)) / Math.pow(10, 2)

  myDist.text = `${drd} mi.`;
  myDist.style.fill = util.formatText(ld, ldg);
  
  let lst = today.adjusted.elevationGain;
  let lstg = goals.elevationGain;

  myStairs.text = `${lst}`;
  myStairs.style.fill = util.formatText(lst, lstg);
  
  let lam = today.adjusted.activeMinutes;
  let lamg = goals.activeMinutes;

  myAM.text = `${lam}`;
  myAM.style.fill = util.formatText(lam, lamg);
}

me.onunload = () => {
  //write current hour and stepoffset to file
  let cd = new Date();
  let ch = cd.getHours();
  let ascii_data = ch + ";" + stepsOffset;
  fs.writeFileSync("ascii.txt", ascii_data, "ascii");
}