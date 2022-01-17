const fs = require('fs')
const path = require('path')
const root = path.resolve(process.env.APPDATA, "../LocalLow/Team Cherry/Hollow Knight/Randomizer 4/Recent/")
const helperLog = path.resolve(root, "HelperLog.txt")
const modLog = path.resolve(root, "../../ModLog.txt")
const output = "HKAutotrack.md"
const lastOut = "localTracker.md"

const r_helperLocation = /[a-zA-Z0-9_]*(?=\[)/
const r_locationLogic = /[a-zA-Z0-9_]*(?=(\[| |$))/

var transitionTable = {}
var checkTable = {}
var avaliableTransitionTable = {}

const special = {
   Crossroads_04: [ 'Salubra Bench', 'bench' ],
   Tutorial_01: [ 'Start', 'start' ],
   RestingGrounds_12: [ 'Grey Mourner Bench', 'bench' ],
   RestingGrounds_09: [ 'Resting Grounds Stag Station', 'bench' ],
   Deepnest_East_06: [ 'Oro Bench', 'bench' ],
   Room_mapper: [ 'Iselda', 'shop' ],
   Town: [ 'Dirtmouth', 'bench' ],
   Deepnest_10: [ 'Distant Village', undefined ],
   RestingGrounds_07: [ 'Seer', 'shop' ],
   White_Palace_03_hub: [ 'White Palace Atrium', 'bench' ],
   Ruins_House_03: [ 'Eternal Emilitia', undefined ],
   Fungus3_archive: [ 'Archives Bench', 'bench' ],
   Mines_29: [ 'Mines Dark Room Bench', 'bench' ],
   Ruins1_02: [ 'Quirrel Bench', 'bench' ],
   Ruins1_31: [ 'Ruins Toll Bench', 'bench' ],
   Room_temple: [ 'Temple', 'temple' ],
   Fungus1_16_alt: [ 'Greenpath Stag Station', 'bench' ],
   Crossroads_47: [ 'Crossroads Stag Station', 'bench' ],
   Room_Ouiji: [ 'Jiji', undefined ],
   Room_Colosseum_02: [ 'Colosseum Bench', 'bench' ],
   Fungus1_15: [ 'Sheo Bench', 'bench' ],
   Crossroads_30: [ 'Crossroads Hot Spring Bench', 'bench' ],
   Deepnest_09: [ 'Deepnest Stag Station', 'stag' ],
   Deepnest_30: [ 'Deepnest Hotspring Bench', 'bench' ],
   Crossroads_46: [ 'Upper Tram Left', undefined ],
   Ruins2_06: [ 'Kings Station', undefined ],
   Fungus2_13: [ 'Bretta Bench', 'bench' ],
   Ruins_Bathhouse: [ 'Pleasure House Bench', 'bench' ],
   Abyss_18: [ 'Basin Toll Bench', 'bench' ],
   Crossroads_ShamanTemple: [ 'Ancestral Mounds Bench', 'bench' ],
   Fungus2_31: [ 'Mantis Village Bench', 'bench' ],
   Ruins1_29: [ 'City Storerooms', 'bench' ],
   Mines_18: [ 'Crystal Guardian Bench', 'bench' ],
   White_Palace_01: [ 'White Palace Entrance', 'bench' ],
   Fungus3_40: [ 'Gardens Stag Station', 'bench' ],
   Fungus3_50: [ 'Gardens Toll Bench', 'bench' ],
   Deepnest_Spider_Town: [ 'Beast\'s Den', undefined ],
   Deepnest_14: [ 'Failed Tramway Bench', 'bench' ],
   Room_Slug_Shrine: [ 'Unn Bench', 'bench' ],
   White_Palace_06: [ 'White Palace Balcony', 'bench' ],
   Abyss_03: [ 'Lower Tram Center', undefined ],
   Fungus1_31: [ 'Greenpath Toll Bench', 'bench' ],
   Ruins2_08: [ 'Kings Station Bench', 'bench' ],
   Fungus2_02: [ 'Queens Station Stag', 'bench' ],
   Ruins1_18: [ 'Watcher\'s Spire', 'Bench' ],
   Fungus1_37: [ 'Stone Sanctuary Bench', 'bench' ],
   Room_Charm_Shop: [ 'Salubra', 'shop' ],
   Fungus1_01b: [ 'Greenpath Waterfall Bench', 'bench' ]
}


const classDefs = `
classDef stag fill:#a775d9;
classDef shop fill:#946513;
classDef bench fill:#138d94;
classDef transition stroke-width:4px,stroke:#d68b00;
classDef check color:#3ab020;
classDef last fill:#022e00;
`

var locationData = JSON.parse(fs.readFileSync('locations.json'))
var termsData = JSON.parse(fs.readFileSync('terms.json'))
var locationLogic = {}

termsData.push("RIGHTBALDURS")

var regexTerms = new RegExp(termsData.join("|"), "g")

for (const location of locationData) {
   var logic = location.logic.replaceAll(regexTerms, "")
   locationLogic[location.name] = logic.match(r_locationLogic)?.[0]
}

async function start() {
   console.log("...Starting tracker...")
   updateTracker()
   updateLocation()
   fs.watchFile(helperLog, { interval: 500 }, async (curr, prev) => {
      updateTracker()
   })
   fs.watchFile(modLog, { interval: 500 }, async (curr, prev) => {
      updateLocation()
   })
   console.log("Tracker running, you may now minimise this window.")
}

function updateTracker() {
   var transitionData = ""
   var checkData = ""
   var lastTransition = ""
   const helperLogFile = fs.readFileSync(helperLog, 'utf-8').replaceAll(/\*/g, "")

   var startInfo = false
   var startItemChecks = false
   var startTransition = false
   const r_transStart = /UNCHECKED REACHABLE TRANSITIONS$/
   const r_itemStart = /UNCHECKED REACHABLE LOCATIONS$/
   const r_transitionStart = /CHECKED TRANSITIONS$/
   const r_transitionFrom = /^[a-zA-Z0-9_]*/
   const r_transitionTo = /(?<=-->)[a-zA-Z0-9_]*/
   const r_doorTransitions = /(?<=\[)[a-zA-Z0-9_]*(?=\])/g
   helperLogFile.split(/\r?\n/).forEach(line =>  {
      if (startTransition) {
         if (line.replaceAll(/\r?\n? /g) == "") {
            startTransition = false
         } else {
            var trimmedLine = line.replaceAll(/\r?\n? /g, "")
            var transitionFrom = trimmedLine.match(r_transitionFrom)[0]
            var transitionTo = trimmedLine.match(r_transitionTo)[0]
            var doorFrom = trimmedLine.match(r_doorTransitions)[0]
            var doorTo = trimmedLine.match(r_doorTransitions)[1]
            if (transitionTo && transitionFrom) {
               lastTransition = `${transitionFrom}:::last`
               if (!transitionTable[transitionFrom]) { transitionTable[transitionFrom] = {} }
               transitionTable[transitionFrom][doorFrom] = [transitionTo, doorTo]
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
            avaliableTransitionTable[transitionLocation] = true
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
               checkTable[locationLogic[item]] = true
            }
         }
      }
      if (!startItemChecks && r_itemStart.test(line)) {
         startItemChecks = true
      }
   })

   var connections = {}
   for (const [location, doors] of Object.entries(transitionTable)) {
      var subgraph = ``
      for (const [fromDoor, toId] of Object.entries(doors)) {
         if (connections[`${toId[0]}:${toId[1]}`] != `${location}:${fromDoor}`) {
            var nameFrom = special[location]?.[0] ?? location
            var nameTo = special[toId[0]]?.[0] ?? toId[0]
            subgraph += `${location}([${nameFrom}]) --- ${toId[0]}([${nameTo}])\n`
            connections[`${location}:${fromDoor}`] = `${toId[0]}:${toId[1]}`
            if (special[location]?.[1]) {
               subgraph += `${location}:::${special[location][1]}\n`
            }
            if (special[toId[0]]?.[1]) {
               subgraph += `${toId[0]}:::${special[toId[0]][1]}\n`
            }
         }
      }
      transitionData += subgraph
   }

   transitionData += lastTransition
   fs.writeFile(output, `\`\`\`mermaid\nflowchart TD\n${classDefs}\n\n${transitionData}\n${checkData}`, (err) => {
      if (err) throw err
   })
}

function updateLocation() {
   const r_transitionChange = /(?<=\[INFO\]:\[Hkmp\.Game\.Client\.ClientManager\] ).*(?=\n|$)/gm
   const modLogFile = fs.readFileSync(modLog, 'utf-8')
   const location = modLogFile.match(r_transitionChange)?.at(-1).match(/\b(\w+)$/)[0]
   
   var doors = transitionTable[location]
   var secondLayer = []
   var transitionData = ``
   if (!location || !doors) { return }
   for (const [fromDoor, toId] of Object.entries(doors)) {
         var nameFrom = special[location]?.[0] ?? location
         var nameTo = special[toId[0]]?.[0] ?? toId[0]
         transitionData += `${location}([${nameFrom}]) -- ${fromDoor} --> ${toId[0]}([${nameTo}])\n`
         secondLayer.push(toId[0])
         if (special[location]?.[1]) {
            transitionData += `${location}:::${special[location][1]}\n`
         }
         if (special[toId[0]]?.[1]) {
            transitionData += `${toId[0]}:::${special[toId[0]][1]}\n`
         }
   }
   for (const location2 of secondLayer) {
      doors = transitionTable[location2]
      for (const [fromDoor, toId] of Object.entries(doors)) {
         var nameFrom = special[location2]?.[0] ?? location2
         var nameTo = special[toId[0]]?.[0] ?? toId[0]
         transitionData += `${location2}([${nameFrom}]) -- ${fromDoor} --> ${toId[0]}([${nameTo}])\n`
         if (special[location2]?.[1]) {
            transitionData += `${location2}:::${special[location2][1]}\n`
         }
         if (special[toId[0]]?.[1]) {
            transitionData += `${toId[0]}:::${special[toId[0]][1]}\n`
         }
      }
   }
   secondLayer.push(location)
   for (const room of secondLayer) {
      if (checkTable[room]) {
         transitionData += `${room}:::check\n`
      }
      if (avaliableTransitionTable[room]) {
         transitionData += `${room}:::transition\n`
      }
   }

   fs.writeFile(lastOut, `\`\`\`mermaid\nflowchart TD\n${classDefs}\n\n${transitionData}`, (err) => {
      if (err) throw err
   })
}

start()

