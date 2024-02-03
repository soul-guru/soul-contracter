"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.occurrences = exports.stdout = void 0;
function stdout(out) {
    log(out);
}
exports.stdout = stdout;
function occurrences(string, subString, allowOverlapping = false) {
    string += "";
    subString += "";
    if (subString.length <= 0)
        return (string.length + 1);
    var n = 0, pos = 0, step = allowOverlapping ? 1 : subString.length;
    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        }
        else
            break;
    }
    return n;
}
exports.occurrences = occurrences;
const STDOUT_SYS_BANNER = "░▄▀▀░▀▄▀░▄▀▀░░░█▒█░█▄▒▄█░▒░░▄▀▀░▄▀▄▒█▀▄▒██▀\n" +
    "▒▄██░▒█▒▒▄██▒░░▀▄▀░█▒▀▒█░▀▀░▀▄▄░▀▄▀░█▀▄░█▄▄";
stdout(STDOUT_SYS_BANNER);
const self = this;
let systemNetworkAsAxios = () => SYSTEM.axios;
//# sourceMappingURL=init.js.map