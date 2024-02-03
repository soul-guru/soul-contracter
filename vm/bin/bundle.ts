import "lodash";

import './init'
import "./ModulesKit";

import $foundation from "./Foundation";
import safeSignal from "./opt/signal";
import {axios} from "./opt/axios";
import {Character} from "./classes/Character";

void $foundation;

safeSignal("_sys_ignore_", {}, "Great, sys.js is loaded! So cool. But what is this? Why are you listening to this signal? It doesn't have any value")

axios.toString()

Character.toString()