const state = {
    page: 0,
    subsystem: "Stbd Batt",
    isLoading: false
};

function loadPage(page, subsystem) {
    state.page = page;
    state.subsystem = subsystem;
    //if (state.isLoading) return; // Prevent overlap
    state.isLoading = true;
    size=3;

    //console.log("Calling  loadPage in Index...");
    fetch(`/table_partial?page=${page}&subsystem=${encodeURIComponent(subsystem)}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('table-container').innerHTML = html;
        })
        .finally(() => {
            console.log("loadPage .finally");
            //state.isLoading = false;
        });
    fetch(`/table_ids?page=${page}&subsystem=${encodeURIComponent(subsystem)}&size=${size}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('special-data').innerHTML = html;
        })
        .finally(() => {
            console.log("loadPage .finally");
            state.isLoading = false;
        }); 
    
}






function alarm_test() {          
    fetch(`/alarm-test`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('alarm-test').innerHTML = html;
        })
}




async function fetchList() {
    const res = await fetch('/get');
    const data = await res.json();
    renderList(data.parameter_ids);
}

function renderList(ids) {
    const list = document.getElementById('paramList');
    list.innerHTML = '';
    ids.forEach(id => {
        const li = document.createElement('li');
        li.textContent = id + ' ';

        const button = document.createElement('button');
        button.textContent = 'Remove';
        button.onclick = () => removeParam(id);

        li.appendChild(button);
        list.appendChild(li);
    });
}

async function addParam(id) {
    const val = id; /*parseInt(document.getElementById('paramInput').value);*/
    if (!isNaN(val)) {
        await fetch('/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({parameter_id: val})
        });
        fetchList();
    }
}

async function removeParam(id) {
    await fetch('/remove', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({parameter_id: id})
    });
    fetchList();
}

async function toggleParam(id) {
    const val = id;
    if (!isNaN(val)) {
        const res = await fetch('/get');
        const data = await res.json();
        const alreadyExists = data.parameter_ids.includes(val);

        const url = alreadyExists ? '/remove' : '/add';

        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({parameter_id: val})
        });

        fetchList();
    }
}


function pin_param(id){
    addParam(id);
}

function toggleAlarms(){
    alarm_box = document.getElementById("alarm-box")
    if(alarm_box.classList.contains('gone')){
        alarm_box.classList.remove('gone');
    }else{
        alarm_box.classList.add('gone');
    }
}

function updateDateTime() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${dd}.${mm}.${yy} ${hh}:${min}:${ss}`;
    document.getElementById('datetime').textContent = formattedDateTime;
}

function change_subsystem(clicked_elem, chosen_subsystem) {
    categories.forEach(category => {
        category.classList.remove('selected');
    });
    clicked_elem.classList.add('selected');
    cur_subsystem = chosen_subsystem
    loadPage(0, chosen_subsystem)
}





// Test adding data components
function duplicateElement(elementId, times) {
    const element = document.getElementById(elementId);
    if (element) {
        for (let i = 0; i < times; i++) {
            const clone = element.cloneNode(true);
            document.getElementById("data").appendChild(clone);
        }
    }
}