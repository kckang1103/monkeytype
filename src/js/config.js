import * as DB from "./db";
import * as Misc from "./misc";
import * as Sound from "./sound";
import * as TestUI from "./test-ui";
import * as ChartController from "./chart-controller";
import * as OutOfFocus from "./out-of-focus";
import * as TimerProgress from "./timer-progress";
import * as LiveWpm from "./live-wpm";
import * as LiveAcc from "./live-acc";
import * as Funbox from "./funbox";
import * as Notifications from "./notifications";
import * as ThemeController from "./theme-controller";
import * as Keymap from "./keymap";
import * as LanguagePicker from "./language-picker";
import * as TestLogic from "./test-logic";
import * as PaceCaret from "./pace-caret";
import * as UI from "./ui";
import * as Tribe from "./tribe";
import * as CommandlineLists from "./commandline-lists";

export let cookieConfig = null;
export let dbConfigLoaded = false;
export let changedBeforeDb = false;

export function setCookieConfig(val) {
  cookieConfig = val;
}

export function setDbConfigLoaded(val) {
  dbConfigLoaded = val;
}

export function setChangedBeforeDb(val) {
  changedBeforeDb = val;
}

let loadDone;

let defaultConfig = {
  theme: "serika_dark",
  customTheme: false,
  customThemeColors: [
    "#323437",
    "#e2b714",
    "#e2b714",
    "#646669",
    "#d1d0c5",
    "#ca4754",
    "#7e2a33",
    "#ca4754",
    "#7e2a33",
  ],
  favThemes: [],
  showKeyTips: true,
  showLiveWpm: false,
  showTimerProgress: true,
  smoothCaret: true,
  quickTab: false,
  punctuation: false,
  numbers: false,
  words: 50,
  time: 30,
  mode: "time",
  quoteLength: [1],
  language: "english",
  fontSize: 15,
  freedomMode: false,
  resultFilters: null,
  difficulty: "normal",
  blindMode: false,
  quickEnd: false,
  caretStyle: "default",
  paceCaretStyle: "default",
  flipTestColors: false,
  capsLockBackspace: false,
  layout: "default",
  savedLayout: "default",
  confidenceMode: "off",
  indicateTypos: false,
  timerStyle: "text",
  colorfulMode: false,
  randomTheme: "off",
  timerColor: "black",
  timerOpacity: "0.25",
  stopOnError: "off",
  showAllLines: false,
  keymapMode: "off",
  keymapStyle: "staggered",
  keymapLayout: "qwerty",
  fontFamily: "Roboto_Mono",
  smoothLineScroll: false,
  alwaysShowDecimalPlaces: false,
  alwaysShowWordsHistory: false,
  singleListCommandLine: "manual",
  playSoundOnError: false,
  playSoundOnClick: "off",
  startGraphsAtZero: true,
  swapEscAndTab: false,
  showOutOfFocusWarning: true,
  paceCaret: "off",
  paceCaretCustomSpeed: 100,
  pageWidth: "100",
  chartAccuracy: true,
  chartStyle: "line",
  minWpm: "off",
  minWpmCustomSpeed: 100,
  highlightMode: "letter",
  alwaysShowCPM: false,
  enableAds: "off",
  hideExtraLetters: false,
  strictSpace: false,
  minAcc: "off",
  minAccCustom: 90,
  showLiveAcc: false,
  monkey: false,
  repeatQuotes: "off",
  oppositeShiftMode: "off",
  customBackground: "",
  customBackgroundSize: "cover",
};

function isConfigKeyValid(name) {
  if (name === null || name === undefined || name === "") return false;
  if (name.length > 30) return false;
  return /^[0-9a-zA-Z_.\-#+]+$/.test(name);
}

let config = {
  ...defaultConfig,
};

export async function saveToCookie(noDbCheck = false) {
  if (!dbConfigLoaded && !noDbCheck) {
    setChangedBeforeDb(true);
  }
  // let d = new Date();
  // d.setFullYear(d.getFullYear() + 1);
  // $.cookie("config", JSON.stringify(config), {
  //   expires: d,
  //   path: "/",
  // });
  let save = config;
  delete save.resultFilters;
  Misc.setCookie("config", JSON.stringify(save), 365);
  // restartCount = 0;
  if (!noDbCheck) await DB.saveConfig(save);
}

//numbers
export function setNumbers(numb, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (config.mode === "quote") {
    numb = false;
  }
  config.numbers = numb;
  if (!config.numbers) {
    $("#top .config .numbersMode .text-button").removeClass("active");
  } else {
    $("#top .config .numbersMode .text-button").addClass("active");
  }
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

export function toggleNumbers() {
  if (!Tribe.checkIfCanChangeConfig(false)) {
    return;
  }
  config.numbers = !config.numbers;
  if (config.mode === "quote") {
    config.numbers = false;
  }
  if (config.numbers) {
    $("#top .config .numbersMode .text-button").addClass("active");
  } else {
    $("#top .config .numbersMode .text-button").removeClass("active");
  }
  Tribe.syncConfig();
  saveToCookie();
}

//punctuation
export function setPunctuation(punc, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (config.mode === "quote") {
    punc = false;
  }
  config.punctuation = punc;
  if (!config.punctuation) {
    $("#top .config .punctuationMode .text-button").removeClass("active");
  } else {
    $("#top .config .punctuationMode .text-button").addClass("active");
  }
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

export function togglePunctuation() {
  if (!Tribe.checkIfCanChangeConfig(false)) {
    return;
  }
  config.punctuation = !config.punctuation;
  if (config.mode === "quote") {
    config.punctuation = false;
  }
  if (config.punctuation) {
    $("#top .config .punctuationMode .text-button").addClass("active");
  } else {
    $("#top .config .punctuationMode .text-button").removeClass("active");
  }
  Tribe.syncConfig();
  saveToCookie();
}

export function setMode(mode, nosave, mp = false) {
  if (TestUI.testRestarting) return;
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (mode !== "words" && Funbox.active === "memory") {
    Notifications.add("Memory funbox can only be used with words mode.", 0);
    return;
  }

  config.mode = mode;
  $("#top .config .mode .text-button").removeClass("active");
  $("#top .config .mode .text-button[mode='" + mode + "']").addClass("active");
  if (config.mode == "time") {
    $("#top .config .wordCount").addClass("hidden");
    $("#top .config .time").removeClass("hidden");
    $("#top .config .customText").addClass("hidden");
    $("#top .config .punctuationMode").removeClass("disabled");
    $("#top .config .numbersMode").removeClass("disabled");
    $("#top .config .punctuationMode").removeClass("hidden");
    $("#top .config .numbersMode").removeClass("hidden");
    $("#top .config .quoteLength").addClass("hidden");
  } else if (config.mode == "words") {
    $("#top .config .wordCount").removeClass("hidden");
    $("#top .config .time").addClass("hidden");
    $("#top .config .customText").addClass("hidden");
    $("#top .config .punctuationMode").removeClass("disabled");
    $("#top .config .numbersMode").removeClass("disabled");
    $("#top .config .punctuationMode").removeClass("hidden");
    $("#top .config .numbersMode").removeClass("hidden");
    $("#top .config .quoteLength").addClass("hidden");
  } else if (config.mode == "custom") {
    if (
      Funbox.active === "58008" ||
      Funbox.active === "gibberish" ||
      Funbox.active === "ascii"
    ) {
      Funbox.setAcitve("none");
      TestUI.updateModesNotice();
    }
    $("#top .config .wordCount").addClass("hidden");
    $("#top .config .time").addClass("hidden");
    $("#top .config .customText").removeClass("hidden");
    $("#top .config .punctuationMode").removeClass("disabled");
    $("#top .config .numbersMode").removeClass("disabled");
    $("#top .config .punctuationMode").removeClass("hidden");
    $("#top .config .numbersMode").removeClass("hidden");
    $("#top .config .quoteLength").addClass("hidden");
    setPunctuation(false, true, mp);
    setNumbers(false, true, mp);
  } else if (config.mode == "quote") {
    setPunctuation(false, nosave, mp);
    setNumbers(false, nosave, mp);
    $("#top .config .wordCount").addClass("hidden");
    $("#top .config .time").addClass("hidden");
    $("#top .config .customText").addClass("hidden");
    $("#top .config .punctuationMode").addClass("disabled");
    $("#top .config .numbersMode").addClass("disabled");
    $("#top .config .punctuationMode").removeClass("hidden");
    $("#top .config .numbersMode").removeClass("hidden");
    $("#result .stats .source").removeClass("hidden");
    $("#top .config .quoteLength").removeClass("hidden");
  } else if (config.mode == "zen") {
    $("#top .config .wordCount").addClass("hidden");
    $("#top .config .time").addClass("hidden");
    $("#top .config .customText").addClass("hidden");
    $("#top .config .punctuationMode").addClass("hidden");
    $("#top .config .numbersMode").addClass("hidden");
    $("#top .config .quoteLength").addClass("hidden");
    if (config.paceCaret != "off") {
      Notifications.add(`Pace caret will not work with zen mode.`, 0);
    }
    // setPaceCaret("off", true);
  }
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

export function setPlaySoundOnError(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  config.playSoundOnError = val;
  if (!nosave) saveToCookie();
}

export function setPlaySoundOnClick(val, nosave) {
  if (val == undefined) {
    val = "off";
  }
  config.playSoundOnClick = val;
  if (config.playSoundOnClick !== "off") Sound.init();
  if (!nosave) saveToCookie();
}

export function togglePlaySoundOnError() {
  config.playSoundOnError = !config.playSoundOnError;
  if (config.playSoundOnError == undefined) {
    config.playSoundOnError = false;
  }
}

//difficulty
export function setDifficulty(diff, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (
    (diff !== "normal" && diff !== "expert" && diff !== "master") ||
    diff == undefined
  ) {
    diff = "normal";
  }
  config.difficulty = diff;
  if (!nosave) TestLogic.restart(false, nosave, mp);
  TestUI.updateModesNotice();
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

//set fav themes
export function setFavThemes(themes, nosave) {
  config.favThemes = themes;
  if (!nosave) {
    saveToCookie();
  }
}

//blind mode
export function toggleBlindMode() {
  let blind = !config.blindMode;
  if (blind == undefined) {
    blind = false;
  }
  config.blindMode = blind;
  TestUI.updateModesNotice();
  Tribe.syncConfig();
  saveToCookie();
}

export function setBlindMode(blind, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (blind == undefined) {
    blind = false;
  }
  config.blindMode = blind;
  TestUI.updateModesNotice();
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

function updateChartAccuracy() {
  ChartController.accountHistory.data.datasets[1].hidden = !config.chartAccuracy;
  ChartController.accountHistory.options.scales.yAxes[1].display =
    config.chartAccuracy;
  ChartController.accountHistory.update();
}

export function updateChartStyle() {
  if (config.chartStyle == "scatter") {
    ChartController.accountHistory.data.datasets[0].showLine = false;
    ChartController.accountHistory.data.datasets[1].showLine = false;
  } else {
    ChartController.accountHistory.data.datasets[0].showLine = true;
    ChartController.accountHistory.data.datasets[1].showLine = true;
  }
  ChartController.accountHistory.update();
}

export function toggleChartAccuracy() {
  if (config.chartAccuracy) {
    config.chartAccuracy = false;
  } else {
    config.chartAccuracy = true;
  }
  updateChartAccuracy();
  saveToCookie();
}

export function setChartAccuracy(chartAccuracy, nosave) {
  if (chartAccuracy == undefined) {
    chartAccuracy = true;
  }
  config.chartAccuracy = chartAccuracy;
  updateChartAccuracy();
  if (!nosave) saveToCookie();
}

export function toggleChartStyle() {
  if (config.chartStyle == "scatter") {
    config.chartStyle = "line";
  } else {
    config.chartStyle = "scatter";
  }
  updateChartStyle();
  saveToCookie();
}

export function setChartStyle(chartStyle, nosave) {
  if (chartStyle == undefined) {
    chartStyle = "line";
  }
  config.chartStyle = chartStyle;
  updateChartStyle();
  if (!nosave) saveToCookie();
}

export function setStopOnError(soe, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (soe == undefined || soe === true || soe === false) {
    soe = "off";
  }
  config.stopOnError = soe;
  if (config.stopOnError !== "off") {
    config.confidenceMode = "off";
  }
  TestUI.updateModesNotice();
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

//alwaysshowdecimal
export function toggleAlwaysShowDecimalPlaces() {
  config.alwaysShowDecimalPlaces = !config.alwaysShowDecimalPlaces;
  saveToCookie();
}

export function setAlwaysShowDecimalPlaces(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  config.alwaysShowDecimalPlaces = val;
  if (!nosave) saveToCookie();
}

export function toggleAlwaysShowCPM() {
  config.alwaysShowCPM = !config.alwaysShowCPM;
  saveToCookie();
}

export function setAlwaysShowCPM(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  config.alwaysShowCPM = val;
  if (!nosave) saveToCookie();
}

//show out of focus warning
export function toggleShowOutOfFocusWarning() {
  config.showOutOfFocusWarning = !config.showOutOfFocusWarning;
  if (!config.showOutOfFocusWarning) {
    OutOfFocus.hide();
  }
  saveToCookie();
}

export function setShowOutOfFocusWarning(val, nosave) {
  if (val == undefined) {
    val = true;
  }
  config.showOutOfFocusWarning = val;
  if (!config.showOutOfFocusWarning) {
    OutOfFocus.hide();
  }
  if (!nosave) saveToCookie();
}

//swap esc and tab
export function toggleSwapEscAndTab() {
  config.swapEscAndTab = !config.swapEscAndTab;
  saveToCookie();
  UI.updateKeytips();
}

export function setSwapEscAndTab(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  config.swapEscAndTab = val;
  UI.updateKeytips();
  if (!nosave) saveToCookie();
}

//pace caret
export function setPaceCaret(val, nosave) {
  if (val == undefined) {
    val = "off";
  }
  // if (val == "pb" && firebase.auth().currentUser === null) {
  //   Notifications.add("PB pace caret is unavailable without an account", 0);
  //   return;
  // }
  // if (config.mode === "zen" && val != "off") {
  //   Notifications.add(`Can't use pace caret with zen mode.`, 0);
  //   val = "off";
  // }
  config.paceCaret = val;
  TestUI.updateModesNotice();
  PaceCaret.init(nosave);
  if (!nosave) saveToCookie();
}

export function setPaceCaretCustomSpeed(val, nosave) {
  if (val == undefined || Number.isNaN(parseInt(val))) {
    val = 100;
  }
  config.paceCaretCustomSpeed = val;
  if (!nosave) saveToCookie();
}

//min wpm
export function setMinWpm(minwpm, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (minwpm == undefined) {
    minwpm = "off";
  }
  config.minWpm = minwpm;
  TestUI.updateModesNotice();
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

export function setMinWpmCustomSpeed(val, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (val == undefined || Number.isNaN(parseInt(val))) {
    val = 100;
  }
  config.minWpmCustomSpeed = val;
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

//min acc
export function setMinAcc(min, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (min == undefined) {
    min = "off";
  }
  config.minAcc = min;
  TestUI.updateModesNotice();
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

export function setMinAccCustom(val, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (val == undefined || Number.isNaN(parseInt(val))) {
    val = 90;
  }
  config.minAccCustom = val;
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

//always show words history
export function setAlwaysShowWordsHistory(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  config.alwaysShowWordsHistory = val;
  if (!nosave) saveToCookie();
}

export function toggleAlwaysShowWordsHistory() {
  let val = !config.alwaysShowWordsHistory;
  if (val == undefined) {
    val = false;
  }
  config.alwaysShowWordsHistory = val;
  saveToCookie();
}

//single list command line
export function setSingleListCommandLine(option, nosave) {
  if (!option) option = "manual";
  config.singleListCommandLine = option;
  if (!nosave) saveToCookie();
}

//show all lines
export function toggleShowAllLines() {
  let sal = !config.showAllLines;
  if (sal == undefined) {
    sal = false;
  }
  config.showAllLines = sal;
  TestLogic.restart();
  saveToCookie();
}

export function setShowAllLines(sal, nosave) {
  if (sal == undefined) {
    sal = false;
  }
  config.showAllLines = sal;
  if (!nosave) {
    saveToCookie();
    TestLogic.restart();
  }
}

//quickend
export function toggleQuickEnd() {
  let qe = !config.quickEnd;
  if (qe == undefined) {
    qe = false;
  }
  config.quickEnd = qe;
  saveToCookie();
}

export function setQuickEnd(qe, nosave) {
  if (qe == undefined) {
    qe = false;
  }
  config.quickEnd = qe;
  if (!nosave) saveToCookie();
}

export function setEnableAds(val, nosave) {
  if (val == undefined || val === true || val === false) {
    val = "off";
  }
  config.enableAds = val;
  if (!nosave) saveToCookie();
}

export function setRepeatQuotes(val, nosave) {
  if (val == undefined || val === true || val === false) {
    val = "off";
  }
  config.repeatQuotes = val;
  if (!nosave) saveToCookie();
}

//flip colors
export function setFlipTestColors(flip, nosave) {
  if (flip == undefined) {
    flip = false;
  }
  config.flipTestColors = flip;
  TestUI.flipColors(flip);
  if (!nosave) saveToCookie();
}

export function toggleFlipTestColors() {
  config.flipTestColors = !config.flipTestColors;
  TestUI.flipColors(config.flipTestColors);
  saveToCookie();
}

//extra color
export function setColorfulMode(extra, nosave) {
  if (extra == undefined) {
    extra = false;
  }
  config.colorfulMode = extra;
  TestUI.colorful(extra);
  if (!nosave) saveToCookie();
}

export function toggleColorfulMode() {
  config.colorfulMode = !config.colorfulMode;
  TestUI.colorful(config.colorfulMode);
  saveToCookie();
}

//strict space
export function setStrictSpace(val, nosave) {
  if (val == undefined) {
    val = false;
  }
  config.strictSpace = val;
  if (!nosave) saveToCookie();
}

export function toggleStrictSpace() {
  config.strictSpace = !config.strictSpace;
  saveToCookie();
}

//opposite shift space
export function setOppositeShiftMode(val, nosave) {
  if (val == undefined) {
    val = "off";
  }
  config.oppositeShiftMode = val;
  if (!nosave) saveToCookie();
}

export function setPageWidth(val, nosave) {
  if (val == null || val == undefined) {
    val = "100";
  }
  config.pageWidth = val;
  $("#centerContent").removeClass("wide125");
  $("#centerContent").removeClass("wide150");
  $("#centerContent").removeClass("wide200");
  $("#centerContent").removeClass("widemax");

  if (val !== "100") {
    $("#centerContent").addClass("wide" + val);
  }
  if (!nosave) saveToCookie();
}

export function setCaretStyle(caretStyle, nosave) {
  if (caretStyle == null || caretStyle == undefined) {
    caretStyle = "default";
  }
  config.caretStyle = caretStyle;
  $("#caret").removeClass("off");
  $("#caret").removeClass("default");
  $("#caret").removeClass("underline");
  $("#caret").removeClass("outline");
  $("#caret").removeClass("block");
  $("#caret").removeClass("carrot");

  if (caretStyle == "off") {
    $("#caret").addClass("off");
  } else if (caretStyle == "default") {
    $("#caret").addClass("default");
  } else if (caretStyle == "block") {
    $("#caret").addClass("block");
  } else if (caretStyle == "outline") {
    $("#caret").addClass("outline");
  } else if (caretStyle == "underline") {
    $("#caret").addClass("underline");
  } else if (caretStyle == "carrot") {
    $("#caret").addClass("carrot");
  }
  if (!nosave) saveToCookie();
}

export function setPaceCaretStyle(caretStyle, nosave) {
  if (caretStyle == null || caretStyle == undefined) {
    caretStyle = "default";
  }
  config.paceCaretStyle = caretStyle;
  $("#paceCaret").removeClass("off");
  $("#paceCaret").removeClass("default");
  $("#paceCaret").removeClass("underline");
  $("#paceCaret").removeClass("outline");
  $("#paceCaret").removeClass("block");

  if (caretStyle == "off") {
    $("#paceCaret").addClass("off");
  } else if (caretStyle == "default") {
    $("#paceCaret").addClass("default");
  } else if (caretStyle == "block") {
    $("#paceCaret").addClass("block");
  } else if (caretStyle == "outline") {
    $("#paceCaret").addClass("outline");
  } else if (caretStyle == "underline") {
    $("#paceCaret").addClass("underline");
  }
  if (!nosave) saveToCookie();
}

export function setShowTimerProgress(timer, nosave) {
  if (timer == null || timer == undefined) {
    timer = false;
  }
  config.showTimerProgress = timer;
  if (config.showTimerProgress) {
    TimerProgress.show();
  } else {
    TimerProgress.hide();
  }
  if (!nosave) saveToCookie();
}

export function toggleShowTimerProgress() {
  config.showTimerProgress = !config.showTimerProgress;
  if (config.showTimerProgress) {
    TimerProgress.show();
  } else {
    TimerProgress.hide();
  }
  saveToCookie();
}

export function setShowLiveWpm(live, nosave) {
  if (live == null || live == undefined) {
    live = false;
  }
  config.showLiveWpm = live;
  if (live) {
    LiveWpm.show();
  } else {
    LiveWpm.hide();
  }
  if (!nosave) saveToCookie();
}

export function toggleShowLiveWpm() {
  config.showLiveWpm = !config.showLiveWpm;
  if (config.showLiveWpm) {
    LiveWpm.show();
  } else {
    LiveWpm.hide();
  }
  saveToCookie();
}

export function setShowLiveAcc(live, nosave) {
  if (live == null || live == undefined) {
    live = false;
  }
  config.showLiveAcc = live;
  if (live) {
    LiveAcc.show();
  } else {
    LiveAcc.hide();
  }
  if (!nosave) saveToCookie();
}

export function toggleLiveAcc() {
  config.showLiveAcc = !config.showLiveAcc;
  if (config.showLiveAcc) {
    LiveAcc.show();
  } else {
    LiveAcc.hide();
  }
  saveToCookie();
}

export function setHighlightMode(mode, nosave) {
  if (
    mode === "word" &&
    (Funbox.active === "nospace" ||
      Funbox.active === "read_ahead" ||
      Funbox.active === "read_ahead_easy" ||
      Funbox.active === "read_ahead_hard")
  ) {
    Notifications.add("Can't use word highlight with this funbox", 0);
    return;
  }
  if (mode == null || mode == undefined) {
    mode = "letter";
  }
  config.highlightMode = mode;
  if (!nosave) saveToCookie();
}

export function setHideExtraLetters(val, nosave) {
  if (val == null || val == undefined) {
    val = false;
  }
  config.hideExtraLetters = val;
  if (!nosave) saveToCookie();
}

export function toggleHideExtraLetters() {
  config.hideExtraLetters = !config.hideExtraLetters;
  saveToCookie();
}

export function setTimerStyle(style, nosave) {
  if (style == null || style == undefined) {
    style = "bar";
  }
  if (Tribe.state >= 10 && style != "mini") {
    Notifications.add("You can only use the mini timer style in Tribe", 0);
    return;
  }
  config.timerStyle = style;
  if (!nosave) saveToCookie();
}

export function setTimerColor(color, nosave) {
  if (color == null || color == undefined) {
    color = "black";
  }
  config.timerColor = color;

  $("#timer").removeClass("timerSub");
  $("#timer").removeClass("timerText");
  $("#timer").removeClass("timerMain");

  $("#timerNumber").removeClass("timerSub");
  $("#timerNumber").removeClass("timerText");
  $("#timerNumber").removeClass("timerMain");

  $("#largeLiveWpmAndAcc").removeClass("timerSub");
  $("#largeLiveWpmAndAcc").removeClass("timerText");
  $("#largeLiveWpmAndAcc").removeClass("timerMain");

  $("#miniTimerAndLiveWpm").removeClass("timerSub");
  $("#miniTimerAndLiveWpm").removeClass("timerText");
  $("#miniTimerAndLiveWpm").removeClass("timerMain");

  if (color === "main") {
    $("#timer").addClass("timerMain");
    $("#timerNumber").addClass("timerMain");
    $("#largeLiveWpmAndAcc").addClass("timerMain");
    $("#miniTimerAndLiveWpm").addClass("timerMain");
  } else if (color === "sub") {
    $("#timer").addClass("timerSub");
    $("#timerNumber").addClass("timerSub");
    $("#largeLiveWpmAndAcc").addClass("timerSub");
    $("#miniTimerAndLiveWpm").addClass("timerSub");
  } else if (color === "text") {
    $("#timer").addClass("timerText");
    $("#timerNumber").addClass("timerText");
    $("#largeLiveWpmAndAcc").addClass("timerText");
    $("#miniTimerAndLiveWpm").addClass("timerText");
  }

  if (!nosave) saveToCookie();
}
export function setTimerOpacity(opacity, nosave) {
  if (opacity == null || opacity == undefined) {
    opacity = 0.25;
  }
  config.timerOpacity = opacity;
  if (!nosave) saveToCookie();
}

//key tips
export function setKeyTips(keyTips, nosave) {
  config.showKeyTips = keyTips;
  if (config.showKeyTips) {
    $("#bottom .keyTips").removeClass("hidden");
  } else {
    $("#bottom .keyTips").addClass("hidden");
  }
  if (!nosave) saveToCookie();
}

export function toggleKeyTips() {
  config.showKeyTips = !config.showKeyTips;
  if (config.showKeyTips) {
    $("#bottom .keyTips").removeClass("hidden");
  } else {
    $("#bottom .keyTips").addClass("hidden");
  }
  saveToCookie();
}

//mode
export function setTimeConfig(time, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (time === null || isNaN(time) || time < 0) {
    time = 15;
  }
  time = parseInt(time);
  if (!nosave) setMode("time", nosave, mp);
  config.time = time;
  $("#top .config .time .text-button").removeClass("active");
  if (![15, 30, 60, 120].includes(time)) {
    time = "custom";
  }
  $("#top .config .time .text-button[timeConfig='" + time + "']").addClass(
    "active"
  );
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

//quote length
export function setQuoteLength(len, nosave, multipleMode, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (Array.isArray(len)) {
    //config load
    if (len.length === 1 && len[0] === -1) len = [1];
    config.quoteLength = len;
  } else {
    if (!Array.isArray(config.quoteLength)) config.quoteLength = [];
    if (len === null || isNaN(len) || len < -2 || len > 3) {
      len = 1;
    }
    len = parseInt(len);
    if (multipleMode) {
      if (!config.quoteLength.includes(len)) config.quoteLength.push(len);
    } else {
      config.quoteLength = [len];
    }
  }
  // if (!nosave) setMode("quote", nosave);
  $("#top .config .quoteLength .text-button").removeClass("active");
  config.quoteLength.forEach((ql) => {
    $(
      "#top .config .quoteLength .text-button[quoteLength='" + ql + "']"
    ).addClass("active");
  });
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

export function setWordCount(wordCount, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (wordCount === null || isNaN(wordCount) || wordCount < 0) {
    wordCount = 10;
  }
  wordCount = parseInt(wordCount);
  if (!nosave) setMode("words", nosave, mp);
  config.words = wordCount;
  $("#top .config .wordCount .text-button").removeClass("active");
  if (![10, 25, 50, 100, 200].includes(wordCount)) {
    wordCount = "custom";
  }
  $(
    "#top .config .wordCount .text-button[wordCount='" + wordCount + "']"
  ).addClass("active");
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

//caret
export function setSmoothCaret(mode, nosave) {
  config.smoothCaret = mode;
  if (!nosave) saveToCookie();
  if (mode) {
    $("#caret").css("animation-name", "caretFlashSmooth");
  } else {
    $("#caret").css("animation-name", "caretFlashHard");
  }
}

export function toggleSmoothCaret() {
  config.smoothCaret = !config.smoothCaret;
  saveToCookie();
  if (config.smoothCaret) {
    $("#caret").css("animation-name", "caretFlashSmooth");
  } else {
    $("#caret").css("animation-name", "caretFlashHard");
  }
}

//startgraphsatzero
export function toggleStartGraphsAtZero() {
  config.startGraphsAtZero = !config.startGraphsAtZero;
  saveToCookie();
}

export function setStartGraphsAtZero(mode, nosave) {
  config.startGraphsAtZero = mode;
  if (!nosave) saveToCookie();
}

//linescroll
export function setSmoothLineScroll(mode, nosave) {
  config.smoothLineScroll = mode;
  if (!nosave) saveToCookie();
}

export function toggleSmoothLineScroll() {
  config.smoothLineScroll = !config.smoothLineScroll;
  saveToCookie();
}

//quick tab
export function setQuickTabMode(mode, nosave) {
  config.quickTab = mode;
  if (!config.quickTab) {
    $("#restartTestButton").removeClass("hidden");
    $("#restartTestButton").css("opacity", 1);
    $("#bottom .keyTips")
      .html(`<key>tab</key> and <key>enter</key> / <key>space</key> - restart test<br>
      <key>esc</key> - command line`);
  } else {
    $("#restartTestButton").addClass("hidden");
    $("#bottom .keyTips").html(`<key>tab</key> - restart test<br>
      <key>esc</key> - command line`);
  }
  if (!nosave) saveToCookie();
}

export function toggleQuickTabMode() {
  console.log("before change");
  console.log(config.quickTab);
  config.quickTab = !config.quickTab;
  if (!config.quickTab) {
    $("#restartTestButton").removeClass("hidden");
    $("#restartTestButton").css("opacity", 1);
    $("#bottom .keyTips")
      .html(`<key>tab</key> and <key>enter</key> / <key>space</key> - restart test<br>
      <key>esc</key> - command line`);
  } else {
    $("#restartTestButton").addClass("hidden");
    $("#bottom .keyTips").html(`<key>tab</key> - restart test<br>
      <key>esc</key> - command line`);
  }
  console.log("after change");
  console.log(config.quickTab);
  console.log("before save");
  console.log(config.quickTab);
  saveToCookie();
  console.log("after save");
  console.log(config.quickTab);
}

export function previewFontFamily(font) {
  if (font == undefined) {
    font = "Roboto_Mono";
  }
  document.documentElement.style.setProperty(
    "--font",
    '"' + font.replace(/_/g, " ") + '"'
  );
}

//font family
export function setFontFamily(font, nosave) {
  if (font == undefined || font === "") {
    font = "Roboto_Mono";
    Notifications.add(
      "Empty input received, reverted to the default font.",
      0,
      3,
      "Custom font"
    );
  }
  if (!isConfigKeyValid(font)) {
    Notifications.add(
      `Invalid font name value: "${font}".`,
      -1,
      3,
      "Custom font"
    );
    return;
  }
  config.fontFamily = font;
  document.documentElement.style.setProperty(
    "--font",
    '"' + font.replace(/_/g, " ") + '"'
  );
  ChartController.setDefaultFontFamily(font);
  if (!nosave) saveToCookie();
}

//freedom
export function setFreedomMode(freedom, nosave) {
  if (freedom == null) {
    freedom = false;
  }
  config.freedomMode = freedom;
  if (config.freedomMode && config.confidenceMode !== "off") {
    config.confidenceMode = "off";
  }
  if (!nosave) saveToCookie();
}

export function toggleFreedomMode() {
  config.freedomMode = !config.freedomMode;
  if (config.freedomMode && config.confidenceMode !== "off") {
    config.confidenceMode = false;
  }
  saveToCookie();
}

export function setConfidenceMode(cm, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (cm == undefined) {
    cm = "off";
  }
  config.confidenceMode = cm;
  if (config.confidenceMode !== "off") {
    config.freedomMode = false;
    config.stopOnError = "off";
  }
  Tribe.syncConfig();
  TestUI.updateModesNotice();
  if (!nosave) saveToCookie();
}

export function toggleIndicateTypos() {
  let it = !config.indicateTypos;
  if (it == undefined) {
    it = false;
  }
  config.indicateTypos = it;
  saveToCookie();
}

export function setIndicateTypos(it, nosave) {
  if (it == undefined) {
    it = false;
  }
  config.indicateTypos = it;
  if (!nosave) saveToCookie();
}

export function setCustomTheme(boolean, nosave) {
  if (boolean !== undefined) config.customTheme = boolean;
  if (boolean) {
    ThemeController.set("custom");
  } else if (!boolean && !nosave) {
    ThemeController.set(config.theme);
  }
  if (!nosave) saveToCookie();
}

export function setTheme(name, nosave) {
  config.theme = name;
  setCustomTheme(false, true, true);
  ThemeController.set(config.theme);
  if (!nosave) saveToCookie();
}

export function setRandomTheme(val, nosave) {
  if (val === undefined || val === true || val === false) {
    val = "off";
  }
  if (val === "off") {
    ThemeController.clearRandom();
  }
  config.randomTheme = val;
  if (!nosave) saveToCookie();
}

export function toggleCustomTheme(nosave) {
  if (config.customTheme) {
    setCustomTheme(false);
    ThemeController.set(config.theme);
  } else {
    setCustomTheme(true);
    ThemeController.set("custom");
  }
  if (!nosave) saveToCookie();
}

export function setCustomThemeColors(colors, nosave) {
  if (colors !== undefined) {
    config.customThemeColors = colors;
    // ThemeController.set("custom");
    // applyCustomThemeColors();
  }
  if (!nosave) saveToCookie();
}

export function setLanguage(language, nosave, mp = false) {
  if (!Tribe.checkIfCanChangeConfig(mp)) {
    return;
  }
  if (language == null || language == undefined) {
    language = "english";
  }
  config.language = language;
  try {
    firebase.analytics().logEvent("changedLanguage", {
      language: language,
    });
  } catch (e) {
    console.log("Analytics unavailable");
  }
  Tribe.syncConfig();
  if (!nosave) saveToCookie();
}

export function toggleMonkey(nosave) {
  config.monkey = !config.monkey;
  if (config.monkey) {
    $("#monkey").removeClass("hidden");
  } else {
    $("#monkey").addClass("hidden");
  }
  if (!nosave) saveToCookie();
}

export function setMonkey(monkey, nosave) {
  if (monkey === null || monkey === undefined) {
    monkey = false;
  }
  config.monkey = monkey;
  if (config.monkey) {
    $("#monkey").removeClass("hidden");
  } else {
    $("#monkey").addClass("hidden");
  }
  if (!nosave) saveToCookie();
}

export function setCapsLockBackspace(capsLockBackspace, nosave) {
  if (capsLockBackspace === null || capsLockBackspace === undefined) {
    capsLockBackspace = false;
  }
  config.capsLockBackspace = capsLockBackspace;
  if (!nosave) saveToCookie();
}

export function toggleCapsLockBackspace() {
  setCapsLockBackspace(!config.capsLockBackspace, false);
}

export function setKeymapMode(mode, nosave) {
  if (mode == null || mode == undefined) {
    mode = "off";
  }
  $(".active-key").removeClass("active-key");
  $(".keymap-key").attr("style", "");
  config.keymapMode = mode;
  if (!nosave) TestLogic.restart(false, nosave);
  if (!nosave) saveToCookie();
}

export function setKeymapStyle(style, nosave) {
  $(".keymap").removeClass("matrix");
  $(".keymap").removeClass("split");
  $(".keymap").removeClass("split_matrix");

  if (style == null || style == undefined) {
    style = "staggered";
  }

  if (style === "matrix") {
    $(".keymap").addClass("matrix");
  } else if (style === "split") {
    $(".keymap").addClass("split");
  } else if (style === "split_matrix") {
    $(".keymap").addClass("split_matrix");
  }
  config.keymapStyle = style;
  if (!nosave) saveToCookie();
}

export function setKeymapLayout(layout, nosave) {
  if (layout == null || layout == undefined) {
    layout = "qwerty";
  }
  config.keymapLayout = layout;
  Keymap.refreshKeys(layout, setKeymapLayout);
  if (!nosave) saveToCookie();
}

export function setLayout(layout, nosave) {
  if (layout == null || layout == undefined) {
    layout = "qwerty";
  }
  config.layout = layout;
  TestUI.updateModesNotice();
  if (config.keymapLayout === "overrideSync") {
    Keymap.refreshKeys(config.keymapLayout, setKeymapLayout);
  }
  if (!nosave) saveToCookie();
}

export function setSavedLayout(layout, nosave) {
  if (layout == null || layout == undefined) {
    layout = "qwerty";
  }
  config.savedLayout = layout;
  setLayout(layout, nosave);
}

export function setFontSize(fontSize, nosave) {
  if (fontSize == null || fontSize == undefined) {
    fontSize = 1;
  }
  config.fontSize = fontSize;
  $("#words").removeClass("size125");
  $("#words").removeClass("size15");
  $("#words").removeClass("size2");
  $("#words").removeClass("size3");

  $("#caret, #paceCaret").removeClass("size125");
  $("#caret, #paceCaret").removeClass("size15");
  $("#caret, #paceCaret").removeClass("size2");
  $("#caret, #paceCaret").removeClass("size3");

  $("#miniTimerAndLiveWpm").removeClass("size125");
  $("#miniTimerAndLiveWpm").removeClass("size15");
  $("#miniTimerAndLiveWpm").removeClass("size2");
  $("#miniTimerAndLiveWpm").removeClass("size3");

  $("#typingTest .tribePlayers").removeClass("size125");
  $("#typingTest .tribePlayers").removeClass("size15");
  $("#typingTest .tribePlayers").removeClass("size2");
  $("#typingTest .tribePlayers").removeClass("size3");

  $("#tribeDiff").removeClass("size125");
  $("#tribeDiff").removeClass("size15");
  $("#tribeDiff").removeClass("size2");
  $("#tribeDiff").removeClass("size3");

  if (fontSize == 125) {
    $("#words").addClass("size125");
    $("#caret, #paceCaret").addClass("size125");
    $("#miniTimerAndLiveWpm").addClass("size125");
    $("#typingTest .tribePlayers").addClass("size125");
    $("#tribeDiff").addClass("size125");
  } else if (fontSize == 15) {
    $("#words").addClass("size15");
    $("#caret, #paceCaret").addClass("size15");
    $("#miniTimerAndLiveWpm").addClass("size15");
    $("#typingTest .tribePlayers").addClass("size15");
    $("#tribeDiff").addClass("size15");
  } else if (fontSize == 2) {
    $("#words").addClass("size2");
    $("#caret, #paceCaret").addClass("size2");
    $("#miniTimerAndLiveWpm").addClass("size2");
    $("#typingTest .tribePlayers").addClass("size2");
    $("#tribeDiff").addClass("size2");
  } else if (fontSize == 3) {
    $("#words").addClass("size3");
    $("#caret, #paceCaret").addClass("size3");
    $("#miniTimerAndLiveWpm").addClass("size3");
    $("#typingTest .tribePlayers").addClass("size3");
    $("#tribeDiff").addClass("size3");
  }
  if (!nosave) saveToCookie();
}

export function setCustomBackground(value, nosave) {
  if (value == null || value == undefined) {
    value = "";
  }
  value = value.trim();
  if (
    /(https|http):\/\/(www\.|).+\..+\/.+(\.png|\.gif|\.jpeg|\.jpg)/gi.test(
      value
    ) ||
    value == ""
  ) {
    config.customBackground = value;
    CommandlineLists.defaultCommands.list.filter(
      (command) => command.id == "changeCustomBackground"
    )[0].defaultValue = value;
    ThemeController.applyCustomBackground();
    if (!nosave) saveToCookie();
  } else {
    Notifications.add("Invalid custom background URL", 0);
  }
}

export function setCustomBackgroundSize(value, nosave) {
  if (value != "cover" && value != "contain") {
    value = "cover";
  }
  config.customBackgroundSize = value;
  ThemeController.applyCustomBackgroundSize();
  if (!nosave) saveToCookie();
}

export function apply(configObj) {
  if (configObj == null || configObj == undefined) {
    Notifications.add("Could not apply config", -1, 3);
    return;
  }
  Object.keys(defaultConfig).forEach((configKey) => {
    if (configObj[configKey] === undefined) {
      configObj[configKey] = defaultConfig[configKey];
    }
  });
  if (configObj && configObj != null && configObj != "null") {
    setTheme(configObj.theme, true);
    setCustomThemeColors(configObj.customThemeColors, true);
    setCustomTheme(configObj.customTheme, true, true);
    setCustomBackground(configObj.customBackground, true);
    setCustomBackgroundSize(configObj.customBackgroundSize, true);
    setQuickTabMode(configObj.quickTab, true);
    setKeyTips(configObj.showKeyTips, true);
    setTimeConfig(configObj.time, true);
    setQuoteLength(configObj.quoteLength, true);
    setWordCount(configObj.words, true);
    setLanguage(configObj.language, true);
    setCapsLockBackspace(configObj.capsLockBackspace, true);
    setSavedLayout(configObj.savedLayout, true);
    setFontSize(configObj.fontSize, true);
    setFreedomMode(configObj.freedomMode, true);
    setCaretStyle(configObj.caretStyle, true);
    setPaceCaretStyle(configObj.paceCaretStyle, true);
    setDifficulty(configObj.difficulty, true);
    setBlindMode(configObj.blindMode, true);
    setQuickEnd(configObj.quickEnd, true);
    setFlipTestColors(configObj.flipTestColors, true);
    setColorfulMode(configObj.colorfulMode, true);
    setConfidenceMode(configObj.confidenceMode, true);
    setIndicateTypos(configObj.indicateTypos, true);
    setTimerStyle(configObj.timerStyle, true);
    setTimerColor(configObj.timerColor, true);
    setTimerOpacity(configObj.timerOpacity, true);
    setKeymapMode(configObj.keymapMode, true);
    setKeymapStyle(configObj.keymapStyle, true);
    setKeymapLayout(configObj.keymapLayout, true);
    setFontFamily(configObj.fontFamily, true);
    setSmoothCaret(configObj.smoothCaret, true);
    setSmoothLineScroll(configObj.smoothLineScroll, true);
    setShowLiveWpm(configObj.showLiveWpm, true);
    setShowLiveAcc(configObj.showLiveAcc, true);
    setShowTimerProgress(configObj.showTimerProgress, true);
    setAlwaysShowDecimalPlaces(configObj.alwaysShowDecimalPlaces, true);
    setAlwaysShowWordsHistory(configObj.alwaysShowWordsHistory, true);
    setSingleListCommandLine(configObj.singleListCommandLine, true);
    setPlaySoundOnError(configObj.playSoundOnError, true);
    setPlaySoundOnClick(configObj.playSoundOnClick, true);
    setStopOnError(configObj.stopOnError, true);
    setFavThemes(configObj.favThemes, true);
    setRandomTheme(configObj.randomTheme, true);
    setShowAllLines(configObj.showAllLines, true);
    setSwapEscAndTab(configObj.swapEscAndTab, true);
    setShowOutOfFocusWarning(configObj.showOutOfFocusWarning, true);
    setPaceCaret(configObj.paceCaret, true);
    setPaceCaretCustomSpeed(configObj.paceCaretCustomSpeed, true);
    setPageWidth(configObj.pageWidth, true);
    setChartAccuracy(configObj.chartAccuracy, true);
    setChartStyle(configObj.chartStyle, true);
    setMinWpm(configObj.minWpm, true);
    setMinWpmCustomSpeed(configObj.minWpmCustomSpeed, true);
    setMinAcc(configObj.minAcc, true);
    setMinAccCustom(configObj.minAccCustom, true);
    setNumbers(configObj.numbers, true);
    setPunctuation(configObj.punctuation, true);
    setHighlightMode(configObj.highlightMode, true);
    setAlwaysShowCPM(configObj.alwaysShowCPM, true);
    setHideExtraLetters(configObj.hideExtraLetters, true);
    setStartGraphsAtZero(configObj.startGraphsAtZero, true);
    setStrictSpace(configObj.strictSpace, true);
    setOppositeShiftMode(configObj.oppositeShiftMode, true);
    setMode(configObj.mode, true);
    setMonkey(configObj.monkey, true);
    setRepeatQuotes(configObj.repeatQuotes, true);

    LanguagePicker.setActiveGroup();

    try {
      setEnableAds(configObj.enableAds, true);
      let addemo = false;
      if (
        firebase.app().options.projectId === "monkey-type-dev-67af4" ||
        window.location.hostname === "localhost"
      ) {
        addemo = true;
      }

      if (config.enableAds === "max" || config.enableAds === "on") {
        if (config.enableAds === "max") {
          window["nitroAds"].createAd("nitropay_ad_left", {
            refreshLimit: 10,
            refreshTime: 30,
            renderVisibleOnly: false,
            refreshVisibleOnly: true,
            sizes: [["160", "600"]],
            report: {
              enabled: true,
              wording: "Report Ad",
              position: "bottom-right",
            },
            mediaQuery: "(min-width: 1330px)",
            demo: addemo,
          });
          $("#nitropay_ad_left").removeClass("hidden");

          window["nitroAds"].createAd("nitropay_ad_right", {
            refreshLimit: 10,
            refreshTime: 30,
            renderVisibleOnly: false,
            refreshVisibleOnly: true,
            sizes: [["160", "600"]],
            report: {
              enabled: true,
              wording: "Report Ad",
              position: "bottom-right",
            },
            mediaQuery: "(min-width: 1330px)",
            demo: addemo,
          });
          $("#nitropay_ad_right").removeClass("hidden");
        } else {
          $("#nitropay_ad_left").remove();
          $("#nitropay_ad_right").remove();
        }

        window["nitroAds"].createAd("nitropay_ad_footer", {
          refreshLimit: 10,
          refreshTime: 30,
          renderVisibleOnly: false,
          refreshVisibleOnly: true,
          sizes: [["970", "90"]],
          report: {
            enabled: true,
            wording: "Report Ad",
            position: "bottom-right",
          },
          mediaQuery: "(min-width: 1025px)",
          demo: addemo,
        });
        $("#nitropay_ad_footer").removeClass("hidden");

        window["nitroAds"].createAd("nitropay_ad_footer2", {
          refreshLimit: 10,
          refreshTime: 30,
          renderVisibleOnly: false,
          refreshVisibleOnly: true,
          sizes: [["728", "90"]],
          report: {
            enabled: true,
            wording: "Report Ad",
            position: "bottom-right",
          },
          mediaQuery: "(min-width: 730px) and (max-width: 1024px)",
          demo: addemo,
        });
        $("#nitropay_ad_footer2").removeClass("hidden");

        window["nitroAds"].createAd("nitropay_ad_footer3", {
          refreshLimit: 10,
          refreshTime: 30,
          renderVisibleOnly: false,
          refreshVisibleOnly: true,
          sizes: [["320", "50"]],
          report: {
            enabled: true,
            wording: "Report Ad",
            position: "bottom-right",
          },
          mediaQuery: "(max-width: 730px)",
          demo: addemo,
        });
        $("#nitropay_ad_footer3").removeClass("hidden");

        window["nitroAds"].createAd("nitropay_ad_about", {
          refreshLimit: 10,
          refreshTime: 30,
          renderVisibleOnly: false,
          refreshVisibleOnly: true,
          report: {
            enabled: true,
            wording: "Report Ad",
            position: "bottom-right",
          },
          demo: addemo,
        });
        $("#nitropay_ad_about").removeClass("hidden");

        window["nitroAds"].createAd("nitropay_ad_settings1", {
          refreshLimit: 10,
          refreshTime: 30,
          renderVisibleOnly: false,
          refreshVisibleOnly: true,
          report: {
            enabled: true,
            wording: "Report Ad",
            position: "bottom-right",
          },
          demo: addemo,
        });
        $("#nitropay_ad_settings1").removeClass("hidden");

        window["nitroAds"].createAd("nitropay_ad_settings2", {
          refreshLimit: 10,
          refreshTime: 30,
          renderVisibleOnly: false,
          refreshVisibleOnly: true,
          report: {
            enabled: true,
            wording: "Report Ad",
            position: "bottom-right",
          },
          demo: addemo,
        });
        $("#nitropay_ad_settings2").removeClass("hidden");

        window["nitroAds"].createAd("nitropay_ad_account", {
          refreshLimit: 10,
          refreshTime: 30,
          renderVisibleOnly: false,
          refreshVisibleOnly: true,
          report: {
            enabled: true,
            wording: "Report Ad",
            position: "bottom-right",
          },
          demo: addemo,
        });
        $("#nitropay_ad_account").removeClass("hidden");
      } else {
        $(".footerads").remove();
        $("#nitropay_ad_left").remove();
        $("#nitropay_ad_right").remove();
        $("#nitropay_ad_footer").remove();
        $("#nitropay_ad_footer2").remove();
        $("#nitropay_ad_footer3").remove();
        $("#nitropay_ad_settings1").remove();
        $("#nitropay_ad_settings2").remove();
        $("#nitropay_ad_account").remove();
        $("#nitropay_ad_about").remove();
      }
    } catch (e) {
      Notifications.add("Error initialising ads: " + e.message);
      console.log("error initialising ads " + e.message);
      $(".footerads").remove();
      $("#nitropay_ad_left").remove();
      $("#nitropay_ad_right").remove();
      $("#nitropay_ad_footer").remove();
      $("#nitropay_ad_footer2").remove();
      $("#nitropay_ad_footer3").remove();
      $("#nitropay_ad_settings1").remove();
      $("#nitropay_ad_settings2").remove();
      $("#nitropay_ad_account").remove();
      $("#nitropay_ad_about").remove();
    }
  }
  TestUI.updateModesNotice();
}

export function reset() {
  config = {
    ...defaultConfig,
  };
  apply();
  saveToCookie();
}

export function loadFromCookie() {
  console.log("loading cookie config");
  // let newConfig = $.cookie("config");
  let newConfig = Misc.getCookie("config");
  if (newConfig !== undefined && newConfig !== "") {
    try {
      newConfig = JSON.parse(newConfig);
    } catch (e) {
      newConfig = {};
    }
    apply(newConfig);
    console.log("applying cookie config");
    cookieConfig = newConfig;
    saveToCookie(true);
    console.log("saving cookie config");
  }
  TestLogic.restart(false, true);
  loadDone();
}

export let loadPromise = new Promise((v) => {
  loadDone = v;
});

export default config;