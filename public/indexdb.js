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

async function sendToServer(entries){
    return fetch("/api/transaction/bulk", {
        method: 'POST',
        body: JSON.stringify(entries),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
    }).then(res => res.json())
    
}

function syncWithRemote(){
    console.log('trying to sync');
    // read store
    const store = accessStore();
    const allEntries = store.getAll();
    allEntries.onsuccess = async function(){
        if(allEntries.result.length>0){
            try{
                let received = await sendToServer(allEntries.result);
                store.clear();
            } catch(e){
                console.log('Failed to synchronize with remote')
            }
            

        }

    }
    
}