let db; 

window.addEventListener("online", syncWithRemote)

const connection = indexedDB.open('pwa-budget',1);

connection.onupgradeneeded = function(event){
    db = event.target.result;
    db.createObjectStore("open-transactions", {autoIncrement: true})
}

connection.onsuccess = function(event){
    db = event.target.result;
    if(navigator.online){
        // get from real database
        syncWithRemote()
    }
}
connection.onerror = function(event){
    console.log("error indexed: ", event);
}

function accessStore(){
    const transaction =  db.transaction("open-transactions", "readwrite");
    return transaction.objectStore("open-transactions");
}

function saveRecord(entry){
    // if request failed

    const store = accessStore();
    store.add(entry);
}

async function sendToServer(entries){}

async function syncWithRemote(){
    // read store
    const store = accessStore();
    const allEntries = store.getAll();
    allEntries.onsuccess = function(){
        if(allEntries.results.length>0){
            try{
                let received = await sendToServer(allEntries.result);
            } catch(e){
                console.log('Failed to synchronize with remote')
            }
            

        }

    }
    // if not empty -> send to remote
    // clear store
}