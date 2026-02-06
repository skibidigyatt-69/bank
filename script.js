// Dark Mode
window.addEventListener('DOMContentLoaded', () => {
    const darkMode = localStorage.getItem('darkMode');
    if(darkMode === 'enabled') document.body.classList.add('dark');
});
function toggleDarkMode(){
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'enabled':'disabled');
}

// Initialize mock accounts
if(!localStorage.getItem('accounts')){
    localStorage.setItem('accounts', JSON.stringify([
        {name:'John Doe', balance:1000},
        {name:'Jane Smith', balance:2500},
        {name:'Alice Johnson', balance:1800}
    ]));
}

// Tabs
function showTab(tabId){
    document.querySelectorAll('.dashboard-tab').forEach(t=>t.style.display='none');
    document.getElementById(tabId).style.display='block';
}

// Admin Login
function adminLogin(){
    const u = document.getElementById('admin-username').value;
    const p = document.getElementById('admin-password').value;
    const e = document.getElementById('login-error');
    if(u==='admin' && p==='admin'){
        document.getElementById('login').style.display='none';
        document.getElementById('admin-dashboard').style.display='block';
        e.textContent='';
        renderAccounts();
        populateSelects();
        showTab('deposit-tab');
    } else e.textContent='Incorrect username or password';
}

// Render Accounts Table
function renderAccounts(){
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    const tbody = document.getElementById('account-table-body');
    tbody.innerHTML='';
    accounts.forEach((acc,i)=>{
        const row=document.createElement('tr');
        row.innerHTML=`
        <td>${acc.name}</td>
        <td>${acc.balance.toFixed(2)}</td>
        <td><input type="number" id="dep-${i}" placeholder="0"></td>
        <td><input type="number" id="with-${i}" placeholder="0"></td>
        <td>
            <button onclick="updateAccount(${i})">Update</button>
            <button onclick="deleteAccount(${i})" style="background:#ff4d4d;color:#fff;">Delete</button>
        </td>`;
        tbody.appendChild(row);
    });
    populateSelects();
}

// Deposit/Withdraw
function updateAccount(i){
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    const dep=parseFloat(document.getElementById(`dep-${i}`).value)||0;
    const wit=parseFloat(document.getElementById(`with-${i}`).value)||0;
    accounts[i].balance=Math.max(0, accounts[i].balance+dep-wit);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    renderAccounts();
}

// Delete
function deleteAccount(i){
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    accounts.splice(i,1);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    renderAccounts();
}

// Add Account
function addAccount(e){
    e.preventDefault();
    const n=document.getElementById('new-account-name').value;
    const b=parseFloat(document.getElementById('new-account-balance').value);
    if(n && !isNaN(b) && b>=0){
        const accounts=JSON.parse(localStorage.getItem('accounts'));
        accounts.push({name:n,balance:b});
        localStorage.setItem('accounts', JSON.stringify(accounts));
        renderAccounts();
        document.getElementById('add-account-form').reset();
    }
}

// Populate selects
function populateSelects(){
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    const from=document.getElementById('transfer-from');
    const to=document.getElementById('transfer-to');
    const req=document.getElementById('request-to');
    [from,to,req].forEach(s=>s.innerHTML='');
    accounts.forEach((acc,i)=>{
        const opt=`<option value="${i}">${acc.name}</option>`;
        from.innerHTML+=opt;
        to.innerHTML+=opt;
        req.innerHTML+=opt;
    });
}

// Transfer
function transferMoney(e){
    e.preventDefault();
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    const f=parseInt(document.getElementById('transfer-from').value);
    const t=parseInt(document.getElementById('transfer-to').value);
    const a=parseFloat(document.getElementById('transfer-amount').value);
    if(f===t){ alert("Cannot transfer to same account"); return; }
    if(a>0 && accounts[f].balance>=a){
        accounts[f].balance-=a;
        accounts[t].balance+=a;
        localStorage.setItem('accounts', JSON.stringify(accounts));
        renderAccounts();
        document.getElementById('transfer-form').reset();
    } else alert("Invalid transfer amount");
}

// Request Money
function requestMoney(e){
    e.preventDefault();
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    const t=parseInt(document.getElementById('request-to').value);
    const a=parseFloat(document.getElementById('request-amount').value);
    if(a>0){ accounts[t].balance+=a; localStorage.setItem('accounts', JSON.stringify(accounts)); renderAccounts(); document.getElementById('request-form').reset(); }
    else alert("Invalid amount");
}

// Logout
function logoutAdmin(){
    document.getElementById('admin-dashboard').style.display='none';
    document.getElementById('login').style.display='block';
}
