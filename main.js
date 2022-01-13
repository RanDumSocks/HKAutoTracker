const fs = require('fs')
const root = "C:\\Users\\Justin Chance\\AppData\\LocalLow\\Team Cherry\\Hollow Knight\\Randomizer 4\\Recent\\"
const helperLog = root + "HelperLog.txt"
const output = "HKAutotrack.md"

const r_transition = /^TRANSITION/
const r_toName = /(?<=--- {).*(?=\[.*\]} -->)/
const r_toEntry = /(?<=\[).*(?=]} -->)/
const r_fromName = /(?<=--> {).*(?=\[)/
const r_fromEntry = /[a-zA-Z0-9_]*(?=]}$)/
const r_helperLocation = /[a-zA-Z0-9_]*(?=\[)/
const r_locationLogic = /[a-zA-Z0-9_]*(?=(\[|$))/

const special = {
   "Crossroads_04": "{{Salubra Bench}}:::bench",
   "Tutorial_01": "((Start)):::start",
   "RestingGrounds_12": "{{Grey Mourner Bench}}:::bench",
   "RestingGrounds_09": "{{Resting Grounds Stag Station}}:::stag",
   "Deepnest_East_06": "{{Oro Bench}}:::bench",
   "Room_mapper": "{Iselda}:::shop",
   "Town": "{{Dirtmouth}}:::bench",
   "Deepnest_10": "[Distant Village]",
   "RestingGrounds_07": "{Seer}:::shop",
   "White_Palace_03_hub": "{{White Palace Atrium}}:::bench",
   "Ruins_House_03": "[Eternam Emilitia]",
   "Fungus3_archive": "{{Archives Bench}}:::bench",
   "Mines_29": "{{Mines Dark Room Bench}}:::bench",
   "Ruins1_02": "{{Quirrel Bench}}:::bench"
}

const classDefs = `
classDef stag fill:#a775d9;
classDef shop fill:#946513;
classDef bench fill:#138d94;
classDef transition stroke-width:4px,stroke:#d68b00;
classDef check color:#3ab020;
`

var locationDataRaw = fs.readFileSync('locations.json')
var locationData = JSON.parse(locationDataRaw)
var locationLogic = {}
for (const location of locationData) {
   locationLogic[location.name] = location.logic.match(r_locationLogic)[0]
}

async function start() {
   updateTracker()
   fs.watchFile(helperLog, { interval: 500 }, async (curr, prev) => {
      updateTracker()
   })
}

function updateTracker() {
   var connections = {}
   var transitionData = ""
   var checkData = ""
   const helperLogFile = fs.readFileSync(helperLog, 'utf-8')

   var startInfo = false
   var startItemChecks = false
   var startTransition = false
   const r_transStart = /UNCHECKED REACHABLE TRANSITIONS$/
   const r_itemStart = /UNCHECKED REACHABLE LOCATIONS$/
   const r_transitionStart = /CHECKED TRANSITIONS$/
   const r_transitionFrom = /^[a-zA-Z0-9_]*/
   const r_transitionTo = /(?<=-->)[a-zA-Z0-9_]*/
   helperLogFile.split(/\r?\n/).forEach(line =>  {
      if (startTransition) {
         if (line.replaceAll(/\r?\n? /g) == "") {
            startTransition = false
         } else {
            var trimmedLine = line.replaceAll(/\r?\n? /g, "")
            var trimmedLine = trimmedLine.replaceAll(/\*/g, "")
            var transitionFrom = trimmedLine.match(r_transitionFrom)[0]
            var transitionTo = trimmedLine.match(r_transitionTo)[0]
            if ( transitionTo && transitionFrom && connections[transitionTo] != transitionFrom) {
               connections[transitionFrom] = transitionTo
               if (special[transitionFrom]) {transitionFrom += special[transitionFrom]}
               if (special[transitionTo]) {transitionTo += special[transitionTo]}
               transitionData += `${transitionFrom} --- ${transitionTo}\n`
            }
         }
      }
      if (!startTransition && r_transitionStart.test(line)) {
         startTransition = true
      }
      if (startInfo) {
         if (line.replaceAll(/\r?\n? /g) == "") {
            startInfo = false
         } else {
            var transitionLocation = line.match(r_helperLocation)[0]
            checkData += `${transitionLocation}:::transition\n`
         }
      }
      if (!startInfo && r_transStart.test(line)) {
         startInfo = true
      }
      if (startItemChecks) {
         if (line.replaceAll(/\r?\n? /g) == "") {
            startItemChecks = false
         } else {
            var item = line.replaceAll(/\r?\n? /g, "")
            if (locationLogic[item]){
               checkData += `${locationLogic[item]}:::check\n`
            }
         }
      }
      if (!startItemChecks && r_itemStart.test(line)) {
         startItemChecks = true
      }
   })

   fs.writeFile(output, `\`\`\`mermaid\nflowchart LR\n${classDefs}\n\n${transitionData}\n${checkData}`, (err) => {
      if (err) throw err
   })
}

start()

