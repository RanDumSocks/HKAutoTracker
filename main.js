const fs = require('fs')
const path = require('path')
const root = path.resolve(process.env.APPDATA, "../LocalLow/Team Cherry/Hollow Knight/Randomizer 4/Recent/")
const helperLog = path.resolve(root, "HelperLog.txt")
const output = "HKAutotrack.md"

const r_helperLocation = /[a-zA-Z0-9_]*(?=\[)/
const r_locationLogic = /[a-zA-Z0-9_]*(?=(\[| |$))/

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
   "Ruins1_02": "{{Quirrel Bench}}:::bench",
   "Ruins1_31": "{{Ruins Toll Bench}}:::bench",
   "Room_temple": "[(Temple)]:::temple",
   "Fungus1_16_alt": "{{Greenpath Stag Station}}:::bench",
   "Crossroads_47": "{{Crossroads Stag Station}}:::bench",
   "Room_Ouiji": "[Jiji]",
   "Room_Colosseum_02": "{{Colosseum Bench}}:::bench",
   "Fungus1_15": "{{Sheo Bench}}:::bench",
   "Crossroads_30": "{{Crossroads Hot Spring Bench}}:::bench",
   "Deepnest_09": "{{Deepnest Stag Station}}:::stag",
   "Deepnest_30": "{{Deepnest Hotspring Bench}}:::bench",
   "Crossroads_46": "[Upper Tram Left]",
   "Ruins2_06": "[Kings Station]",
   "Fungus2_13": "{{Bretta Bench}}:::bench",
   "Ruins_Bathhouse": "{{Pleasure House Bench}}:::bench",
   "Abyss_18": "{{Basin Toll Bench}}:::bench",
   "Crossroads_ShamanTemple": "{{Ancestral Mounds Bench}}:::bench",
   "Fungus2_31": "{{Mantis Village Bench}}:::bench",
   "Ruins1_29": "{{City Storerooms}}:::bench",
   "Mines_18": "{{Crystal Guardian Bench}}:::bench",
   "White_Palace_01": "{{White Palace Entrance}}:::bench",
   "Fungus3_40": "{{Gardens Stag Station}}:::bench",
   "Fungus3_50": "{{Gardens Toll Bench}}:::bench",
   "Deepnest_Spider_Town": "{{Beast's Den}}:::bench",
   "Deepnest_14": "{{Failed Tramway Bench}}:::bench",
   "Room_Slug_Shrine": "{{Unn Bench}}:::bench",
   "White_Palace_06": "{{White Palace Balcony}}:::bench"
}

const classDefs = `
classDef stag fill:#a775d9;
classDef shop fill:#946513;
classDef bench fill:#138d94;
classDef transition stroke-width:4px,stroke:#d68b00;
classDef check color:#3ab020;
classDef last fill:#022e00;
`

var locationDataRaw = fs.readFileSync('locations.json')
var locationData = JSON.parse(locationDataRaw)
var locationLogic = {}
for (const location of locationData) {
   locationLogic[location.name] = location.logic.match(r_locationLogic)?.[0]
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
   var lastTransition = ""
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
               lastTransition = `${transitionTo}:::last\n`
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
            if (locationLogic[item]) {
               checkData += `${locationLogic[item]}:::check\n`
            }
         }
      }
      if (!startItemChecks && r_itemStart.test(line)) {
         startItemChecks = true
      }
   })

   transitionData += lastTransition
   fs.writeFile(output, `\`\`\`mermaid\nflowchart TD\n${classDefs}\n\n${transitionData}\n${checkData}`, (err) => {
      if (err) throw err
   })
}

start()

