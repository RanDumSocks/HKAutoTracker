console.log("...Starting tracker...")
const fs = require('fs')
const path = require('path')
const root = path.resolve(process.env.APPDATA, "../LocalLow/Team Cherry/Hollow Knight/Randomizer 4/Recent/")
const helperLog = path.resolve(root, "HelperLog.txt")
const modLog = path.resolve(root, "../../ModLog.txt")
const modLogAppend = path.resolve(root, "../../ModLogAppend.txt")
const spoilerLog = path.resolve(root, "RawSpoiler.json")
const dict = "mapDict.json"
const output = "HKAutotrack.md"
const lastOut = "localTracker.md"
const rightOut = "rightLocations.md"
const settingsFile = "settings.json"

const r_helperLocation = /[a-zA-Z0-9_]*(?=\[)/
const r_locationLogic = /[a-zA-Z0-9_]*(?=(\[| |$))/

var mapTrackerString = ""
var rightLocationString = ""
var localTrackerString = ""

var transitionTable = {}
var checkTable = {}
var avaliableTransitionTable = {}
var lastLocation = ""

const specialCustom = {
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
   Fungus1_01b: [ 'Greenpath Waterfall Bench', 'bench' ],
   Fungus2_26: [ 'Leg Eater', 'shop'],
   Room_Town_Stag_Station: ["Dirtmouth Stag", "stag"],
   Abyss_22: ["Hidden Station", "bench"],
   Crossroads_38: ["Grubfather", "shop"]
}
const special = { ...JSON.parse(fs.readFileSync(dict)), ...specialCustom }

const classDefs = `
classDef stag fill:#a775d9;
classDef shop fill:#946513;
classDef bench fill:#138d94;
classDef transition stroke-width:4px,stroke:#d68b00;
classDef check color:#3ab020;
classDef last fill:#022e00;
`

var locationData = JSON.parse(fs.readFileSync(spoilerLog))
var termsData = JSON.parse(fs.readFileSync('terms.json'))
var locationLogic = {}

termsData.push("RIGHTBALDURS")

var regexTerms = new RegExp(termsData.join("|"), "g")

for (const itemSpoiler of locationData.itemPlacements) {
   var logic = itemSpoiler.location.logic.logic.replaceAll(regexTerms, "")
   locationLogic[itemSpoiler.location.logic.name] = logic.match(r_locationLogic)?.[0]
}

var options = {}
{ // Load options

   let defaultOptions = {
      translationType: 'full',
      mapOrientation: 'LR'
   }

   if (fs.existsSync(settingsFile)) {
      try {
         options = {...defaultOptions, ...JSON.parse(fs.readFileSync(settingsFile))}
      } catch (err) {
         console.log("Settings file corrupt, resetting to default settings.")
         options = defaultOptions
      }
   } else {
      options = defaultOptions
   }
   fs.writeFile(settingsFile, JSON.stringify(options, null, 3), (err) => {
      if (err) throw err
   })

   if (!['full', 'basic', 'landmark', 'none'].includes(options.translationType)) {
      console.log(`Invalid translationType option "${options.translationType}". Must be either "full", "basic", "landmark", or "none".`)
   }
   if (!['TB', 'TD', 'BT', 'RL', 'LR'].includes(options.mapOrientation)) {
      console.log(`Invalid mapOrientation option "${options.mapOrientation}". Must be either "TB", "TD", "BT", "RL", or "LR".`)
   }
}

async function start() {
   updateLocation()
   updateTracker()
   updateFiles()
   fs.watchFile(helperLog, { interval: 500 }, async (curr, prev) => {
      updateTracker()
      updateLocation()
      updateFiles()
   })
   fs.watchFile(modLog, { interval: 500 }, async (curr, prev) => {
      updateTracker()
      updateLocation()
      updateTracker()
      updateFiles()
   })
   console.log("Tracker running, you may now minimise this window.")
}

function updateTracker() {
   var transitionData = ""
   rightLocationString = ""
   checkTable = {}
   avaliableTransitionTable = {}
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
   const r_right = /right/g
   helperLogFile.split(/\r?\n/).forEach(line => {
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

            avaliableTransitionTable[transitionLocation] = true
            if (r_right.test(line)) {
               rightLocationString += `- ${transitionLocation}\n`
            }
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
            var nameFrom = location
            var nameTo = toId[0]
            subgraph += `${styleRoom(nameFrom)} --- ${styleRoom(nameTo)}\n${checkRoom(nameFrom)}${checkRoom(nameTo)}`
            connections[`${location}:${fromDoor}`] = `${toId[0]}:${toId[1]}`
         }
      }
      transitionData += subgraph
   }

   mapTrackerString = `\`\`\`mermaid\nflowchart ${options.mapOrientation}\n${classDefs}\n\n${transitionData}`
}

function updateLocation() {
   const r_transitionChange = /(?<=\[INFO\]:\[Hkmp\.Game\.Client\.ClientManager\] Scene changed from ).*(?=\n|$)/gm
   const modLogFile = fs.readFileSync(modLog, 'utf-8')

   fs.truncate(modLog, 0, () => {})
   fs.appendFile(modLogAppend, modLogFile, (err) => { if (err) throw err })

   const location = modLogFile.match(r_transitionChange)?.at(-1).match(/\b(\w+)$/)[0]
   
   { // Local map
      var doors = transitionTable[location]
      var secondLayer = []
      var transitionData = ``
      var chartLocal = ""
      if (!location || !doors || lastLocation == location) { return }
      lastLocation = location
      for (const [fromDoor, toId] of Object.entries(doors)) {
            var nameFrom = location
            var nameTo = toId[0]
            transitionData += `${styleRoom(nameFrom)} -- ${fromDoor} --> ${styleRoom(nameTo)}\n${checkRoom(nameFrom)}${checkRoom(nameTo)}`
            secondLayer.push(toId[0])
      }
      for (const location2 of secondLayer) {
         doors = transitionTable[location2]
         for (const [fromDoor, toId] of Object.entries(doors)) {
            var nameFrom = location2
            var nameTo = toId[0]
            transitionData += `${styleRoom(nameFrom)} -- ${fromDoor} --> ${styleRoom(nameTo)}\n${checkRoom(nameFrom)}${checkRoom(nameTo)}`
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
      transitionData += `${lastLocation}:::last\n`
      chartLocal = `# Local map\n\`\`\`mermaid\nflowchart LR\n${classDefs}\n\n${transitionData}\n\`\`\`\n`
   }

   { // Nearest Transition
      var BFSqueue = []
      var visited = {}
      var dist = {}
      var pred = {}
      var foundTransition = false
      var foundCheck = false
      var transitionString = ""
      var checkString = ""
      var transitionChart = ""
      var checkChart = ""

      visited[location] = true
      dist[location] = 0
      BFSqueue.push(location)

      while (BFSqueue.length != 0) {
         var u = BFSqueue.shift()
         if (!transitionTable[u]) { continue }
         for (const frontVal of Object.values(transitionTable[u])) {
            const front = frontVal[0]
            if (!visited[front]) {
               visited[front] = true
               dist[front] = dist[u] + 1
               pred[front] = u

               BFSqueue.push(front)
               if (avaliableTransitionTable[front] && !foundTransition) {
                  foundTransition = true
                  // Generate Path
                  var currPrint = u
                  var predPrint = pred[u]
                  while (predPrint) {
                     var door = ""
                     for (const [doorTrans, toRoom] of Object.entries(transitionTable[currPrint])) { // Find door
                        if (toRoom[0] == predPrint) {
                           door = toRoom[1]
                           break
                        }
                     }
                     transitionString += `${styleRoom(predPrint)} -- ${door} --> ${styleRoom(currPrint)}\n${checkRoom(currPrint)}${checkRoom(predPrint)}`
                     currPrint = predPrint
                     predPrint = pred[currPrint]
                  }
                  for (const [doorTrans, toRoom] of Object.entries(transitionTable[front])) { // Find door
                     if (toRoom[0] == u) {
                        door = toRoom[1]
                        break
                     }
                  }
                  transitionString += `${styleRoom(u)} -- ${door} --> ${styleRoom(front)}\n${checkRoom(u)}${checkRoom(front)}`
               }
               if (checkTable[front] && !foundCheck) {
                  foundCheck = true
                  // Generate Path
                  var currPrint = u
                  var predPrint = pred[u]
                  while (predPrint) {
                     var door = ""
                     for (const [doorTrans, toRoom] of Object.entries(transitionTable[currPrint])) { // Find door
                        if (toRoom[0] == predPrint) {
                           door = toRoom[1]
                           break
                        }
                     }
                     checkString += `${styleRoom(predPrint)} -- ${door} --> ${styleRoom(currPrint)}\n${checkRoom(currPrint)}${checkRoom(predPrint)}`
                     currPrint = predPrint
                     predPrint = pred[currPrint]
                  }
                  for (const [doorTrans, toRoom] of Object.entries(transitionTable[front])) { // Find door
                     if (toRoom[0] == u) {
                        door = toRoom[1]
                        break
                     }
                  }
                  checkString += `${styleRoom(u)} -- ${door} --> ${styleRoom(front)}\n${checkRoom(u)}${checkRoom(front)}`
               }
            }
         }
         if (foundTransition && foundCheck) { break }
      }
      transitionChart = `# Nearest transition\n\`\`\`mermaid\nflowchart LR\n${classDefs}\n${transitionString}\n\`\`\`\n`
      checkChart = `# Nearest check\n\`\`\`mermaid\nflowchart LR\n${classDefs}\n${checkString}\n\`\`\`\n`
   }

   localTrackerString = `${chartLocal}${transitionChart}${checkChart}`
}

function styleRoom(room) {
   var name = ""
   if (options.translationType == 'full') {
      name = special[room] ? `${room}([${special[room][0].replaceAll(/_/g, " ")}])` : `${room}([${room}])`
   } else if (options.translationType == 'basic') {
      name = special[room] && special[room]?.[1] && (special[room][1] == 'bench' || special[room][1] == 'shop' || special[room][1] == 'stag') ? `${room}([${special[room][0].replaceAll(/_/g, " ")}])` : `${room}([${room}])`
   } else if (options.translationType == 'landmark') {
      name = special[room] && specialCustom[room]?.[1] ? `${room}([${special[room][0].replaceAll(/_/g, " ")}])` : `${room}([${room}])`
   } else if (options.translationType == 'landmark') {
      name = `${room}([${room}])`
   }
   //var name = room
   if (lastLocation == room) {
      name = `${name}:::last`
   } else {
      name = special[room]?.[1] ? `${name}:::${special[room]?.[1]}` : name
   }
   return name
}

function checkRoom(room) {
   var addStyle = ""
   if (avaliableTransitionTable[room]) {
      addStyle += `${room}:::transition\n`
   }
   if (checkTable[room]) {
      addStyle += `${room}:::check\n`
   }
   return addStyle
}

var lastMapTrackerString = ""
var lastRightLocationString = ""
var lastLocalTrackerString = ""
async function updateFiles() {
   if (mapTrackerString != lastMapTrackerString) {
      fs.writeFile(output, mapTrackerString, (err) => {
         if (err) throw err
      })
      lastMapTrackerString = mapTrackerString
   }

   if (rightLocationString != lastRightLocationString) {
      fs.writeFile(rightOut, rightLocationString, (err) => {
         if (err) throw err
      })
      lastRightLocationString = rightLocationString
   }
   if (lastLocalTrackerString != localTrackerString) {
      fs.writeFile(lastOut, localTrackerString, (err) => {
         if (err) throw err
      })
      lastLocalTrackerString = localTrackerString
   }
}

start()

